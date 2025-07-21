import React from 'react';
import { Menu } from 'antd';
import { 
  DashboardOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ currentPage, setCurrentPage, collapsed }) => {
  const { userData } = useAuth();

  const navigationItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '儀表板',
      roles: ['admin', 'manager', 'employee']
    },
    {
      key: 'attendance',
      icon: <ClockCircleOutlined />,
      label: '打卡紀錄',
      roles: ['admin', 'manager', 'employee']
    },
    {
      key: 'calendar',
      icon: <ScheduleOutlined />,
      label: '出勤月曆',
      roles: ['admin', 'manager', 'employee']
    },
    {
      key: 'leave-requests',
      icon: <CalendarOutlined />,
      label: '請假管理',
      roles: ['admin', 'manager', 'employee']
    },
    {
      key: 'overtime-requests',
      icon: <ClockCircleOutlined />,
      label: '加班管理',
      roles: ['admin', 'manager', 'employee']
    },
    {
      key: 'employees',
      icon: <TeamOutlined />,
      label: '員工管理',
      roles: ['admin', 'manager']
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: '報表分析',
      roles: ['admin', 'manager']
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系統設定',
      roles: ['admin']
    }
  ];

  const canAccess = (roles) => {
    return roles.includes(userData?.role);
  };

  const handleMenuClick = ({ key }) => {
    setCurrentPage(key);
  };

  const menuItems = navigationItems
    .filter(item => canAccess(item.roles))
    .map(item => ({
      key: item.key,
      icon: item.icon,
      label: item.label,
    }));

  return (
    <div style={{ height: '100vh', paddingTop: '16px' }}>
      <Menu
        mode="inline"
        selectedKeys={[currentPage]}
        onClick={handleMenuClick}
        items={menuItems}
        style={{
          height: '100%',
          borderRight: 0,
        }}
      />
    </div>
  );
};

export default Sidebar;