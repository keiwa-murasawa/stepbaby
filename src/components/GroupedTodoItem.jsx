import React from 'react';
import Tooltip from './Tooltip';

const GroupedTodoItem = ({ groupName, items }) => {
  return (
    <div className="mb-6">
      {/* グループヘッダー */}
      <div className="flex items-center mb-3">
        <input type="checkbox" className="w-5 h-5 accent-emerald-400 mr-3" />
        <h3 className="text-lg font-bold text-emerald-600">{groupName}</h3>
      </div>
      
      {/* グループ内のToDoリスト */}
      <ul className="space-y-2 pl-8">
        {items.map(todo => (
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
    </div>
  );
};

export default GroupedTodoItem; 