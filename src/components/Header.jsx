import React from 'react';
import { Layout, Button, Dropdown, Avatar, Space, Typography, Tag, App } from 'antd';
import { 
  LogoutOutlined, 
  ClockCircleOutlined, 
  UserOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = ({ collapsed, setCollapsed }) => {
  const { userData, signOut, getCompanyName } = useAuth();
  const { message } = App.useApp();

  const handleSignOut = async () => {
    try {
      await signOut();
      message.success('已成功登出');
    } catch (error) {
      message.error('登出失敗');
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin':
        return { text: '系統管理員', color: 'red' };
      case 'manager':
        return { text: '部門主管', color: 'blue' };
      case 'employee':
        return { text: '一般員工', color: 'green' };
      default:
        return { text: '員工', color: 'default' };
    }
  };

  const roleInfo = getRoleText(userData?.role);

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: (
        <div>
          <div style={{ fontWeight: 'bold' }}>{userData?.name || '用戶'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {userData?.email}
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '登出',
      onClick: handleSignOut,
    },
  ];

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        height: '64px', // 固定高度
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: '16px',
            width: 64,
            height: 64,
          }}
        />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClockCircleOutlined style={{ fontSize: '24px', color: '#3b82f6' }} />
          <Text strong style={{ fontSize: '18px' }}>
            {getCompanyName()} 打卡系統
          </Text>
        </div>
      </div>

      <Space size="middle" align="center">
        {/* 桌面版：顯示完整用戶信息 */}
        <div 
          style={{ 
            textAlign: 'right', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-end',
            minWidth: '120px',
          }}
          className="user-info-desktop" // 可以用 CSS 控制響應式顯示
        >
          <Text strong style={{ whiteSpace: 'nowrap', lineHeight: '20px' }}>
            {userData?.name || '用戶'}
          </Text>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            marginTop: '2px',
            flexWrap: 'nowrap'
          }}>
            <Tag color={roleInfo.color} size="small" style={{ margin: 0, flexShrink: 0 }}>
              {roleInfo.text}
            </Tag>
            <Text 
              type="secondary" 
              style={{ 
                fontSize: '11px', 
                whiteSpace: 'nowrap',
                maxWidth: '80px',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {userData?.department || '未設定'}
            </Text>
          </div>
        </div>
        
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          arrow
        >
          <Avatar 
            size="large" 
            icon={<UserOutlined />}
            style={{ 
              backgroundColor: '#3b82f6',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          />
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;