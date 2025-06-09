import React from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  Calendar, 
  Users, 
  FileText, 
  Settings,
  BarChart3,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen }) => {
  const { userData, isAdmin, isManager } = useAuth();

  const navigationItems = [
    {
      key: 'dashboard',
      name: '儀表板',
      icon: LayoutDashboard,
      roles: ['admin', 'manager', 'employee']
    },
    {
      key: 'attendance',
      name: '打卡紀錄',
      icon: Clock,
      roles: ['admin', 'manager', 'employee']
    },
    {
      key: 'leave-requests',
      name: '請假管理',
      icon: Calendar,
      roles: ['admin', 'manager', 'employee']
    },
    {
      key: 'employees',
      name: '員工管理',
      icon: Users,
      roles: ['admin', 'manager']
    },
    {
      key: 'reports',
      name: '報表分析',
      icon: BarChart3,
      roles: ['admin', 'manager']
    },
    {
      key: 'settings',
      name: '系統設定',
      icon: Settings,
      roles: ['admin']
    }
  ];

  const isActive = (pageKey) => currentPage === pageKey;

  const canAccess = (roles) => {
    return roles.includes(userData?.role);
  };

  const handleNavClick = (pageKey) => {
    setCurrentPage(pageKey);
    // 在手機版本關閉側邊欄
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      {/* 手機版關閉按鈕 - 只在手機版顯示 */}
      <div className="md:hidden flex justify-end p-4">
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>

      <nav>
        <ul className="sidebar-nav">
          {navigationItems.map((item) => {
            if (!canAccess(item.roles)) return null;
            
            const Icon = item.icon;
            
            return (
              <li key={item.key} className="sidebar-nav-item">
                <button
                  onClick={() => handleNavClick(item.key)}
                  className={`sidebar-nav-link ${isActive(item.key) ? 'active' : ''}`}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}
                >
                  <Icon className="sidebar-nav-icon" />
                  <span>{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;