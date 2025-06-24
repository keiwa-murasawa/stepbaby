import React, { useEffect, useState } from "react";
import todoData from "../data/todoData.json";
import GroupedTodoItem from "../components/GroupedTodoItem";
import Tooltip from "../components/Tooltip";

// ステージ判定関数
function determineStage(dateString) {
  if (!dateString) return null;
  const now = new Date();
  const inputDate = new Date(dateString);
  const diffDays = Math.floor((now - inputDate) / (1000 * 60 * 60 * 24));
  const diffWeeks = diffDays / 7;
  if (diffDays < 0) {
    return diffWeeks <= -22
      ? "妊娠期前半（妊娠発覚～22週）"
      : "妊娠期後半（23週～出産）";
  } else if (diffDays <= 28) {
    return "出産直後（新生児期：〜1ヶ月）";
  } else if (diffDays <= 180) {
    return "乳児前期";
  } else if (diffDays <= 365) {
    return "乳児中期";
  } else {
    return "保育園準備期";
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

  useEffect(() => {
    const date = localStorage.getItem("birthDate");
    const nick = localStorage.getItem("nickname");
    setNickname(nick || "");
    const st = determineStage(date);
    setStage(st);
    
    const filtered = todoData.filter(todo => todo.stage === st);
    setTodos(filtered);
  }, []);

  const grouped = groupByCategoryAndGroup(todos);

  return (
    <div className="min-h-screen flex flex-col items-center bg-emerald-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-emerald-700 mb-2 flex items-center gap-2">
          <span role="img" aria-label="checklist">📝</span> ToDo一覧
        </h2>
        <div className="text-emerald-900 font-semibold mb-2">{nickname && `${nickname}さんのステージ：${stage}`}</div>
        
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
                    <input type="checkbox" checked={todo.done} readOnly className="w-5 h-5 accent-emerald-400 mr-3" />
                    <span className="flex-1 text-base text-emerald-900">{todo.task}</span>
                    {todo.reason && (
                      <Tooltip text={todo.reason}>
                        <span role="img" aria-label="info" className="ml-2 cursor-pointer">ℹ️</span>
                      </Tooltip>
                    )}
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${todo.importance === '高' ? 'bg-red-200 text-red-700' : todo.importance === '中' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{todo.importance}</span>
                  </li>
                ))}
              </ul>

              {/* グループ化されたToDo */}
              {Object.entries(data.grouped).map(([groupName, items]) => (
                <GroupedTodoItem key={groupName} groupName={groupName} items={items} />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TodoList; 