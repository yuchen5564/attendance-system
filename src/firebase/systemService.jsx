import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

export const systemService = {
  // 檢查系統是否已初始化（是否有管理員用戶）
  async checkSystemInitialized() {
    try {
      // 檢查是否有管理員用戶
      const adminQuery = query(
        collection(db, 'users'),
        where('role', '==', 'admin'),
        where('isActive', '==', true)
      );
      
      const adminSnapshot = await getDocs(adminQuery);
      const hasAdmin = !adminSnapshot.empty;

      // 也可以檢查系統設定文檔
      const systemConfigDoc = await getDoc(doc(db, 'system', 'config'));
      const hasSystemConfig = systemConfigDoc.exists();

      return {
        isInitialized: hasAdmin,
        hasAdmin,
        hasSystemConfig,
        adminCount: adminSnapshot.size
      };
    } catch (error) {
      console.error('檢查系統初始化狀態失敗:', error);
      // 如果檢查失敗，假設系統未初始化
      return {
        isInitialized: false,
        hasAdmin: false,
        hasSystemConfig: false,
        adminCount: 0
      };
    }
  },

  // 標記系統為已初始化
  async markSystemInitialized() {
    try {
      await setDoc(doc(db, 'system', 'config'), {
        initialized: true,
        initializedAt: serverTimestamp(),
        version: '1.0.0'
      });
    } catch (error) {
      console.error('標記系統初始化失敗:', error);
      throw error;
    }
  },

  // 獲取系統統計資訊
  async getSystemStats() {
    try {
      const [usersSnapshot, attendanceSnapshot, leaveSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'attendance')),
        getDocs(collection(db, 'leaveRequests'))
      ]);

      return {
        totalUsers: usersSnapshot.size,
        totalAttendance: attendanceSnapshot.size,
        totalLeaveRequests: leaveSnapshot.size
      };
    } catch (error) {
      console.error('獲取系統統計失敗:', error);
      return {
        totalUsers: 0,
        totalAttendance: 0,
        totalLeaveRequests: 0
      };
    }
  }
};