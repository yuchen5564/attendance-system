// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import CheckIn from './pages/CheckIn';
import EmployeeManagement from './pages/EmployeeManagement';
import AttendanceRecords from './pages/AttendanceRecords';
import LeaveManagement from './pages/LeaveManagement';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import LoadingSpinner from './components/Common/LoadingSpinner';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading, login } = useAuth();

  // 載入中狀態
  if (loading) {
    return <LoadingSpinner />;
  }

  // 未登入顯示登入頁面
  if (!user) {
    return <Login onLogin={login} />;
  }

  // 已登入顯示主應用
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/checkin" element={<CheckIn />} />
            <Route path="/employees" element={<EmployeeManagement />} />
            <Route path="/attendance" element={<AttendanceRecords />} />
            <Route path="/leaves" element={<LeaveManagement />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;