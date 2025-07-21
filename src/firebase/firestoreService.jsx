import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

export const firestoreService = {
  // 打卡相關
  async clockIn(userId) {
    try {
      const clockInData = {
        userId,
        type: 'clock_in',
        timestamp: new Date(),
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'attendance'), clockInData);
      return docRef.id;
    } catch (error) {
      console.error('打卡錯誤:', error);
      throw error;
    }
  },

  async clockOut(userId) {
    try {
      const clockOutData = {
        userId,
        type: 'clock_out',
        timestamp: new Date(),
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'attendance'), clockOutData);
      return docRef.id;
    } catch (error) {
      console.error('打卡錯誤:', error);
      throw error;
    }
  },

  // 獲取用戶打卡記錄
  async getAttendanceRecords(userId = null, startDate = null, endDate = null) {
    try {
      let q;
      
      if (userId) {
        // 獲取特定用戶的記錄
        q = query(
          collection(db, 'attendance'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc')
        );
        
        if (startDate && endDate) {
          q = query(
            collection(db, 'attendance'),
            where('userId', '==', userId),
            where('timestamp', '>=', startDate),
            where('timestamp', '<=', endDate),
            orderBy('timestamp', 'desc')
          );
        }
      } else {
        // 獲取所有記錄（管理員用）
        q = query(
          collection(db, 'attendance'),
          orderBy('timestamp', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const records = [];
      querySnapshot.forEach((doc) => {
        records.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('載入出勤記錄數量:', records.length); // 除錯用
      return records;
    } catch (error) {
      console.error('獲取打卡記錄錯誤:', error);
      throw error;
    }
  },

  // 請假相關
  async submitLeaveRequest(leaveData) {
    try {
      const docRef = await addDoc(collection(db, 'leaveRequests'), {
        ...leaveData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('提交請假申請錯誤:', error);
      throw error;
    }
  },

  async getLeaveRequests(userId = null, status = null) {
    try {
      let q = collection(db, 'leaveRequests');
      const constraints = [];
      
      if (userId) {
        constraints.push(where('userId', '==', userId));
      }
      
      if (status) {
        constraints.push(where('status', '==', status));
      }
      
      constraints.push(orderBy('createdAt', 'desc'));
      
      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }

      const querySnapshot = await getDocs(q);
      const requests = [];
      querySnapshot.forEach((doc) => {
        requests.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('載入請假申請數量:', requests.length); // 除錯用
      return requests;
    } catch (error) {
      console.error('獲取請假申請錯誤:', error);
      throw error;
    }
  },

  async approveLeaveRequest(requestId, approverId, comments = '') {
    try {
      await updateDoc(doc(db, 'leaveRequests', requestId), {
        status: 'approved',
        approverId,
        approvedAt: serverTimestamp(),
        comments,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('批准請假申請錯誤:', error);
      throw error;
    }
  },

  async rejectLeaveRequest(requestId, approverId, comments = '') {
    try {
      await updateDoc(doc(db, 'leaveRequests', requestId), {
        status: 'rejected',
        approverId,
        rejectedAt: serverTimestamp(),
        comments,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('拒絕請假申請錯誤:', error);
      throw error;
    }
  },

  // 加班申請相關
  async submitOvertimeRequest(overtimeData) {
    try {
      const docRef = await addDoc(collection(db, 'overtimeRequests'), {
        ...overtimeData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('提交加班申請錯誤:', error);
      throw error;
    }
  },

  async getOvertimeRequests(userId = null, status = null) {
    try {
      let q = collection(db, 'overtimeRequests');
      const constraints = [];
      
      if (userId) {
        constraints.push(where('userId', '==', userId));
      }
      
      if (status) {
        constraints.push(where('status', '==', status));
      }
      
      constraints.push(orderBy('createdAt', 'desc'));
      
      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }

      const querySnapshot = await getDocs(q);
      const requests = [];
      querySnapshot.forEach((doc) => {
        requests.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('載入加班申請數量:', requests.length);
      return requests;
    } catch (error) {
      console.error('獲取加班申請錯誤:', error);
      throw error;
    }
  },

  async approveOvertimeRequest(requestId, approverId, comments = '') {
    try {
      await updateDoc(doc(db, 'overtimeRequests', requestId), {
        status: 'approved',
        approverId,
        approvedAt: serverTimestamp(),
        comments,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('批准加班申請錯誤:', error);
      throw error;
    }
  },

  async rejectOvertimeRequest(requestId, approverId, comments = '') {
    try {
      await updateDoc(doc(db, 'overtimeRequests', requestId), {
        status: 'rejected',
        approverId,
        rejectedAt: serverTimestamp(),
        comments,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('拒絕加班申請錯誤:', error);
      throw error;
    }
  },

  // 用戶管理
  async getAllUsers() {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          uid: doc.id, // 確保有 uid 欄位
          ...doc.data()
        });
      });
      console.log('載入用戶數量:', users.length); // 除錯用
      return users;
    } catch (error) {
      console.error('獲取用戶列表錯誤:', error);
      throw error;
    }
  },

  async getUserById(userId) {
    try {
      const docSnap = await getDoc(doc(db, 'users', userId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('獲取用戶資料錯誤:', error);
      throw error;
    }
  },

  async updateUser(userId, userData) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...userData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('更新用戶資料錯誤:', error);
      throw error;
    }
  },

  // 檢查當天是否已打卡
  async getTodayAttendance(userId) {
    try {
      console.log('獲取今日打卡記錄，用戶ID:', userId);
      
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      console.log('日期範圍:', { startOfDay, endOfDay });

      const q = query(
        collection(db, 'attendance'),
        where('userId', '==', userId),
        where('timestamp', '>=', startOfDay),
        where('timestamp', '<', endOfDay),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const records = [];
      querySnapshot.forEach((doc) => {
        records.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('今日打卡記錄數量:', records.length);
      return records;
    } catch (error) {
      console.error('獲取今日打卡記錄錯誤:', error);
      // 如果是索引問題，返回空陣列而不是拋出錯誤
      if (error.code === 'failed-precondition' || error.message.includes('index')) {
        console.warn('⚠️ Firestore 索引問題，返回空記錄');
        return [];
      }
      throw error;
    }
  }
};