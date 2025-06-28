import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import todoData from "../data/todoData.json";

function Home() {
  const [nickname, setNickname] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError("ニックネームを入力してください");
      return;
    }
    if (!date) {
      setError("日付を入力してください");
      return;
    }
    // Firestoreに新しいリストを作成（デフォルトタスクを含める）
    const newListId = crypto.randomUUID();
    const initialData = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: `${nickname.trim()}のToDoリスト`,
      todos: todoData,
      nickname: nickname.trim(),
      birthDate: date
    };
    await setDoc(doc(db, "lists", newListId), initialData);
    setError("");
    // ローカルストレージにも保存（必要なら）
    localStorage.setItem("nickname", nickname.trim());
    localStorage.setItem("birthDate", date);
    localStorage.setItem("listId", newListId);
    // /list/:id へ遷移
    navigate(`/list/${newListId}`);
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col items-center">
      {/* ヘッダー */}
      <header
        className="w-full h-40 bg-center bg-no-repeat bg-contain mb-6 bg-white"
        style={{ backgroundImage: "url('/header-logo.png')" }}
      ></header>
      <main className="w-full max-w-4xl mx-auto px-2 sm:px-4 flex flex-col items-center justify-center flex-1">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 mx-auto">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-emerald-900 font-semibold mb-1">ニックネーム</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  className="w-full border-2 border-emerald-200 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-400 text-lg font-sans"
                  placeholder="赤ちゃんのニックネーム"
                />
              </div>
              <div>
                <label className="block text-emerald-900 font-semibold mb-1">出産予定日 または 赤ちゃんの生年月日</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full border-2 border-emerald-200 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-400 text-lg font-sans"
                />
              </div>
              {error && <div className="text-red-500 text-sm font-bold">{error}</div>}
              <button type="submit" className="w-full max-w-[10rem] aspect-[4/1] h-12 mt-4 overflow-hidden p-0 bg-transparent rounded-full flex items-center justify-center mx-auto">
                <img src="/hajimeru.png" alt="はじめる" className="w-full h-full object-contain" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home; 