import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../firebase/firestoreService';
import toast from 'react-hot-toast';

const ClockWidget = ({ onClockAction }) => {
  const { userData } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [todayRecords, setTodayRecords] = useState([]);

  useEffect(() => {
    // 更新時間
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (userData) {
      loadTodayRecords();
    }
  }, [userData]);

  const loadTodayRecords = async () => {
    if (!userData?.uid) {
      console.log('❌ ClockWidget: 沒有用戶資料');
      return;
    }

    try {
      console.log('🔄 ClockWidget: 載入今日打卡記錄...');
      
      // 使用完全簡化的查詢，避免任何索引需求
      const records = await firestoreService.getTodayAttendance(userData.uid);
      console.log('✅ ClockWidget: 今日記錄數量:', records?.length || 0);
      
      setTodayRecords(records || []);
    } catch (error) {
      console.error('❌ ClockWidget: 載入今日打卡記錄失敗:', error);
      // 設定為空陣列，避免影響打卡功能
      setTodayRecords([]);
    }
  };

  const handleClockIn = async () => {
    setLoading(true);
    try {
      await firestoreService.clockIn(userData.uid);
      toast.success('上班打卡成功！');
      await loadTodayRecords();
      if (onClockAction) onClockAction();
    } catch (error) {
      console.error('打卡失敗:', error);
      toast.error('打卡失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    try {
      await firestoreService.clockOut(userData.uid);
      toast.success('下班打卡成功！');
      await loadTodayRecords();
      if (onClockAction) onClockAction();
    } catch (error) {
      console.error('打卡失敗:', error);
      toast.error('打卡失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const getLastClockAction = () => {
    if (todayRecords.length === 0) return null;
    return todayRecords[0]; // 最新的記錄
  };

  const canClockIn = () => {
    const lastAction = getLastClockAction();
    return !lastAction || lastAction.type === 'clock_out';
  };

  const canClockOut = () => {
    const lastAction = getLastClockAction();
    return lastAction && lastAction.type === 'clock_in';
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-TW', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('zh-TW', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getStatusText = () => {
    const lastAction = getLastClockAction();
    if (!lastAction) return '尚未打卡';
    return lastAction.type === 'clock_in' ? '已上班' : '已下班';
  };

  const getStatusColor = () => {
    const lastAction = getLastClockAction();
    if (!lastAction) return 'gray';
    return lastAction.type === 'clock_in' ? 'green' : 'red';
  };

  return (
    <div className="clock-widget">
      <div className="clock-time">
        {formatTime(currentTime)}
      </div>
      <div className="clock-date">
        {formatDate(currentTime)}
      </div>

      <div className="clock-status">
        <div 
          className={`clock-status-indicator ${getLastClockAction()?.type === 'clock_out' ? 'out' : ''}`}
          style={{ backgroundColor: getStatusColor() === 'green' ? '#10b981' : getStatusColor() === 'red' ? '#ef4444' : '#6b7280' }}
        />
        <span>{getStatusText()}</span>
      </div>

      <div className="clock-buttons">
        <button
          onClick={handleClockIn}
          disabled={!canClockIn() || loading}
          className="clock-btn"
          style={{ 
            opacity: !canClockIn() ? 0.5 : 1,
            cursor: !canClockIn() ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '處理中...' : '上班打卡'}
        </button>
        
        <button
          onClick={handleClockOut}
          disabled={!canClockOut() || loading}
          className="clock-btn"
          style={{ 
            opacity: !canClockOut() ? 0.5 : 1,
            cursor: !canClockOut() ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '處理中...' : '下班打卡'}
        </button>
      </div>

      {todayRecords.length > 0 && (
        <div className="mt-4 text-sm opacity-90">
          <p>今日打卡 {todayRecords.length} 次</p>
          {todayRecords.length > 0 && (
            <p>
              最後打卡: {formatTime(todayRecords[0].timestamp.toDate ? todayRecords[0].timestamp.toDate() : new Date(todayRecords[0].timestamp))}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ClockWidget;