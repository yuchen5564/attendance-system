import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc 
} from 'firebase/firestore';
import { auth, db, secondaryAuth } from './config';

export const authService = {
  // 登入
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 獲取用戶詳細資料
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // 檢查用戶狀態是否為啟用
        if (userData.isActive === false) {
          // 如果用戶被停用，立即登出並拋出錯誤
          await signOut(auth);
          throw new Error('帳號已被管理員停用');
        }
        
        return { user, userData };
      } else {
        throw new Error('用戶資料不存在');
      }
    } catch (error) {
      console.error('登入錯誤:', error);
      throw error;
    }
  },

  // 登出
  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('登出錯誤:', error);
      throw error;
    }
  },

  // 註冊新用戶 (管理員功能) - 使用第二個 Auth 實例
  async createUser(userData) {
    try {
      // 使用第二個 Auth 實例創建用戶，不會影響主要的登入狀態
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth, 
        userData.email, 
        userData.password
      );
      const newUser = userCredential.user;

      // 儲存新用戶詳細資料到 Firestore
      await setDoc(doc(db, 'users', newUser.uid), {
        uid: newUser.uid,
        email: userData.email,
        name: userData.name,
        department: userData.department,
        position: userData.position,
        role: userData.role || 'employee',
        managerId: userData.managerId || null,
        workingHours: userData.workingHours || {
          start: '09:00',
          end: '18:00'
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // 登出第二個實例的用戶（清理狀態）
      await signOut(secondaryAuth);

      return newUser;
    } catch (error) {
      console.error('創建用戶錯誤:', error);
      throw error;
    }
  },

  // 更新用戶資料（不包含密碼）
  async updateUser(userData) {
    try {
      // 注意：由於 Firebase 安全限制，無法直接修改其他用戶的密碼
      // 如果需要重設密碼，建議使用 Firebase 的密碼重設功能
      const { uid, password, ...updateData } = userData;
      
      // 過濾掉 undefined 值，避免 Firestore 錯誤
      const cleanData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          cleanData[key] = updateData[key];
        }
      });
      
      // 只更新 Firestore 中的用戶資料
      await updateDoc(doc(db, 'users', uid), {
        ...cleanData,
        updatedAt: new Date()
      });

      // 如果管理員想要重設用戶密碼，需要發送密碼重設郵件
      if (password && password.trim()) {
        console.log('注意：管理員無法直接修改用戶密碼，建議使用密碼重設功能');
        throw new Error('安全考量：無法直接修改用戶密碼，請使用密碼重設功能');
      }

      return true;
    } catch (error) {
      console.error('更新用戶錯誤:', error);
      throw error;
    }
  },

  // 監聽身份驗證狀態變化
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // 獲取當前用戶
  getCurrentUser() {
    return auth.currentUser;
  }
};