// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, logoutUser } from '../firebase/authService';

const AuthContext = createContext();

// 權限配置
export const PERMISSIONS = {
  admin: {
    canViewAllEmployees: true,
    canManageEmployees: true,
    canViewAllAttendance: true,
    canManageSettings: true,
    canExportReports: true,
    canViewDashboard: true,
    canCheckIn: true,
    canApplyLeave: true,
    canReviewAllLeaves: true
  },
  manager: {
    canViewAllEmployees: false,
    canManageDepartmentEmployees: true,
    canViewDepartmentAttendance: true,
    canManageSettings: false,
    canExportDepartmentReports: true,
    canViewDashboard: true,
    canCheckIn: true,
    canApplyLeave: true,
    canReviewDepartmentLeaves: true
  },
  employee: {
    canViewOwnAttendance: true,
    canCheckIn: true,
    canViewOwnProfile: true,
    canManageSettings: false,
    canExportReports: false,
    canViewDashboard: false,
    canApplyLeave: true,
    canViewOwnLeaves: true
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.error('登出錯誤:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function usePermissions() {
  const { user } = useAuth();
  return PERMISSIONS[user?.role] || {};
}