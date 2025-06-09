import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../firebase/authService';
import { firestoreService } from '../firebase/firestoreService';
import { systemService } from '../firebase/systemService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [systemInitialized, setSystemInitialized] = useState(false);
  const [checkingSystem, setCheckingSystem] = useState(true);

  useEffect(() => {
    // 首先檢查系統是否已初始化
    checkSystemInitialization();
  }, []);

  useEffect(() => {
    // 只有在系統已初始化後才監聽身份驗證狀態
    if (!systemInitialized || checkingSystem) return;

    const unsubscribe = authService.onAuthStateChange(async (user) => {
      if (user) {
        // 用戶已登入，獲取用戶資料
        try {
          const userDoc = await firestoreService.getUserById(user.uid);
          setUser(user);
          setUserData(userDoc);
        } catch (error) {
          console.error('獲取用戶資料失敗:', error);
          setUser(null);
          setUserData(null);
        }
      } else {
        // 用戶未登入
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [systemInitialized, checkingSystem]);

  const checkSystemInitialization = async () => {
    try {
      setCheckingSystem(true);
      const initStatus = await systemService.checkSystemInitialized();
      setSystemInitialized(initStatus.isInitialized);
      
      if (!initStatus.isInitialized) {
        setLoading(false); // 如果系統未初始化，停止載入狀態
      }
    } catch (error) {
      console.error('檢查系統初始化失敗:', error);
      setSystemInitialized(false);
      setLoading(false);
    } finally {
      setCheckingSystem(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password);
      setUser(result.user);
      setUserData(result.userData);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setUserData(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const initializeSystem = async (adminData) => {
    try {
      setLoading(true);
      
      // 創建管理員用戶
      await authService.createUser({
        ...adminData,
        role: 'admin'
      });

      // 標記系統為已初始化
      await systemService.markSystemInitialized();
      
      // 更新系統初始化狀態
      setSystemInitialized(true);
      
      return true;
    } catch (error) {
      console.error('系統初始化失敗:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userData,
    loading,
    signIn,
    signOut,
    initializeSystem,
    systemInitialized,
    checkingSystem,
    isAuthenticated: !!user,
    isAdmin: userData?.role === 'admin',
    isManager: userData?.role === 'manager',
    isEmployee: userData?.role === 'employee'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};