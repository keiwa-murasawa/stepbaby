import React from "react";

function CompletedList() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-emerald-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
          <span role="img" aria-label="star">⭐</span> 完了済みToDo一覧
        </h2>
        {/* 完了済みToDoリスト本体は今後実装 */}
        <div className="text-emerald-400">ここに完了済みToDoが表示されます</div>
      </div>
    </div>
  );
}

export default CompletedList; 