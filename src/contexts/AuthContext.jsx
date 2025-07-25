import React, { createContext, useContext, useEffect, useState } from 'react';
import { message } from 'antd';
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
  const [systemSettings, setSystemSettings] = useState(null);

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
          
          // 檢查用戶狀態是否為啟用
          if (userDoc && userDoc.isActive === false) {
            // 如果用戶被停用，自動登出
            console.warn('用戶已被停用，自動登出');
            message.error('帳號已被管理員停用');
            await authService.signOut();
            setUser(null);
            setUserData(null);
            setLoading(false);
            return;
          }
          
          setUser(user);
          setUserData(userDoc);
          
          // 載入系統設定
          await loadSystemSettings();
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
      } else {
        // 如果系統已初始化，載入系統設定
        await loadSystemSettings();
      }
    } catch (error) {
      console.error('檢查系統初始化失敗:', error);
      setSystemInitialized(false);
      setLoading(false);
    } finally {
      setCheckingSystem(false);
    }
  };

  const loadSystemSettings = async () => {
    try {
      const settings = await systemService.getSystemSettings();
      setSystemSettings(settings);
    } catch (error) {
      console.error('載入系統設定失敗:', error);
      // 設定為 null，組件會使用預設值
      setSystemSettings(null);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password);
      setUser(result.user);
      setUserData(result.userData);
      
      // 登入後載入系統設定
      await loadSystemSettings();
      
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
      setSystemSettings(null);
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

      // 標記系統為已初始化，並傳入公司名稱
      const companyName = adminData.companyName || adminData.department || '企業打卡系統';
      await systemService.markSystemInitialized(companyName);
      
      // 更新系統初始化狀態
      setSystemInitialized(true);
      
      // 載入系統設定
      await loadSystemSettings();
      
      return true;
    } catch (error) {
      console.error('系統初始化失敗:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSystemSettings = async (newSettings) => {
    try {
      await systemService.updateSystemSettings(newSettings);
      setSystemSettings(newSettings);
      return true;
    } catch (error) {
      console.error('更新系統設定失敗:', error);
      throw error;
    }
  };

  const getCompanyName = () => {
    return systemSettings?.company?.name || '企業打卡系統';
  };

  const getWorkingHours = () => {
    return systemSettings?.workingHours || {
      defaultStart: '09:00',
      defaultEnd: '18:00',
      flexible: false
    };
  };

  const getLeaveTypes = async () => {
    return await systemService.getLeaveTypes();
  };

  const addLeaveType = async (leaveTypeData) => {
    try {
      const newLeaveType = await systemService.addLeaveType(leaveTypeData);
      await loadSystemSettings(); // 重新載入設定
      return newLeaveType;
    } catch (error) {
      console.error('新增請假假別失敗:', error);
      throw error;
    }
  };

  const deleteLeaveType = async (leaveTypeId) => {
    try {
      await systemService.deleteLeaveType(leaveTypeId);
      await loadSystemSettings(); // 重新載入設定
      return true;
    } catch (error) {
      console.error('刪除請假假別失敗:', error);
      throw error;
    }
  };

  const updateLeaveType = async (leaveTypeId, leaveTypeData) => {
    try {
      const updatedLeaveType = await systemService.updateLeaveType(leaveTypeId, leaveTypeData);
      await loadSystemSettings(); // 重新載入設定
      return updatedLeaveType;
    } catch (error) {
      console.error('更新請假假別失敗:', error);
      throw error;
    }
  };

  const getDepartments = async () => {
    return await systemService.getDepartments();
  };

  const addDepartment = async (departmentData) => {
    try {
      const newDepartment = await systemService.addDepartment(departmentData);
      await loadSystemSettings(); // 重新載入設定
      return newDepartment;
    } catch (error) {
      console.error('新增部門失敗:', error);
      throw error;
    }
  };

  const deleteDepartment = async (departmentId) => {
    try {
      await systemService.deleteDepartment(departmentId);
      await loadSystemSettings(); // 重新載入設定
      return true;
    } catch (error) {
      console.error('刪除部門失敗:', error);
      throw error;
    }
  };

  const updateDepartment = async (departmentId, departmentData) => {
    try {
      const updatedDepartment = await systemService.updateDepartment(departmentId, departmentData);
      await loadSystemSettings(); // 重新載入設定
      return updatedDepartment;
    } catch (error) {
      console.error('更新部門失敗:', error);
      throw error;
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
    isEmployee: userData?.role === 'employee',
    // 系統設定相關
    systemSettings,
    updateSystemSettings,
    loadSystemSettings,
    getCompanyName,
    getWorkingHours,
    // 部門管理相關
    getDepartments,
    addDepartment,
    deleteDepartment,
    updateDepartment,
    // 請假假別管理相關
    getLeaveTypes,
    addLeaveType,
    deleteLeaveType,
    updateLeaveType
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};