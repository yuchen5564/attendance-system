import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// 預設系統設定
const DEFAULT_SETTINGS = {
  company: {
    name: '企業打卡系統',
    address: '',
    phone: '',
    email: ''
  },
  workingHours: {
    defaultStart: '09:00',
    defaultEnd: '18:00',
    flexible: false
  },
  attendance: {
    allowEarlyClockIn: 30,
    allowLateClockOut: 30,
    autoClockOut: false
  },
  leave: {
    requireApproval: true,
    maxAdvanceDays: 30,
    allowSameDay: false
  },
  notifications: {
    emailNotifications: true,
    reminderTime: '08:30',
    weekendReminders: false
  }
};

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

      // 檢查系統設定文檔
      const systemConfigDoc = await getDoc(doc(db, 'system', 'config'));
      const hasSystemConfig = systemConfigDoc.exists();

      return {
        isInitialized: hasAdmin && hasSystemConfig,
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

  // 標記系統為已初始化並創建預設設定
  async markSystemInitialized(companyName = null) {
    try {
      // 準備系統設定
      const systemSettings = {
        ...DEFAULT_SETTINGS,
        // 如果有提供公司名稱，則使用；否則使用預設值
        company: {
          ...DEFAULT_SETTINGS.company,
          name: companyName || DEFAULT_SETTINGS.company.name
        }
      };

      // 創建系統配置文檔
      await setDoc(doc(db, 'system', 'config'), {
        initialized: true,
        initializedAt: serverTimestamp(),
        version: '2.0.0',
        lastUpdated: serverTimestamp()
      });

      // 創建系統設定文檔
      await setDoc(doc(db, 'system', 'settings'), {
        ...systemSettings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('系統初始化完成，預設設定已創建');
      return true;
    } catch (error) {
      console.error('標記系統初始化失敗:', error);
      throw error;
    }
  },

  // 獲取系統設定
  async getSystemSettings() {
    try {
      const settingsDoc = await getDoc(doc(db, 'system', 'settings'));
      
      if (settingsDoc.exists()) {
        return settingsDoc.data();
      } else {
        // 如果設定不存在，創建預設設定
        console.log('系統設定不存在，創建預設設定...');
        await this.createDefaultSettings();
        return DEFAULT_SETTINGS;
      }
    } catch (error) {
      console.error('獲取系統設定失敗:', error);
      // 發生錯誤時返回預設設定
      return DEFAULT_SETTINGS;
    }
  },

  // 更新系統設定
  async updateSystemSettings(newSettings) {
    try {
      await updateDoc(doc(db, 'system', 'settings'), {
        ...newSettings,
        updatedAt: serverTimestamp()
      });
      
      console.log('系統設定已更新');
      return true;
    } catch (error) {
      console.error('更新系統設定失敗:', error);
      throw error;
    }
  },

  // 創建預設設定（內部使用）
  async createDefaultSettings() {
    try {
      await setDoc(doc(db, 'system', 'settings'), {
        ...DEFAULT_SETTINGS,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('創建預設設定失敗:', error);
      throw error;
    }
  },

  // 獲取公司名稱（快捷方法）
  async getCompanyName() {
    try {
      const settings = await this.getSystemSettings();
      return settings.company?.name || '企業打卡系統';
    } catch (error) {
      console.error('獲取公司名稱失敗:', error);
      return '企業打卡系統';
    }
  },

  // 獲取工作時間設定（快捷方法）
  async getWorkingHours() {
    try {
      const settings = await this.getSystemSettings();
      return settings.workingHours || DEFAULT_SETTINGS.workingHours;
    } catch (error) {
      console.error('獲取工作時間設定失敗:', error);
      return DEFAULT_SETTINGS.workingHours;
    }
  },

  // 重置系統設定為預設值
  async resetSystemSettings() {
    try {
      await updateDoc(doc(db, 'system', 'settings'), {
        ...DEFAULT_SETTINGS,
        updatedAt: serverTimestamp()
      });
      
      console.log('系統設定已重置為預設值');
      return true;
    } catch (error) {
      console.error('重置系統設定失敗:', error);
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