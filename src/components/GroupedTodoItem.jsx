import React from 'react';
import Tooltip from './Tooltip';

const GroupedTodoItem = ({ groupName, items, onToggle, onDelete, onUpdate, onMemoUpdate }) => {
  return (
    <div className="mb-6">
      {/* グループヘッダー */}
      <div className="flex items-center mb-3">
        <input type="checkbox" className="w-5 h-5 accent-emerald-400 mr-3" />
        <h3 className="text-lg font-bold text-emerald-600">{groupName}</h3>
      </div>
      
      {/* グループ内のToDoリスト */}
      <ul className="space-y-2 pl-4 sm:pl-8">
        {items.map(todo => (
          <li key={todo.id} className="flex flex-col sm:flex-row sm:items-center bg-emerald-50 rounded-lg px-3 py-2 shadow-sm gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} className="w-5 h-5 accent-emerald-400 flex-shrink-0" />
              <span 
                className={`text-base cursor-pointer transition-colors break-words ${todo.done ? 'line-through text-gray-400' : 'text-emerald-900 hover:text-emerald-600'}`} 
                onClick={() => onUpdate(todo.id, todo.task)}
              >
                {todo.task}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div 
                className="text-sm text-gray-500 cursor-pointer hover:text-gray-800 flex items-center gap-1"
                onClick={() => onMemoUpdate(todo.id, todo.memo)}
              >
                <span role="img" aria-label="memo">✏️</span>
                <span className="hidden sm:inline">{todo.memo || 'メモを追加'}</span>
                <span className="sm:hidden">{todo.memo ? '📝' : '✏️'}</span>
              </div>
              {todo.reason && (
                <Tooltip text={todo.reason}>
                  <span role="img" aria-label="info" className="cursor-pointer">ℹ️</span>
                </Tooltip>
              )}
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${todo.importance === '高' ? 'bg-red-200 text-red-700' : todo.importance === '中' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{todo.importance}</span>
              <button onClick={() => onDelete(todo.id)} className="text-red-500 hover:text-red-700">
                <span role="img" aria-label="delete">🗑️</span>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupedTodoItem; 