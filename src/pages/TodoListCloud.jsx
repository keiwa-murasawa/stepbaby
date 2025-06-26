import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";

function TodoListCloud() {
  const { id: listId } = useParams();
  const [listData, setListData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");

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

  // タスク追加処理
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const newTodo = {
      id: crypto.randomUUID(),
      task: newTask.trim(),
      done: false,
      memo: ""
    };
    const docRef = doc(db, "lists", listId);
    await updateDoc(docRef, {
      todos: [...(listData.todos || []), newTodo],
      updatedAt: new Date().toISOString()
    });
    setNewTask("");
  };

  // タスク完了切り替え
  const handleToggleTodo = async (taskId) => {
    const updatedTodos = listData.todos.map(todo =>
      todo.id === taskId ? { ...todo, done: !todo.done } : todo
    );
    const docRef = doc(db, "lists", listId);
    await updateDoc(docRef, {
      todos: updatedTodos,
      updatedAt: new Date().toISOString()
    });
  };

  // タスク削除
  const handleDeleteTodo = async (taskId) => {
    const updatedTodos = listData.todos.filter(todo => todo.id !== taskId);
    const docRef = doc(db, "lists", listId);
    await updateDoc(docRef, {
      todos: updatedTodos,
      updatedAt: new Date().toISOString()
    });
  };

  // タスク編集
  const handleEditTodo = async (taskId, currentTask) => {
    const newTask = prompt("タスクを編集:", currentTask);
    if (newTask !== null && newTask.trim() !== "") {
      const updatedTodos = listData.todos.map(todo =>
        todo.id === taskId ? { ...todo, task: newTask.trim() } : todo
      );
      const docRef = doc(db, "lists", listId);
      await updateDoc(docRef, {
        todos: updatedTodos,
        updatedAt: new Date().toISOString()
      });
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">読み込み中...</div>;
  if (!listData) return <div className="p-8 text-center text-red-400">リストが見つかりません</div>;

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col items-center">
      <header className="w-full bg-stone-500 shadow-sm py-6 mb-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3 px-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans drop-shadow-sm">StepBaby 共有ToDoリスト</h1>
        </div>
      </header>
      <main className="w-full max-w-4xl px-2 sm:px-4 flex flex-col gap-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="text-lg font-bold text-emerald-700 mb-2">{listData.title}</div>
          <div className="text-sm text-gray-500 break-all mb-2">リストID: {listId}</div>
          <button
            className="text-emerald-500 underline text-sm"
            onClick={() => {navigator.clipboard.writeText(window.location.href)}}
          >
            このリストのURLをコピー
          </button>
        </div>
        {/* タスクリスト表示（今は雛形） */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-emerald-700 font-bold mb-2">タスク一覧</div>
          <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              placeholder="新しいタスクを追加"
              className="flex-grow border-2 border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400"
            />
            <button type="submit" className="bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors disabled:bg-emerald-300" disabled={!newTask.trim()}>
              追加
            </button>
          </form>
          <ul className="list-disc pl-6">
            {listData.todos && listData.todos.length > 0 ? (
              listData.todos.map((todo, idx) => (
                <li key={todo.id || idx} className="mb-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => handleToggleTodo(todo.id)}
                    className="w-5 h-5 accent-emerald-400"
                  />
                  <span
                    className={`flex-1 cursor-pointer ${todo.done ? 'line-through text-gray-400' : 'text-emerald-900'}`}
                    onClick={() => handleEditTodo(todo.id, todo.task)}
                  >
                    {todo.task}
                  </span>
                  <button
                    onClick={() => handleEditTodo(todo.id, todo.task)}
                    className="text-emerald-500 hover:text-emerald-700 text-sm px-2"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="text-red-400 hover:text-red-600 text-sm px-2"
                  >
                    削除
                  </button>
                </li>
              ))
            ) : (
              <li className="text-gray-400">タスクがありません</li>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}

export default TodoListCloud; 