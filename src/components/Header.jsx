import React from 'react';
import { LogOut, Clock, User, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { userData, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('已成功登出');
    } catch (error) {
      toast.error('登出失敗');
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin':
        return '系統管理員';
      case 'manager':
        return '部門主管';
      case 'employee':
        return '一般員工';
      default:
        return '員工';
    }
  };

  return (
    <header className="header">
      <div className="flex items-center gap-4">
        {/* 手機版漢堡選單 - 只在手機版顯示 */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu size={20} />
        </button>
        
        <div className="header-logo">
          <Clock className="w-8 h-8 text-blue-600" />
          <span>企業打卡系統</span>
        </div>
      </div>

      <div className="header-nav">
        <div className="header-user">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-500" />
            <div className="header-user-info">
              <div className="header-user-name">
                {userData?.name || '用戶'}
              </div>
              <div className="header-user-role">
                {getRoleText(userData?.role)} • {userData?.department || '未設定部門'}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="btn btn-outline btn-sm"
            title="登出"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">登出</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;