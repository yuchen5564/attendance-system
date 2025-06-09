import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../firebase/firestoreService';
import LoadingSpinner from '../components/LoadingSpinner';
import ClockWidget from '../components/ClockWidget';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { userData, isAdmin, isManager } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAttendance: 0,
    monthlyAttendance: 0,
    pendingLeaves: 0,
    totalEmployees: 0
  });
  const [recentAttendance, setRecentAttendance] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [userData]);

  const loadDashboardData = async () => {
    if (!userData) {
      console.log('❌ 沒有用戶資料，跳過載入');
      return;
    }

    try {
      setLoading(true);
      console.log('🚀 開始載入儀表板數據...');
      console.log('📋 當前用戶:', { uid: userData.uid, role: userData.role });
      
      // 1. 載入今日打卡狀態 - 使用簡化查詢
      console.log('⏰ 載入今日打卡記錄...');
      const todayRecords = await firestoreService.getTodayAttendance(userData.uid);
      console.log('✅ 今日打卡記錄:', todayRecords?.length || 0);
      
      // 2. 載入最近的打卡記錄 - 使用簡化查詢
      console.log('📊 載入最近打卡記錄...');
      const recentRecords = await firestoreService.getAttendanceRecords(userData.uid);
      console.log('✅ 最近打卡記錄:', recentRecords?.length || 0);
      
      // 只取前5筆顯示
      setRecentAttendance((recentRecords || []).slice(0, 5));

      // 3. 載入統計數據（根據權限）
      if (isAdmin || isManager) {
        console.log('👑 載入管理員統計數據...');
        
        try {
          // 分別載入避免複雜查詢
          const users = await firestoreService.getAllUsers();
          console.log('✅ 用戶數據載入完成:', users?.length || 0);
          
          const leaveRequests = await firestoreService.getLeaveRequests();
          console.log('✅ 請假申請載入完成:', leaveRequests?.length || 0);

          setStats({
            todayAttendance: (todayRecords || []).length,
            monthlyAttendance: (recentRecords || []).length,
            pendingLeaves: (leaveRequests || []).filter(req => req.status === 'pending').length,
            totalEmployees: (users || []).length
          });
        } catch (adminError) {
          console.error('⚠️ 管理員數據載入部分失敗:', adminError);
          // 即使管理員數據載入失敗，也顯示基本統計
          setStats({
            todayAttendance: (todayRecords || []).length,
            monthlyAttendance: (recentRecords || []).length,
            pendingLeaves: 0,
            totalEmployees: 0
          });
        }
      } else {
        console.log('👤 載入員工統計數據...');
        
        try {
          // 員工只載入自己的請假申請
          const userLeaves = await firestoreService.getLeaveRequests(userData.uid);
          console.log('✅ 用戶請假申請:', userLeaves?.length || 0);
          
          setStats({
            todayAttendance: (todayRecords || []).length,
            monthlyAttendance: (recentRecords || []).length,
            pendingLeaves: (userLeaves || []).filter(req => req.status === 'pending').length,
            totalEmployees: 0
          });
        } catch (employeeError) {
          console.error('⚠️ 員工數據載入部分失敗:', employeeError);
          // 基本統計，不依賴請假數據
          setStats({
            todayAttendance: (todayRecords || []).length,
            monthlyAttendance: (recentRecords || []).length,
            pendingLeaves: 0,
            totalEmployees: 0
          });
        }
      }
      
      console.log('🎉 儀表板數據載入完成');
    } catch (error) {
      console.error('❌ 載入儀表板數據失敗:', error);
      console.error('🔍 錯誤詳情:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // 顯示更具體的錯誤訊息
      if (error.message?.includes('index')) {
        toast.error('資料查詢需要建立索引，請檢查 Firebase 設定');
      } else {
        toast.error('載入數據失敗: ' + (error.message || '未知錯誤'));
      }
      
      // 設定空的統計資料，避免頁面崩潰
      setStats({
        todayAttendance: 0,
        monthlyAttendance: 0,
        pendingLeaves: 0,
        totalEmployees: 0
      });
      setRecentAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="載入儀表板中..." />;
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString('zh-TW', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.warn('時間格式化失敗:', error);
      return '';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('zh-TW');
    } catch (error) {
      console.warn('日期格式化失敗:', error);
      return '';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>儀表板</h1>
          <p className="text-gray-600">歡迎回來，{userData?.name}！</p>
        </div>
      </div>

      {/* 打卡組件 */}
      <div className="mb-6">
        <ClockWidget onClockAction={loadDashboardData} />
      </div>

      {/* 統計卡片 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">今日打卡</div>
          <div className="stat-value">{stats.todayAttendance}</div>
          <div className="flex items-center gap-1 mt-2">
            <Clock size={16} className="text-blue-600" />
            <span className="text-sm text-gray-600">次</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-label">本月出勤</div>
          <div className="stat-value">{stats.monthlyAttendance}</div>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp size={16} className="text-green-600" />
            <span className="text-sm text-gray-600">次</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-label">待審核請假</div>
          <div className="stat-value">{stats.pendingLeaves}</div>
          <div className="flex items-center gap-1 mt-2">
            <Calendar size={16} className="text-yellow-600" />
            <span className="text-sm text-gray-600">件</span>
          </div>
        </div>

        {(isAdmin || isManager) && (
          <div className="stat-card">
            <div className="stat-label">總員工數</div>
            <div className="stat-value">{stats.totalEmployees}</div>
            <div className="flex items-center gap-1 mt-2">
              <Users size={16} className="text-blue-600" />
              <span className="text-sm text-gray-600">人</span>
            </div>
          </div>
        )}
      </div>

      {/* 最近打卡記錄 */}
      <div className="card">
        <div className="card-header">
          <h3>最近打卡記錄</h3>
        </div>
        <div className="card-body">
          {recentAttendance.length === 0 ? (
            <p className="text-gray-500 text-center py-4">暫無打卡記錄</p>
          ) : (
            <div className="space-y-2">
              {recentAttendance.map((record) => (
                <div
                  key={record.id}
                  className={`attendance-record ${record.type.replace('_', '-')}`}
                >
                  <div>
                    <div className="attendance-time">
                      {formatTime(record.timestamp)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(record.timestamp)}
                    </div>
                  </div>
                  <div className={`attendance-type ${record.type.replace('_', '-')}`}>
                    {record.type === 'clock_in' ? '上班打卡' : '下班打卡'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;