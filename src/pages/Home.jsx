import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [nickname, setNickname] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError("ニックネームを入力してください");
      return;
    }
    if (!date) {
      setError("日付を入力してください");
      return;
    }
    // 保存
    localStorage.setItem("nickname", nickname.trim());
    localStorage.setItem("birthDate", date);
    setError("");
    navigate("/todos");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-emerald-700 mb-6 flex items-center gap-2">
          <span role="img" aria-label="leaf">🌱</span> パパサポ
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-emerald-900 font-semibold mb-1">ニックネーム</label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              className="w-full border border-emerald-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="パパの名前やニックネーム"
            />
          </div>
          <div>
            <label className="block text-emerald-900 font-semibold mb-1">出産予定日 または 赤ちゃんの生年月日</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-emerald-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
          {error && <div className="text-red-500 text-sm font-bold">{error}</div>}
          <button type="submit" className="w-full bg-emerald-400 hover:bg-emerald-500 text-white font-bold rounded-md px-4 py-2 transition-colors mt-4">はじめる</button>
        </form>
      </div>
    </div>
  );
}

export default Home; 