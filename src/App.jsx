import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import InitializeSystem from './components/InitializeSystem';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AttendancePage from './pages/AttendancePage';
import LeaveRequestsPage from './pages/LeaveRequestsPage';
import EmployeesPage from './pages/EmployeesPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

// 樣式檔案
import './App.css';
import './styles/main.css';
import './styles/components.css';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'leave-requests':
        return <LeaveRequestsPage />;
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
    <div className="app-container">
      <header className="app-header">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </header>
      
      <div className="app-main">
        <aside className="app-sidebar">
          <Sidebar 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </aside>
        
        <main className="app-content">
          {renderCurrentPage()}
        </main>
      </div>
      
      {/* 手機版背景遮罩 */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay show"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
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
    <AuthProvider>
      <Router>
        <div className="App">
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#4aed88',
                },
              },
              error: {
                duration: 4000,
                theme: {
                  primary: '#ff6b6b',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;