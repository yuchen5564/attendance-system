import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Layout, theme, App as AntApp, Drawer } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import InitializeSystem from './components/InitializeSystem';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AttendancePage from './pages/AttendancePage';
import CalendarPage from './pages/CalendarPage';
import LeaveRequestsPage from './pages/LeaveRequestsPage';
import OvertimeRequestsPage from './pages/OvertimeRequestsPage';
import EmployeesPage from './pages/EmployeesPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

// 設定 dayjs 語言
dayjs.locale('zh-tw');

const { Content, Sider } = Layout;

// 受保護的路由組件
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="載入中..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 主佈局組件
const MainLayout = ({ currentPage, setCurrentPage }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 檢測螢幕尺寸
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'calendar':
        return <CalendarPage />;
      case 'leave-requests':
        return <LeaveRequestsPage />;
      case 'overtime-requests':
        return <OvertimeRequestsPage />;
      case 'employees':
        return <EmployeesPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 桌面版側邊欄 */}
      {!isMobile && (
        <Sider
          theme="light"
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          breakpoint="lg"
          onBreakpoint={(broken) => {
            if (broken) {
              setCollapsed(true);
            }
          }}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <Sidebar 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage}
            collapsed={collapsed}
          />
        </Sider>
      )}

      {/* 手機版側邊欄抽屜 */}
      {isMobile && (
        <Drawer
          title="選單"
          placement="left"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
          bodyStyle={{ padding: 0 }}
          width={280}
        >
          <Sidebar 
            currentPage={currentPage} 
            setCurrentPage={(page) => {
              setCurrentPage(page);
              setMobileDrawerOpen(false);
            }}
            collapsed={false}
            isMobile={true}
          />
        </Drawer>
      )}
      
      <Layout style={{ 
        marginLeft: isMobile ? 0 : (collapsed ? 80 : 200), 
        transition: 'margin-left 0.2s' 
      }}>
        <Header 
          collapsed={collapsed} 
          setCollapsed={setCollapsed}
          isMobile={isMobile}
          setMobileDrawerOpen={setMobileDrawerOpen}
        />
        
        <Content
          style={{
            padding: isMobile ? 16 : 24,
            margin: 0,
            minHeight: 280,
            background: '#f5f5f5',
          }}
        >
          {renderCurrentPage()}
        </Content>
      </Layout>
    </Layout>
  );
};

// 應用程式主組件
const AppContent = () => {
  const { isAuthenticated, loading, systemInitialized, checkingSystem } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // 如果正在檢查系統狀態，顯示載入畫面
  if (checkingSystem) {
    return <LoadingSpinner text="檢查系統狀態..." />;
  }

  // 如果系統未初始化，顯示初始化頁面
  if (!systemInitialized) {
    return <InitializeSystem />;
  }

  if (loading) {
    return <LoadingSpinner text="初始化應用程式..." />;
  }

  return (
    <Routes>
      {/* 公開路由 */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        } 
      />

      {/* 受保護的路由 - 統一使用主佈局 */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
            />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

// 主應用程式組件
const App = () => {
  return (
    <ConfigProvider 
      locale={zhTW}
      theme={{
        token: {
          colorPrimary: '#3b82f6',
          borderRadius: 8,
          colorBgLayout: '#f5f5f5',
        },
        components: {
          Layout: {
            siderBg: '#ffffff',
            bodyBg: '#f5f5f5',
          },
        },
      }}
    >
      <AntApp>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;