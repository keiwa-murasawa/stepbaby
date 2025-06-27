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
    // localStorageから出産予定日を取得
    const savedDate = localStorage.getItem("birthDate");
    
    if (savedDate) {
      // データがあればToDoリストへ
      navigate('/todolist');
    } else {
      // データがなければ情報入力ページへ
      navigate('/home');
    }
  }, [navigate]); // navigateを依存配列に追加

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
