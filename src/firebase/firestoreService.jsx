// src/firebase/firestoreService.js
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// 員工管理
export const employeeService = {
  // 新增員工
  create: async (employeeData) => {
    try {
      const docRef = await addDoc(collection(db, 'employees'), {
        ...employeeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('新增員工錯誤:', error);
      throw error;
    }
  },

  // 取得所有員工
  getAll: async () => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'employees'), orderBy('createdAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('取得員工列表錯誤:', error);
      throw error;
    }
  },

  // 根據部門取得員工
  getByDepartment: async (department) => {
    try {
      const q = query(
        collection(db, 'employees'), 
        where('department', '==', department),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('取得部門員工錯誤:', error);
      throw error;
    }
  },

  // 更新員工
  update: async (id, employeeData) => {
    try {
      await updateDoc(doc(db, 'employees', id), {
        ...employeeData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('更新員工錯誤:', error);
      throw error;
    }
  },

  // 刪除員工
  delete: async (id) => {
    try {
      await deleteDoc(doc(db, 'employees', id));
    } catch (error) {
      console.error('刪除員工錯誤:', error);
      throw error;
    }
  },

  // 監聽員工變化
  listen: (callback) => {
    return onSnapshot(
      query(collection(db, 'employees'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const employees = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(employees);
      },
      (error) => {
        console.error('監聽員工變化錯誤:', error);
      }
    );
  }
};

// 出勤記錄管理
export const attendanceService = {
  // 新增出勤記錄
  create: async (attendanceData) => {
    try {
      const docRef = await addDoc(collection(db, 'attendance'), {
        ...attendanceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('新增出勤記錄錯誤:', error);
      throw error;
    }
  },

  // 取得所有出勤記錄
  getAll: async () => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'attendance'), orderBy('date', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('取得出勤記錄錯誤:', error);
      throw error;
    }
  },

  // 根據員工ID取得出勤記錄
  getByEmployee: async (employeeId) => {
    try {
      const q = query(
        collection(db, 'attendance'),
        where('employeeId', '==', employeeId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('取得員工出勤記錄錯誤:', error);
      throw error;
    }
  },

  // 根據日期範圍取得出勤記錄
  getByDateRange: async (startDate, endDate) => {
    try {
      const q = query(
        collection(db, 'attendance'),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('取得日期範圍出勤記錄錯誤:', error);
      throw error;
    }
  },

  // 更新出勤記錄
  update: async (id, attendanceData) => {
    try {
      await updateDoc(doc(db, 'attendance', id), {
        ...attendanceData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('更新出勤記錄錯誤:', error);
      throw error;
    }
  },

  // 監聽出勤記錄變化
  listen: (callback) => {
    return onSnapshot(
      query(collection(db, 'attendance'), orderBy('date', 'desc')),
      (snapshot) => {
        const records = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(records);
      },
      (error) => {
        console.error('監聽出勤記錄變化錯誤:', error);
      }
    );
  }
};

// 請假管理
export const leaveService = {
  // 新增請假申請
  create: async (leaveData) => {
    try {
      const docRef = await addDoc(collection(db, 'leaves'), {
        ...leaveData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('新增請假申請錯誤:', error);
      throw error;
    }
  },

  // 取得所有請假記錄
  getAll: async () => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'leaves'), orderBy('appliedAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('取得請假記錄錯誤:', error);
      throw error;
    }
  },

  // 根據員工ID取得請假記錄
  getByEmployee: async (employeeId) => {
    try {
      const q = query(
        collection(db, 'leaves'),
        where('employeeId', '==', employeeId),
        orderBy('appliedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('取得員工請假記錄錯誤:', error);
      throw error;
    }
  },

  // 根據狀態取得請假記錄
  getByStatus: async (status) => {
    try {
      const q = query(
        collection(db, 'leaves'),
        where('status', '==', status),
        orderBy('appliedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('取得請假記錄錯誤:', error);
      throw error;
    }
  },

  // 更新請假記錄（審核）
  update: async (id, leaveData) => {
    try {
      await updateDoc(doc(db, 'leaves', id), {
        ...leaveData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('更新請假記錄錯誤:', error);
      throw error;
    }
  },

  // 監聽請假記錄變化
  listen: (callback) => {
    return onSnapshot(
      query(collection(db, 'leaves'), orderBy('appliedAt', 'desc')),
      (snapshot) => {
        const leaves = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(leaves);
      },
      (error) => {
        console.error('監聽請假記錄變化錯誤:', error);
      }
    );
  }
};

// 系統設定管理
export const settingsService = {
  // 取得系統設定
  get: async () => {
    try {
      const docRef = doc(db, 'settings', 'company');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        // 如果沒有設定，返回預設值
        return {
          companyName: '範例公司',
          workHours: { start: '09:00', end: '18:00' },
          breakTime: { start: '12:00', end: '13:00' },
          overtimeRate: 1.5,
          lateThreshold: 15,
          notifications: {
            email: true,
            sms: false,
            push: true
          }
        };
      }
    } catch (error) {
      console.error('取得系統設定錯誤:', error);
      throw error;
    }
  },

  // 更新系統設定
  update: async (settingsData) => {
    try {
      await updateDoc(doc(db, 'settings', 'company'), {
        ...settingsData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('更新系統設定錯誤:', error);
      throw error;
    }
  },

  // 監聽系統設定變化
  listen: (callback) => {
    return onSnapshot(
      doc(db, 'settings', 'company'),
      (doc) => {
        if (doc.exists()) {
          callback(doc.data());
        }
      },
      (error) => {
        console.error('監聽系統設定變化錯誤:', error);
      }
    );
  }
};