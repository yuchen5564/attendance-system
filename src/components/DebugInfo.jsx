import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const DebugInfo = () => {
  const { user, userData } = useAuth();
  const [debugInfo, setDebugInfo] = useState({
    firebaseConnected: false,
    userCount: 0,
    attendanceCount: 0,
    leaveCount: 0,
    currentUser: null,
    errors: []
  });

  useEffect(() => {
    runDiagnostics();
  }, [user]);

  const runDiagnostics = async () => {
    const errors = [];
    let firebaseConnected = false;
    let userCount = 0;
    let attendanceCount = 0;
    let leaveCount = 0;
    let currentUser = null;

    try {
      // 測試 Firebase 連接
      console.log('測試 Firebase 連接...');
      
      // 測試讀取 users 集合
      const usersSnapshot = await getDocs(collection(db, 'users'));
      userCount = usersSnapshot.size;
      firebaseConnected = true;
      console.log('✅ Firebase 連接成功，用戶數量:', userCount);

      // 測試讀取 attendance 集合
      try {
        const attendanceSnapshot = await getDocs(collection(db, 'attendance'));
        attendanceCount = attendanceSnapshot.size;
        console.log('✅ 出勤記錄數量:', attendanceCount);
      } catch (error) {
        console.warn('⚠️ 讀取出勤記錄失敗:', error.message);
        errors.push(`出勤記錄: ${error.message}`);
      }

      // 測試讀取 leaveRequests 集合
      try {
        const leaveSnapshot = await getDocs(collection(db, 'leaveRequests'));
        leaveCount = leaveSnapshot.size;
        console.log('✅ 請假申請數量:', leaveCount);
      } catch (error) {
        console.warn('⚠️ 讀取請假申請失敗:', error.message);
        errors.push(`請假申請: ${error.message}`);
      }

      // 測試當前用戶資料
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            currentUser = userDoc.data();
            console.log('✅ 當前用戶資料:', currentUser);
          } else {
            errors.push('當前用戶在 Firestore 中不存在');
          }
        } catch (error) {
          console.warn('⚠️ 讀取當前用戶失敗:', error.message);
          errors.push(`當前用戶: ${error.message}`);
        }
      }

    } catch (error) {
      console.error('❌ Firebase 連接失敗:', error);
      errors.push(`Firebase 連接: ${error.message}`);
    }

    setDebugInfo({
      firebaseConnected,
      userCount,
      attendanceCount,
      leaveCount,
      currentUser,
      errors
    });
  };

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h3>🔧 系統診斷資訊</h3>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Firebase 狀態</h4>
            <p className={`text-sm ${debugInfo.firebaseConnected ? 'text-green-600' : 'text-red-600'}`}>
              {debugInfo.firebaseConnected ? '✅ 已連接' : '❌ 連接失敗'}
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">資料統計</h4>
            <p className="text-sm">用戶數量: {debugInfo.userCount}</p>
            <p className="text-sm">出勤記錄: {debugInfo.attendanceCount}</p>
            <p className="text-sm">請假申請: {debugInfo.leaveCount}</p>
          </div>

          <div>
            <h4 className="font-medium mb-2">當前用戶</h4>
            {user ? (
              <div className="text-sm">
                <p>UID: {user.uid}</p>
                <p>Email: {user.email}</p>
                <p>角色: {userData?.role || '未知'}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">未登入</p>
            )}
          </div>

          <div>
            <h4 className="font-medium mb-2">Firebase 配置</h4>
            <div className="text-sm">
              <p>Project ID: {import.meta.env.VITE_FIREBASE_PROJECT_ID || '未設定'}</p>
              <p>Auth Domain: {import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '未設定'}</p>
            </div>
          </div>
        </div>

        {debugInfo.errors.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2 text-red-600">錯誤訊息</h4>
            <ul className="text-sm text-red-600">
              {debugInfo.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={runDiagnostics}
            className="btn btn-primary btn-sm"
          >
            重新診斷
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugInfo;