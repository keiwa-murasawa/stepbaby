import React from 'react';
import Tooltip from './Tooltip';
import { PencilIcon, PencilSquareIcon, TrashIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const GroupedTodoItem = ({ groupName, items, onToggle, onDelete, onUpdate, onMemoUpdate, onToggleGroup }) => {
  // グループ全体が完了済みかどうか
  const allDone = items.length > 0 && items.every(todo => todo.done);

  return (
    <div className="mb-6">
      {/* グループヘッダー */}
      <div className="flex items-center mb-3">
        <input
          type="checkbox"
          className="w-6 h-6 accent-emerald-400 mr-3"
          checked={allDone}
          onChange={() => onToggleGroup(items)}
        />
        <h3 className="text-lg font-bold text-emerald-600">{groupName}</h3>
      </div>
      
      {/* グループ内のToDoリスト */}
      <ul className="space-y-2 pl-4 sm:pl-8">
        {items.map(todo => (
          <li key={todo.id} className="flex flex-col sm:flex-row sm:items-center bg-emerald-50 rounded-lg px-3 py-2 shadow-sm gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} className="w-6 h-6 accent-emerald-400 flex-shrink-0" />
              <span 
                className={`text-base cursor-pointer transition-colors break-words flex-1 ${todo.done ? 'line-through text-gray-400' : 'text-emerald-900 hover:text-emerald-600'}`} 
                onClick={() => onToggle(todo.id)}
              >
                {todo.task}
              </span>
              <button 
                onClick={() => onUpdate(todo.id, todo.task)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div 
                className="text-sm text-gray-500 cursor-pointer hover:text-gray-800 flex items-center gap-1"
                onClick={() => onMemoUpdate(todo.id, todo.memo)}
              >
                <PencilSquareIcon className="w-4 h-4" />
                <span className="text-xs">{todo.memo || 'メモ'}</span>
              </div>
              {todo.reason && (
                <Tooltip text={todo.reason}>
                  <InformationCircleIcon className="w-4 h-4 text-emerald-400 cursor-pointer" />
                </Tooltip>
              )}
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${todo.importance === '高' ? 'bg-red-200 text-red-700' : todo.importance === '中' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{todo.importance}</span>
              <button onClick={() => onDelete(todo.id)} className="text-red-300 hover:text-red-500 p-1">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupedTodoItem; 