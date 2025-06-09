// components/Layout/Header.js
import React from 'react';
import { Clock, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function Header() {
  const { user, logout } = useAuth();

  const getRoleName = (role) => {
    switch (role) {
      case 'admin': return '管理員';
      case 'manager': return '主管';
      case 'employee': return '員工';
      default: return '用戶';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'manager': return 'bg-purple-500';
      case 'employee': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Clock className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">企業打卡系統</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getRoleColor(user?.role)}`}></div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 font-medium">
                  {user?.name || user?.displayName}
                </span>
                <span className="text-xs text-gray-500">
                  ({getRoleName(user?.role)})
                </span>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>登出</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;