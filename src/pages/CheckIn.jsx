// pages/CheckIn.js
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { attendanceService } from '../firebase/firestoreService';

function CheckIn() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadTodayRecord();
  }, [user]);

  const loadTodayRecord = async () => {
    try {
      const records = await attendanceService.getByEmployee(user.employeeId);
      const todaysRecord = records.find(record => record.date === today);
      setTodayRecord(todaysRecord || null);
    } catch (error) {
      console.error('載入今日出勤記錄錯誤:', error);
      setError('載入出勤記錄失敗');
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setError('');

    try {
      const now = new Date();
      const timeString = now.toTimeString().slice(0, 5);
      
      // 判斷是否遲到（假設標準上班時間是09:00）
      const isLate = timeString > '09:00';
      
      const attendanceData = {
        employeeId: user.employeeId,
        date: today,
        checkIn: timeString,
        checkOut: null,
        status: isLate ? 'late' : 'normal',
        employeeName: user.name || user.displayName,
        department: user.department
      };

      const recordId = await attendanceService.create(attendanceData);
      
      // 更新本地狀態
      setTodayRecord({
        id: recordId,
        ...attendanceData
      });

    } catch (error) {
      console.error('打卡失敗:', error);
      setError('打卡失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayRecord) return;

    setLoading(true);
    setError('');

    try {
      const now = new Date();
      const timeString = now.toTimeString().slice(0, 5);
      
      await attendanceService.update(todayRecord.id, {
        checkOut: timeString
      });

      // 更新本地狀態
      setTodayRecord(prev => ({
        ...prev,
        checkOut: timeString
      }));

    } catch (error) {
      console.error('下班打卡失敗:', error);
      setError('下班打卡失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 text-center">
        {user.name || user.displayName} 的打卡
      </h2>
      
      {/* 錯誤提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* 時鐘顯示 */}
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl font-mono font-bold text-gray-900 mb-2 attendance-clock">
          {currentTime.toTimeString().slice(0, 8)}
        </div>
        <div className="text-xl text-gray-600">
          {currentTime.toLocaleDateString('zh-TW', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
          })}
        </div>
        <div className="text-sm text-gray-500 mt-2">
          {user.department} - {user.name || user.displayName}
        </div>
      </div>

      {/* 打卡按鈕 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleCheckIn}
            disabled={loading || todayRecord?.checkIn}
            className={`py-4 px-6 rounded-lg font-medium text-white transition duration-200 ${
              todayRecord?.checkIn 
                ? 'bg-gray-400 cursor-not-allowed' 
                : loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 btn-animate'
            }`}
          >
            <Clock className="h-6 w-6 mx-auto mb-2" />
            {loading && !todayRecord?.checkIn ? 
              '打卡中...' : 
              todayRecord?.checkIn ? 
                `已打卡 ${todayRecord.checkIn}` : 
                '上班打卡'
            }
          </button>
          
          <button
            onClick={handleCheckOut}
            disabled={loading || !todayRecord?.checkIn || todayRecord?.checkOut}
            className={`py-4 px-6 rounded-lg font-medium text-white transition duration-200 ${
              !todayRecord?.checkIn || todayRecord?.checkOut || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 btn-animate'
            }`}
          >
            <Clock className="h-6 w-6 mx-auto mb-2" />
            {loading && todayRecord?.checkIn && !todayRecord?.checkOut ? 
              '打卡中...' : 
              todayRecord?.checkOut ? 
                `已下班 ${todayRecord.checkOut}` : 
                '下班打卡'
            }
          </button>
        </div>
      </div>

      {/* 今日打卡狀態 */}
      {todayRecord && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">今日打卡記錄</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">上班時間:</span>
              <span className="font-medium">{todayRecord.checkIn || '未打卡'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">下班時間:</span>
              <span className="font-medium">{todayRecord.checkOut || '未打卡'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">狀態:</span>
              <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                todayRecord.status === 'normal' ? 'bg-green-100 text-green-800' :
                todayRecord.status === 'late' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {todayRecord.status === 'normal' ? '正常' :
                 todayRecord.status === 'late' ? '遲到' : '工作中'}
              </span>
            </div>
            {todayRecord.checkIn && todayRecord.checkOut && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">工作時間:</span>
                <span className="font-medium">
                  {calculateWorkHours(todayRecord.checkIn, todayRecord.checkOut)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 提示信息 */}
      {!todayRecord && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-700">今日尚未打卡，請點擊上方按鈕進行打卡</p>
        </div>
      )}
    </div>
  );
}

// 計算工作時間的輔助函數
function calculateWorkHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return '---';
  
  const [inHour, inMinute] = checkIn.split(':').map(Number);
  const [outHour, outMinute] = checkOut.split(':').map(Number);
  
  const inTime = inHour * 60 + inMinute;
  const outTime = outHour * 60 + outMinute;
  
  const workMinutes = outTime - inTime;
  const hours = Math.floor(workMinutes / 60);
  const minutes = workMinutes % 60;
  
  return `${hours}小時${minutes}分鐘`;
}

export default CheckIn;