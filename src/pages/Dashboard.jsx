// pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import { useAuth, usePermissions } from '../contexts/AuthContext';
import { employeeService, attendanceService, leaveService } from '../firebase/firestoreService';
import StatCard from '../components/Common/StatCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';

function Dashboard() {
  const { user } = useAuth();
  const permissions = usePermissions();
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // 根據權限載入不同的數據
      if (permissions.canViewAllEmployees) {
        // 管理員 - 載入所有數據
        const [employeesData, attendanceData, leavesData] = await Promise.all([
          employeeService.getAll(),
          attendanceService.getAll(),
          leaveService.getAll()
        ]);
        
        setEmployees(employeesData);
        setAttendanceRecords(attendanceData);
        setLeaveRequests(leavesData);
      } else if (permissions.canViewDashboard && user.department) {
        // 主管 - 載入部門數據
        const [employeesData, attendanceData, leavesData] = await Promise.all([
          employeeService.getByDepartment(user.department),
          attendanceService.getAll(), // 需要所有記錄來過濾部門員工的記錄
          leaveService.getAll() // 需要所有記錄來過濾部門員工的請假
        ]);
        
        setEmployees(employeesData);
        
        // 過濾出部門員工的出勤記錄
        const departmentEmployeeIds = employeesData.map(emp => emp.id);
        const departmentAttendance = attendanceData.filter(record => 
          departmentEmployeeIds.includes(record.employeeId)
        );
        setAttendanceRecords(departmentAttendance);
        
        // 過濾出部門員工的請假記錄
        const departmentLeaves = leavesData.filter(leave => 
          departmentEmployeeIds.includes(leave.employeeId)
        );
        setLeaveRequests(departmentLeaves);
      }
    } catch (error) {
      console.error('載入儀表板數據錯誤:', error);
      setError('載入數據失敗，請重新整理頁面');
    } finally {
      setLoading(false);
    }
  };

  // 權限檢查
  if (!permissions.canViewDashboard) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-red-500 text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">訪問受限</h2>
        <p className="text-gray-600">您沒有權限訪問此頁面</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">載入失敗</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadDashboardData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          重新載入
        </button>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter(record => record.date === today);
  const checkedInToday = todayRecords.filter(record => record.checkIn).length;
  const onTimeCount = todayRecords.filter(record => record.status === 'normal').length;
  const lateCount = todayRecords.filter(record => record.status === 'late').length;
  const pendingLeaves = leaveRequests.filter(leave => leave.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">
          {user.role === 'admin' ? '系統儀表板' : `${user.department} 部門儀表板`}
        </h2>
        <div className="text-sm text-gray-500">
          管理範圍: {user.role === 'admin' ? '全公司' : user.department}
        </div>
      </div>
      
      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatCard
          title={user.role === 'admin' ? '總員工數' : '部門員工數'}
          value={employees.length}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="今日打卡"
          value={checkedInToday}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="準時上班"
          value={onTimeCount}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="遲到人數"
          value={lateCount}
          icon={XCircle}
          color="red"
        />
        <StatCard
          title="待審請假"
          value={pendingLeaves}
          icon={FileText}
          color="yellow"
        />
      </div>

      {/* 今日出勤狀況和待審請假 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 今日出勤狀況 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">今日出勤狀況</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {todayRecords.slice(0, 5).map(record => {
                const employee = employees.find(emp => emp.id === record.employeeId);
                return (
                  <div key={record.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        record.status === 'normal' ? 'bg-green-400' :
                        record.status === 'late' ? 'bg-red-400' : 'bg-yellow-400'
                      }`}></div>
                      <span className="font-medium">{employee?.name}</span>
                      <span className="text-sm text-gray-500">{employee?.department}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        上班: {record.checkIn || '未打卡'} 
                        {record.checkOut && ` | 下班: ${record.checkOut}`}
                      </div>
                      <div className={`text-xs ${
                        record.status === 'normal' ? 'text-green-600' :
                        record.status === 'late' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {record.status === 'normal' ? '正常' :
                         record.status === 'late' ? '遲到' : '工作中'}
                      </div>
                    </div>
                  </div>
                );
              })}
              {todayRecords.length === 0 && (
                <div className="text-center text-gray-500 py-4">今日暫無出勤記錄</div>
              )}
            </div>
          </div>
        </div>

        {/* 待審核請假 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">待審核請假</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {leaveRequests.filter(leave => leave.status === 'pending').slice(0, 5).map(leave => {
                const employee = employees.find(emp => emp.id === leave.employeeId);
                return (
                  <div key={leave.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <span className="font-medium">{employee?.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        leave.type === 'sick' ? 'bg-red-100 text-red-800' :
                        leave.type === 'annual' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {leave.type === 'sick' ? '病假' : leave.type === 'annual' ? '年假' : '事假'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{leave.startDate} - {leave.endDate}</div>
                      <div className="text-xs text-gray-500">{leave.days} 天</div>
                    </div>
                  </div>
                );
              })}
              {leaveRequests.filter(leave => leave.status === 'pending').length === 0 && (
                <div className="text-center text-gray-500 py-4">暫無待審核請假</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 重新整理按鈕 */}
      <div className="flex justify-end">
        <button
          onClick={loadDashboardData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Clock className="h-4 w-4" />
          <span>重新整理</span>
        </button>
      </div>
    </div>
  );
}

export default Dashboard;