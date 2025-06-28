import React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import TodoList from "./pages/TodoList";
import TodoListCloud from "./pages/TodoListCloud";

/**
 * アプリの初回アクセス時に、localStorageにデータがあるかチェックし、
 * 適切なページにリダイレクトするコンポーネント
 */
const InitialRouteHandler = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const savedListId = localStorage.getItem("listId");
    if (savedListId) {
      navigate(`/list/${savedListId}`);
    } else {
      navigate('/home');
    }
  }, [navigate]);

  // このコンポーネント自体は何もレンダリングしない
  return null; 
};


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InitialRouteHandler />} />
        <Route path="/home" element={<Home />} />
        <Route path="/todolist" element={<TodoList />} />
        <Route path="/list/:id" element={<TodoListCloud />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
