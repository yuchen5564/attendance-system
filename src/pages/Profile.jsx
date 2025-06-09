// pages/Profile.js
import React, { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { employeeService, attendanceService, leaveService } from '../firebase/firestoreService';
import { updateUserProfile } from '../firebase/authService';
import LoadingSpinner from '../components/Common/LoadingSpinner';

function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({});
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    loadProfileData();
  }, [user]);

  // 只有員工可以訪問個人資料頁面
  if (user?.role !== 'employee') {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-red-500 text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">訪問受限</h2>
        <p className="text-gray-600">此頁面僅限員工訪問</p>
      </div>
    );
  }

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError('');

      // 載入員工資料、出勤記錄和請假記錄
      const [employeesData, attendanceData, leavesData] = await Promise.all([
        employeeService.getAll(),
        attendanceService.getByEmployee(user.employeeId),
        leaveService.getByEmployee(user.employeeId)
      ]);

      // 找到當前用戶的員工資料
      const currentEmployee = employeesData.find(emp => emp.employeeId === user.employeeId);
      if (currentEmployee) {
        setProfileData(currentEmployee);
      } else {
        setError('找不到員工資料');
      }

      setAttendanceRecords(attendanceData);
      setLeaveRequests(leavesData);

    } catch (error) {
      console.error('載入個人資料錯誤:', error);
      setError('載入個人資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      // 更新 Firestore 中的員工資料
      await employeeService.update(profileData.id, {
        name: profileData.name,
        // 其他可編輯的欄位
      });

      // 更新 Firebase Auth 的用戶資料
      await updateUserProfile(user.uid, {
        name: profileData.name
      });

      setIsEditing(false);
      alert('個人資料已更新！');
    } catch (error) {
      console.error('更新個人資料錯誤:', error);
      setError('更新個人資料失敗');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !profileData.id) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">載入失敗</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadProfileData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          重新載入
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">個人資料</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
        >
          <Edit className="h-4 w-4" />
          <span>{isEditing ? '取消編輯' : '編輯資料'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 基本資料 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">基本資料</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.name || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-gray-900">{profileData.name}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">員工編號</label>
              <div className="text-gray-900">{profileData.employeeId}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">信箱</label>
              <div className="text-gray-900">{user.email}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">部門</label>
              <div className="text-gray-900">{profileData.department}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
              <div className="text-gray-900">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  員工
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">上班時間</label>
                <div className="text-gray-900">{profileData.workHours?.start}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">下班時間</label>
                <div className="text-gray-900">{profileData.workHours?.end}</div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    loadProfileData(); // 重新載入原始資料
                  }}
                  disabled={saving}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? '儲存中...' : '儲存'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 請假統計 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">請假統計</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {leaveRequests.filter(leave => 
                    leave.status === 'approved' && leave.type === 'annual'
                  ).reduce((sum, leave) => sum + leave.days, 0)}
                </div>
                <div className="text-sm text-gray-500">年假已用</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {leaveRequests.filter(leave => 
                    leave.status === 'approved' && leave.type === 'sick'
                  ).reduce((sum, leave) => sum + leave.days, 0)}
                </div>
                <div className="text-sm text-gray-500">病假已用</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {leaveRequests.filter(leave => 
                    leave.status === 'approved' && leave.type === 'personal'
                  ).reduce((sum, leave) => sum + leave.days, 0)}
                </div>
                <div className="text-sm text-gray-500">事假已用</div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-600">
                <div className="flex justify-between mb-2">
                  <span>年假額度:</span>
                  <span>14 天</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>已使用:</span>
                  <span className="text-blue-600">
                    {leaveRequests.filter(leave => 
                      leave.status === 'approved' && leave.type === 'annual'
                    ).reduce((sum, leave) => sum + leave.days, 0)} 天
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>剩餘:</span>
                  <span className="text-green-600">
                    {14 - leaveRequests.filter(leave => 
                      leave.status === 'approved' && leave.type === 'annual'
                    ).reduce((sum, leave) => sum + leave.days, 0)} 天
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 最近出勤記錄 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">最近出勤記錄</h3>
        <div className="space-y-3">
          {attendanceRecords
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map(record => (
              <div key={record.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <div className="font-medium">{record.date}</div>
                  <div className="text-sm text-gray-600">
                    {record.checkIn || '未打卡'} - {record.checkOut || '工作中'}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  record.status === 'normal' ? 'bg-green-100 text-green-800' :
                  record.status === 'late' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {record.status === 'normal' ? '正常' :
                   record.status === 'late' ? '遲到' : '工作中'}
                </span>
              </div>
            ))}
          {attendanceRecords.length === 0 && (
            <div className="text-center text-gray-500 py-4">暫無出勤記錄</div>
          )}
        </div>
      </div>

      {/* 最近請假記錄 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">最近請假記錄</h3>
        <div className="space-y-3">
          {leaveRequests
            .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
            .slice(0, 5)
            .map(leave => (
              <div key={leave.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <div className="font-medium">
                    {leave.type === 'sick' ? '病假' : leave.type === 'annual' ? '年假' : '事假'}
                    - {leave.days} 天
                  </div>
                  <div className="text-sm text-gray-600">
                    {leave.startDate} - {leave.endDate}
                  </div>
                  {leave.reviewComment && (
                    <div className="text-xs text-gray-500 mt-1">
                      {leave.reviewComment}
                    </div>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                  leave.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {leave.status === 'approved' ? '已核准' :
                   leave.status === 'rejected' ? '已拒絕' : '待審核'}
                </span>
              </div>
            ))}
          {leaveRequests.length === 0 && (
            <div className="text-center text-gray-500 py-4">暫無請假記錄</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;