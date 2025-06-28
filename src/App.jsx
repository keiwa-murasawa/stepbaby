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
    // localStorageからlistIdと出産予定日を取得
    const savedListId = localStorage.getItem("listId");
    const savedDate = localStorage.getItem("birthDate");
    
    if (savedListId) {
      // listIdがあればクラウドリスト画面へ
      navigate(`/list/${savedListId}`);
    } else if (savedDate) {
      // birthDateのみあればローカルToDoリストへ
      navigate('/todolist');
    } else {
      // どちらもなければ情報入力ページへ
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
