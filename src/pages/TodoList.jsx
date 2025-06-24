import React, { useEffect, useState } from "react";
import todoData from "../data/todoData.json";
import GroupedTodoItem from "../components/GroupedTodoItem";
import Tooltip from "../components/Tooltip";

// ステージ判定関数
function determineStage(dateString) {
  if (!dateString) return null;
  const now = new Date();
  const inputDate = new Date(dateString);
  const diffTime = now - inputDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffTime < 0) {
    const diffWeeks = Math.floor(diffDays / 7);
    // 妊娠週数は、出産予定日から逆算するため、マイナスで計算される
    const weeksFromDue = 40 + diffWeeks; 

    if (weeksFromDue < 23) {
      return "妊娠期前半（妊娠発覚～22週）";
    } else {
      return "妊娠期後半（23週～出産）";
    }
  } else {
    // 1ヶ月を約30日として計算
    if (diffDays <= 30) {
      return "出産直後（新生児期：〜1ヶ月）";
    } else if (diffDays <= 90) { // 1〜3ヶ月
      return "乳児前期（1〜3ヶ月）";
    } else if (diffDays <= 180) { // 3〜6ヶ月
      return "乳児中期（3〜6ヶ月）";
    } else if (diffDays <= 270) { // 6〜9ヶ月
      return "離乳食準備期（6〜9ヶ月）";
    } else { // 9ヶ月以降
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

function TodoList() {
  const [stage, setStage] = useState("");
  const [nickname, setNickname] = useState("");
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("その他");

  // 利用可能なカテゴリ一覧を動的に生成（メモ化して不要な再計算を防ぐ）
  const availableCategories = React.useMemo(() => {
    const categories = new Set(todos.map(todo => todo.category));
    return ["その他", ...Array.from(categories)];
  }, [todos]);

  // 初期データの読み込み（localStorage優先）
  useEffect(() => {
    const date = localStorage.getItem("birthDate");
    const nick = localStorage.getItem("nickname");
    const currentStage = determineStage(date);
    
    setNickname(nick || "");
    setStage(currentStage);
    
    if (currentStage) {
      const storageKey = `papasapo-todos-${currentStage}`;
      const savedTodos = localStorage.getItem(storageKey);
      
      if (savedTodos) {
        setTodos(JSON.parse(savedTodos));
      } else {
        const initialTodos = todoData.filter(todo => todo.stage === currentStage);
        setTodos(initialTodos);
      }
    } else {
      setTodos([]);
    }
  }, []);

  // todos stateが変更されたらlocalStorageに保存
  useEffect(() => {
    if (stage) {
      const storageKey = `papasapo-todos-${stage}`;
      localStorage.setItem(storageKey, JSON.stringify(todos));
    }
  }, [todos, stage]);

  // タスク追加処理
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim() || !stage) return; // 空のタスクやステージがない場合は追加しない

    const newTaskObject = {
      id: Date.now(),
      stage: stage,
      category: selectedCategory,
      task: newTask.trim(),
      importance: '中',
      done: false,
    };

    setTodos(prevTodos => [newTaskObject, ...prevTodos]);
    setNewTask(''); // 入力フォームをクリア
  };

  // IDを元にタスクの完了状態を切り替える関数
  const handleToggleTodo = (id) => {
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  // IDを元にタスクを削除する関数
  const handleDeleteTodo = (id) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  // タスク更新処理（promptを使用）
  const handleTaskUpdate = (id, currentTask) => {
    const newTask = prompt("タスクを編集:", currentTask);
    if (newTask !== null && newTask.trim() !== "") {
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? { ...todo, task: newTask.trim() } : todo
        )
      );
    }
  };

  const grouped = groupByCategoryAndGroup(todos);

  return (
    <div className="min-h-screen flex flex-col items-center bg-emerald-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-emerald-700 mb-2 flex items-center gap-2">
          <span role="img" aria-label="checklist">📝</span> ToDo一覧
        </h2>
        <div className="text-emerald-900 font-semibold mb-4">{nickname && `${nickname}さんのステージ：${stage}`}</div>
        
        {/* タスク追加フォーム */}
        <form onSubmit={handleAddTask} className="flex flex-col gap-2 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="新しいタスクを追加"
              className="flex-grow border-2 border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400 transition-colors"
            />
            <button type="submit" className="bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors disabled:bg-emerald-300" disabled={!newTask.trim()}>
              追加
            </button>
          </div>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border-2 border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400 transition-colors"
          >
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </form>

        {Object.keys(grouped).length === 0 ? (
          <div className="text-emerald-400">このステージのToDoはありません</div>
        ) : (
          Object.entries(grouped).map(([category, data]) => (
            <div key={category} className="mb-6">
              <div className="text-emerald-500 font-bold mb-2 text-base border-l-4 border-emerald-200 pl-2">{category}</div>
              
              {/* 単体ToDo */}
              <ul className="space-y-2 mb-4">
                {data.single.map(todo => (
                  <li key={todo.id} className="flex items-center bg-emerald-50 rounded-lg px-3 py-2 shadow-sm">
                    <input type="checkbox" checked={todo.done} onChange={() => handleToggleTodo(todo.id)} className="w-5 h-5 accent-emerald-400 mr-3" />
                    <span 
                      className={`flex-1 text-base cursor-pointer transition-colors ${todo.done ? 'line-through text-gray-400' : 'text-emerald-900 hover:text-emerald-600'}`} 
                      onClick={() => handleTaskUpdate(todo.id, todo.task)}
                    >
                      {todo.task}
                    </span>
                    {todo.reason && (
                      <Tooltip text={todo.reason}>
                        <span role="img" aria-label="info" className="ml-2 cursor-pointer">ℹ️</span>
                      </Tooltip>
                    )}
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${todo.importance === '高' ? 'bg-red-200 text-red-700' : todo.importance === '中' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{todo.importance}</span>
                    <button onClick={() => handleDeleteTodo(todo.id)} className="ml-3 text-red-500 hover:text-red-700">
                      <span role="img" aria-label="delete">🗑️</span>
                    </button>
                  </li>
                ))}
              </ul>

              {/* グループ化されたToDo */}
              {Object.entries(data.grouped).map(([groupName, items]) => (
                <GroupedTodoItem key={groupName} groupName={groupName} items={items} onToggle={handleToggleTodo} onDelete={handleDeleteTodo} onUpdate={handleTaskUpdate} />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TodoList; 