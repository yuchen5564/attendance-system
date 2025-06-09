// src/firebase/authService.js
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';

// 登入
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 取得用戶資料
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        ...userData
      };
    } else {
      throw new Error('用戶資料不存在');
    }
  } catch (error) {
    console.error('登入錯誤:', error);
    throw error;
  }
};

// 註冊
export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 更新 Firebase Auth 的 displayName
    await updateProfile(user, {
      displayName: userData.name
    });
    
    // 在 Firestore 中創建用戶文檔
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: userData.name,
      ...userData
    };
  } catch (error) {
    console.error('註冊錯誤:', error);
    throw error;
  }
};

// 登出
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('登出錯誤:', error);
    throw error;
  }
};

// 重設密碼
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('重設密碼錯誤:', error);
    throw error;
  }
};

// 監聽認證狀態變化
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // 用戶已登入，取得用戶資料
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          callback({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            ...userData
          });
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('取得用戶資料錯誤:', error);
        callback(null);
      }
    } else {
      // 用戶已登出
      callback(null);
    }
  });
};

// 更新用戶資料
export const updateUserProfile = async (uid, userData) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...userData,
      updatedAt: new Date().toISOString()
    });
    
    // 如果有更新 displayName，也更新 Firebase Auth
    if (userData.name && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: userData.name
      });
    }
  } catch (error) {
    console.error('更新用戶資料錯誤:', error);
    throw error;
  }
};