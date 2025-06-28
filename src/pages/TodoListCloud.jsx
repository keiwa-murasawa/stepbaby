import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useState as useReactState } from "react";
import Tooltip from "../components/Tooltip";
import { PencilSquareIcon, InformationCircleIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, ShareIcon, PencilIcon } from '@heroicons/react/24/outline';
import todoData from "../data/todoData.json";

// ステージ判定関数
function determineStage(dateString) {
  if (!dateString) return null;
  const now = new Date();
  const inputDate = new Date(dateString);
  const diffTime = now - inputDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffTime < 0) {
    const diffWeeks = Math.floor(diffDays / 7);
    const weeksFromDue = 40 + diffWeeks;
    if (weeksFromDue < 23) {
      return "妊娠期前半（妊娠発覚～22週）";
    } else {
      return "妊娠期後半（23週～出産）";
    }
  } else {
    if (diffDays <= 30) {
      return "出産直後（新生児期：〜1ヶ月）";
    } else if (diffDays <= 90) {
      return "乳児前期（1〜3ヶ月）";
    } else if (diffDays <= 180) {
      return "乳児中期（3〜6ヶ月）";
    } else if (diffDays <= 270) {
      return "離乳食準備期（6〜9ヶ月）";
    } else {
      return "保育園準備期（9ヶ月〜入園まで）";
    }
  }
}

// カテゴリとグループでToDoを整理する関数
function groupByCategoryAndGroup(todos) {
  const grouped = {};
  todos.forEach(todo => {
    if (!grouped[todo.category]) {
      grouped[todo.category] = { single: [], grouped: {} };
    }
    if (todo.group) {
      if (!grouped[todo.category].grouped[todo.group]) {
        grouped[todo.category].grouped[todo.group] = [];
      }
      grouped[todo.category].grouped[todo.group].push(todo);
    } else {
      grouped[todo.category].single.push(todo);
    }
  });
  return grouped;
}

