// components/Layout/Sidebar.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Clock, Users, Settings, Calendar, BarChart3, 
  User, FileText 
} from 'lucide-react';
import { useAuth, usePermissions } from '../../contexts/AuthContext';

function Sidebar() {
  const { user } = useAuth();
  const permissions = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();

  const getMenuItems = () => {
    const items = [];

    // 管理員和主管可以看儀表板
    if (permissions.canViewDashboard) {
      items.push({ 
        id: 'dashboard', 
        label: '儀表板', 
        icon: BarChart3, 
        path: '/dashboard' 
      });
    }

    // 所有角色都可以打卡
    items.push({ 
      id: 'checkin', 
      label: '打卡', 
      icon: Clock, 
      path: '/checkin' 
    });

    // 管理員可以看所有員工，主管可以看部門員工
    if (permissions.canViewAllEmployees || permissions.canManageDepartmentEmployees) {
      items.push({ 
        id: 'employees', 
        label: '員工管理', 
        icon: Users, 
        path: '/employees' 
      });
    }

    // 出勤記錄（根據權限顯示不同範圍）
    if (permissions.canViewAllAttendance || permissions.canViewDepartmentAttendance || permissions.canViewOwnAttendance) {
      items.push({ 
        id: 'attendance', 
        label: '出勤記錄', 
        icon: Calendar, 
        path: '/attendance' 
      });
    }

    // 請假管理
    if (permissions.canApplyLeave || permissions.canReviewAllLeaves || permissions.canReviewDepartmentLeaves) {
      items.push({ 
        id: 'leaves', 
        label: '請假管理', 
        icon: FileText, 
        path: '/leaves' 
      });
    }

    // 員工可以看個人資料
    if (user?.role === 'employee') {
      items.push({ 
        id: 'profile', 
        label: '個人資料', 
        icon: User, 
        path: '/profile' 
      });
    }

    // 只有管理員可以看系統設定
    if (permissions.canManageSettings) {
      items.push({ 
        id: 'settings', 
        label: '系統設定', 
        icon: Settings, 
        path: '/settings' 
      });
    }

    return items;
  };

  const menuItems = getMenuItems();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="mt-8">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-gray-50 ${
              location.pathname === item.path 
                ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                : 'text-gray-600'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;