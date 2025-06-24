import React, { useState, useEffect } from "react";
import todoData from "./data/todoData.json";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TodoList from "./pages/TodoList";
import CompletedList from "./pages/CompletedList";

// ステージ判定関数
function determineStage(dateString) {
  if (!dateString) return null;
  const now = new Date();
  const inputDate = new Date(dateString);
  const diffDays = Math.floor((now - inputDate) / (1000 * 60 * 60 * 24));
  const diffWeeks = diffDays / 7;

  if (diffDays < 0) {
    return diffWeeks <= -28 ? "妊娠初期" : "妊娠後期";
  } else if (diffDays <= 28) {
    return "新生児期";
  } else if (diffDays <= 180) {
    return "乳児前期";
  } else if (diffDays <= 365) {
    return "乳児中期";
  } else {
    return "保育園準備期";
  }
}

function App() {
  const [birthDate, setBirthDate] = useState("");
  const [stage, setStage] = useState("");
  const [toDoList, setToDoList] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  // localStorageから復元
  useEffect(() => {
    const savedDate = localStorage.getItem("birthDate");
    const savedTodos = localStorage.getItem("toDoList");
    if (savedDate) {
      setBirthDate(savedDate);
      const st = determineStage(savedDate);
      setStage(st);
      if (savedTodos) {
        setToDoList(JSON.parse(savedTodos));
      } else {
        setToDoList(todoData[st] || []);
      }
    }
  }, []);

  // 日付変更時
  const handleChange = (e) => {
    const value = e.target.value;
    setBirthDate(value);
    localStorage.setItem("birthDate", value);
    const st = determineStage(value);
    setStage(st);
    setToDoList(todoData[st] || []);
    localStorage.removeItem("toDoList");
  };

  // チェック状態切り替え
  const handleToggleDone = (id) => {
    const newList = toDoList.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    );
    setToDoList(newList);
    localStorage.setItem("toDoList", JSON.stringify(newList));
  };

  // 新規タスク追加
  const handleAddTask = () => {
    if (!newTask.trim()) return;
    const newId = toDoList.length > 0 ? Math.max(...toDoList.map(t => t.id)) + 1 : 1;
    const newList = [
      ...toDoList,
      { id: newId, task: newTask.trim(), done: false }
    ];
    setToDoList(newList);
    setNewTask("");
    localStorage.setItem("toDoList", JSON.stringify(newList));
  };

  // タスク削除
  const handleDeleteTask = (id) => {
    const newList = toDoList.filter(todo => todo.id !== id);
    setToDoList(newList);
    localStorage.setItem("toDoList", JSON.stringify(newList));
  };

  // タスク編集開始
  const handleEditStart = (id, text) => {
    setEditId(id);
    setEditText(text);
  };

  // タスク編集保存
  const handleEditSave = (id) => {
    const newList = toDoList.map(todo =>
      todo.id === id ? { ...todo, task: editText } : todo
    );
    setToDoList(newList);
    setEditId(null);
    setEditText("");
    localStorage.setItem("toDoList", JSON.stringify(newList));
  };

  // タスク編集キャンセル
  const handleEditCancel = () => {
    setEditId(null);
    setEditText("");
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/todos" element={<TodoList />} />
        <Route path="/completed" element={<CompletedList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