function TodoListCloud() {
  const { id: listId } = useParams();
  const [listData, setListData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [copied, setCopied] = useReactState(false);
  const [openCategories, setOpenCategories] = useState({});
  // ステージ切り替え用
  const ALL_STAGES = [...new Set(todoData.map(todo => todo.stage))];
  const [displayedStage, setDisplayedStage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("その他");
  const [selectedGroup, setSelectedGroup] = useState("");

  useEffect(() => {
    if (!listId) return;
    const docRef = doc(db, "lists", listId);
    // リアルタイム同期
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setListData(docSnap.data());
      } else {
        setListData(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [listId]);

  // birthDateから現在のステージを判定
  const currentStage = listData ? determineStage(listData.birthDate) : null;
  // 初回のみ現在のステージを表示ステージに設定
  useEffect(() => {
    if (currentStage && !displayedStage) {
      setDisplayedStage(currentStage);
    }
  }, [currentStage, displayedStage]);
  // 選択中ステージのタスクのみ抽出
  const stageTodos = listData && listData.todos ? listData.todos.filter(todo => todo.stage === displayedStage) : [];
  // カテゴリごとにグループ化
  const grouped = groupByCategoryAndGroup(stageTodos);
  const toggleCategory = (category) => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  // 利用可能なカテゴリ一覧を動的に生成
  const availableCategories = React.useMemo(() => {
    const categories = new Set(stageTodos.map(todo => todo.category));
    return ["その他", ...Array.from(categories)];
  }, [stageTodos]);

  // 利用可能なグループ一覧を動的に生成
  const availableGroups = React.useMemo(() => {
    const groups = new Set(stageTodos.map(todo => todo.group).filter(Boolean));
    return ["", ...Array.from(groups)];
  }, [stageTodos]);

  // 選択されたカテゴリに応じてグループをフィルタリング
  const filteredGroups = React.useMemo(() => {
    if (selectedCategory === "その他") return [];
    const categoryGroups = new Set(
      stageTodos
        .filter(todo => todo.category === selectedCategory && todo.group)
        .map(todo => todo.group)
    );
    return ["", ...Array.from(categoryGroups)];
  }, [selectedCategory, stageTodos]);

  // タスク追加処理
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      const newTodo = {
        id: crypto.randomUUID(),
        task: newTask.trim(),
        done: false,
        memo: "",
        category: selectedCategory,
        stage: displayedStage,
        importance: "中",
        group: selectedGroup || undefined, // 空文字列の場合はundefinedにする
      };
      const docRef = doc(db, "lists", listId);
      await updateDoc(docRef, {
        todos: [...(listData.todos || []), newTodo],
        updatedAt: new Date().toISOString()
      });
      setNewTask("");
      setSelectedGroup(""); // グループ選択をリセット
    } catch (e) {
      alert('Firestore書き込みエラー: ' + e.message);
      console.error(e);
    }
  };

  // タスク完了切り替え
  const handleToggleTodo = async (taskId) => {
    try {
      const updatedTodos = listData.todos.map(todo =>
        todo.id === taskId ? { ...todo, done: !todo.done } : todo
      );
      const docRef = doc(db, "lists", listId);
      await updateDoc(docRef, {
        todos: updatedTodos,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      alert('Firestore書き込みエラー: ' + e.message);
      console.error(e);
    }
  };

  // タスク削除
  const handleDeleteTodo = async (taskId) => {
    try {
      const updatedTodos = listData.todos.filter(todo => todo.id !== taskId);
      const docRef = doc(db, "lists", listId);
      await updateDoc(docRef, {
        todos: updatedTodos,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      alert('Firestore書き込みエラー: ' + e.message);
      console.error(e);
    }
  };

  // タスク編集
  const handleEditTodo = async (taskId, currentTask) => {
    const newTask = prompt("タスクを編集:", currentTask);
    if (newTask !== null && newTask.trim() !== "") {
      try {
        const updatedTodos = listData.todos.map(todo =>
          todo.id === taskId ? { ...todo, task: newTask.trim() } : todo
        );
        const docRef = doc(db, "lists", listId);
        await updateDoc(docRef, {
          todos: updatedTodos,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {
        alert('Firestore書き込みエラー: ' + e.message);
        console.error(e);
      }
    }
  };

  // メモ編集
  const handleEditMemo = async (taskId, currentMemo) => {
    const newMemo = prompt("メモを編集:", currentMemo);
    if (newMemo !== null) { // 空のメモも保存できるように
      try {
        const updatedTodos = listData.todos.map(todo =>
          todo.id === taskId ? { ...todo, memo: newMemo.trim() } : todo
        );
        const docRef = doc(db, "lists", listId);
        await updateDoc(docRef, {
          todos: updatedTodos,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {
        alert('Firestore書き込みエラー: ' + e.message);
        console.error(e);
      }
    }
  };

  // 共有ボタン機能
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/list/${listId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // フォールバック: 古いブラウザ対応
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 出生予定日変更機能
  const handleDateChange = async (e) => {
    const newDate = e.target.value;
    try {
      const docRef = doc(db, "lists", listId);
      await updateDoc(docRef, {
        birthDate: newDate,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      alert('Firestore書き込みエラー: ' + e.message);
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">読み込み中...</div>;
  if (!listData) return <div className="p-8 text-center text-red-400">リストが見つかりません</div>;

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col items-center">
      <header
        className="w-full h-40 bg-center bg-no-repeat bg-contain mb-6 bg-white"
        style={{ backgroundImage: "url('/header-logo.png')" }}
      ></header>
      <main className="w-full max-w-4xl mx-auto flex flex-col gap-8 items-center">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 w-full max-w-lg mx-auto">
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">出産予定日 または 赤ちゃんの生年月日</label>
              <input
                type="date"
                value={listData.birthDate || ''}
                onChange={handleDateChange}
                className="border-2 border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400 text-sm"
              />
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-white font-bold rounded-lg px-4 py-2 text-sm shadow transition-colors"
            >
              <ShareIcon className="w-4 h-4" />
              {copied ? 'コピーしました！' : '共有'}
            </button>
          </div>
        </div>
        {/* タスクリスト表示（今は雛形） */}
        <div className="bg-white rounded-xl shadow p-6 w-full">
          {/* ステージ切り替えタブ */}
          <div className="mb-2 w-full">
            <div className="flex flex-wrap gap-2 border-b-2 border-gray-200 pb-2 mb-2 w-full">
              {ALL_STAGES.map(stageName => (
                <button 
                  key={stageName}
                  onClick={() => setDisplayedStage(stageName)}
                  className={`px-4 py-2 text-base font-semibold rounded-full transition-colors whitespace-nowrap flex-shrink-0 shadow-sm ${
                    displayedStage === stageName
                      ? 'bg-emerald-400 text-white'
                      : 'bg-gray-100 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {stageName}
                  {currentStage === stageName && <span className="text-xs ml-1">(現在)</span>}
                </button>
              ))}
            </div>
            {displayedStage !== currentStage && (
              <button
                onClick={() => setDisplayedStage(currentStage)}
                className="text-sm text-emerald-600 hover:underline"
              >
                現在のステージに戻る
              </button>
            )}
          </div>
          <div className="text-emerald-700 font-bold mb-2">{displayedStage ? `${displayedStage} のタスク一覧` : 'タスク一覧'}</div>
          <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              placeholder="新しいタスクを追加"
              className="flex-grow border-2 border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400"
            />
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setSelectedGroup(""); // カテゴリ変更時にグループをリセット
              }}
              className="border-2 border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400 text-base font-sans"
            >
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              className="border-2 border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400 text-base font-sans"
            >
              <option value="">グループなし</option>
              {filteredGroups.filter(group => group !== "").map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            <button type="submit" className="bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors disabled:bg-emerald-300" disabled={!newTask.trim()}>
              追加
            </button>
          </form>
          <section className="flex flex-col gap-6">
            {Object.keys(grouped).length === 0 ? (
              <div className="text-emerald-400 text-lg text-center py-8">このステージのToDoはありません</div>
            ) : (
              Object.entries(grouped).map(([category, data]) => (
                <div key={category} className="mb-6">
                  <button
                    className="w-full max-w-lg flex items-center justify-between text-emerald-500 font-bold mb-2 text-lg border-l-4 border-emerald-200 pl-3 pr-2 py-2 bg-white rounded-xl shadow-sm hover:bg-emerald-50 transition-colors"
                    style={{marginLeft: 0, marginRight: 'auto'}}
                    onClick={() => toggleCategory(category)}
                    aria-expanded={!!openCategories[category]}
                  >
                    <span>{category}</span>
                    {openCategories[category] ? (
                      <ChevronUpIcon className="w-6 h-6" />
                    ) : (
                      <ChevronDownIcon className="w-6 h-6" />
                    )}
                  </button>
                  {/* アコーディオン展開部分 */}
                  {openCategories[category] && (
                    <>
                      {/* 単体ToDo */}
                      <ul className="flex flex-col gap-4 mb-4">
                        {data.single.map(todo => (
                          <li key={todo.id} className="bg-white rounded-xl shadow flex flex-col sm:flex-row sm:items-center px-4 py-3 gap-3 border border-emerald-50 w-full max-w-lg">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <input type="checkbox" checked={todo.done} onChange={() => handleToggleTodo(todo.id)} className="w-7 h-7 accent-emerald-400 flex-shrink-0" />
                              <span 
                                className={`text-lg font-medium cursor-pointer transition-colors break-words font-sans flex-1 ${todo.done ? 'line-through text-gray-400' : 'text-emerald-900 hover:text-emerald-600'}`} 
                                onClick={() => handleToggleTodo(todo.id)}
                              >
                                {todo.task}
                              </span>
                              <button 
                                onClick={() => handleEditTodo(todo.id, todo.task)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <div 
                                className="text-sm text-gray-500 cursor-pointer hover:text-gray-800 flex items-center gap-1"
                                onClick={() => handleEditMemo(todo.id, todo.memo)}
                              >
                                <PencilSquareIcon className="w-4 h-4" />
                                <span className="text-xs">{todo.memo || 'メモ'}</span>
                              </div>
                              {todo.reason && (
                                <Tooltip text={todo.reason}>
                                  <InformationCircleIcon className="w-4 h-4 text-emerald-400 cursor-pointer" />
                                </Tooltip>
                              )}
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${todo.importance === '高' ? 'bg-red-200 text-red-700' : todo.importance === '中' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{todo.importance}</span>
                              <button onClick={() => handleDeleteTodo(todo.id)} className="text-red-300 hover:text-red-500 p-1">
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                      {/* グループ化されたToDo */}
                      {Object.entries(data.grouped).map(([groupName, items]) => (
                        <div key={groupName} className="mb-4">
                          <div className="font-bold text-emerald-600 mb-2 pl-2">{groupName}</div>
                          <ul className="flex flex-col gap-2 pl-4 sm:pl-8">
                            {items.map(todo => (
                              <li key={todo.id} className="bg-white rounded-xl shadow flex flex-col sm:flex-row sm:items-center px-4 py-3 gap-3 border border-emerald-50 w-full max-w-lg">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <input type="checkbox" checked={todo.done} onChange={() => handleToggleTodo(todo.id)} className="w-7 h-7 accent-emerald-400 flex-shrink-0" />
                                  <span 
                                    className={`text-lg font-medium cursor-pointer transition-colors break-words font-sans flex-1 ${todo.done ? 'line-through text-gray-400' : 'text-emerald-900 hover:text-emerald-600'}`} 
                                    onClick={() => handleToggleTodo(todo.id)}
                                  >
                                    {todo.task}
                                  </span>
                                  <button 
                                    onClick={() => handleEditTodo(todo.id, todo.task)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <div 
                                    className="text-sm text-gray-500 cursor-pointer hover:text-gray-800 flex items-center gap-1"
                                    onClick={() => handleEditMemo(todo.id, todo.memo)}
                                  >
                                    <PencilSquareIcon className="w-4 h-4" />
                                    <span className="text-xs">{todo.memo || 'メモ'}</span>
                                  </div>
                                  {todo.reason && (
                                    <Tooltip text={todo.reason}>
                                      <InformationCircleIcon className="w-4 h-4 text-emerald-400 cursor-pointer" />
                                    </Tooltip>
                                  )}
                                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${todo.importance === '高' ? 'bg-red-200 text-red-700' : todo.importance === '中' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{todo.importance}</span>
                                  <button onClick={() => handleDeleteTodo(todo.id)} className="text-red-300 hover:text-red-500 p-1">
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ))
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default TodoListCloud; 