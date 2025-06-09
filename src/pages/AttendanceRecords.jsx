// pages/AttendanceRecords.js
import React, { useState, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { useAuth, usePermissions } from '../contexts/AuthContext';
import { employeeService, attendanceService } from '../firebase/firestoreService';
import LoadingSpinner from '../components/Common/LoadingSpinner';

function AttendanceRecords() {
  const { user } = useAuth();
  const permissions = usePermissions();
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadData();
    
    // 設置實時監聽
    const unsubscribe = attendanceService.listen((recordsData) => {
      const filteredRecords = getFilteredRecords(recordsData);
      setAttendanceRecords(filteredRecords);
    });

    return () => unsubscribe();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // 載入員工和出勤記錄
      const [employeesData, recordsData] = await Promise.all([
        loadEmployees(),
        attendanceService.getAll()
      ]);

      setEmployees(employeesData);
      const filteredRecords = getFilteredRecords(recordsData);
      setAttendanceRecords(filteredRecords);

    } catch (error) {
      console.error('載入出勤記錄錯誤:', error);
      setError('載入出勤記錄失敗');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    if (permissions.canViewAllAttendance) {
      return await employeeService.getAll();
    } else if (permissions.canViewDepartmentAttendance) {
      return await employeeService.getByDepartment(user.department);
    } else if (permissions.canViewOwnAttendance) {
      const allEmployees = await employeeService.getAll();
      return allEmployees.filter(emp => emp.employeeId === user.employeeId);
    }
    return [];
  };

  const getFilteredRecords = (recordsData) => {
    if (permissions.canViewAllAttendance) {
      return recordsData;
    } else if (permissions.canViewDepartmentAttendance) {
      const departmentEmployeeIds = employees
        .filter(emp => emp.department === user.department)
        .map(emp => emp.id);
      return recordsData.filter(record => 
        departmentEmployeeIds.includes(record.employeeId)
      );
    } else if (permissions.canViewOwnAttendance) {
      return recordsData.filter(record => record.employeeId === user.employeeId);
    }
    return [];
  };

  const handleDateFilter = async () => {
    if (!dateFilter.startDate || !dateFilter.endDate) {
      loadData();
      return;
    }

    try {
      setLoading(true);
      const recordsData = await attendanceService.getByDateRange(
        dateFilter.startDate,
        dateFilter.endDate
      );
      const filteredRecords = getFilteredRecords(recordsData);
      setAttendanceRecords(filteredRecords);
    } catch (error) {
      console.error('篩選出勤記錄錯誤:', error);
      setError('篩選出勤記錄失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!permissions.canExportReports && !permissions.canExportDepartmentReports) {
      alert('您沒有匯出權限');
      return;
    }

    const csvContent = [
      ['日期', '員工', '部門', '上班時間', '下班時間', '狀態', '工作時間'],
      ...attendanceRecords.map(record => {
        const employee = employees.find(emp => emp.id === record.employeeId);
        const workHours = record.checkIn && record.checkOut ? 
          calculateWorkHours(record.checkIn, record.checkOut) : '-';
        
        return [
          record.date,
          employee?.name || record.employeeName || '',
          employee?.department || record.department || '',
          record.checkIn || '',
          record.checkOut || '',
          record.status === 'normal' ? '正常' : 
          record.status === 'late' ? '遲到' : '工作中',
          workHours
        ];
      })
    ].map(row => row.join(',')).join('\n');

    // 加入 BOM 以支援中文
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `出勤記錄_${
      user.role === 'admin' ? '全公司' : 
      user.role === 'manager' ? user.department : '個人'
    }_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // 計算工作時間
  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '-';
    
    const [inHour, inMinute] = checkIn.split(':').map(Number);
    const [outHour, outMinute] = checkOut.split(':').map(Number);
    
    const inTime = inHour * 60 + inMinute;
    const outTime = outHour * 60 + outMinute;
    
    const workMinutes = outTime - inTime;
    const hours = Math.floor(workMinutes / 60);
    const minutes = workMinutes % 60;
    
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">
          {user.role === 'admin' ? '出勤記錄' : 
           user.role === 'manager' ? `${user.department} 部門出勤記錄` : 
           '我的出勤記錄'}
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={loadData}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>重新整理</span>
          </button>
          {(permissions.canExportReports || permissions.canExportDepartmentReports) && (
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>匯出記錄</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* 日期篩選 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">開始日期</label>
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">結束日期</label>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-2 pt-6">
            <button
              onClick={handleDateFilter}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              篩選
            </button>
            <button
              onClick={() => {
                setDateFilter({ startDate: '', endDate: '' });
                loadData();
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              清除
            </button>
          </div>
        </div>
      </div>

      {/* 出勤記錄表格 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-7 gap-4 font-medium text-gray-700">
            <div>日期</div>
            <div>員工</div>
            <div>部門</div>
            <div>上班時間</div>
            <div>下班時間</div>
            <div>工作時間</div>
            <div>狀態</div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {attendanceRecords
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(record => {
              const employee = employees.find(emp => emp.id === record.employeeId);
              const workHours = calculateWorkHours(record.checkIn, record.checkOut);
              
              return (
                <div key={record.id} className="px-6 py-4 grid grid-cols-7 gap-4 items-center table-row">
                  <div className="text-gray-900">{record.date}</div>
                  <div className="font-medium text-gray-900">
                    {employee?.name || record.employeeName || '未知員工'}
                  </div>
                  <div className="text-gray-600">
                    {employee?.department || record.department || '未知部門'}
                  </div>
                  <div className="text-gray-600">{record.checkIn || '-'}</div>
                  <div className="text-gray-600">{record.checkOut || '-'}</div>
                  <div className="text-gray-600 font-mono">{workHours}</div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.status === 'normal' ? 'bg-green-100 text-green-800' :
                      record.status === 'late' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status === 'normal' ? '正常' :
                       record.status === 'late' ? '遲到' : '工作中'}
                    </span>
                  </div>
                </div>
              );
            })}
          {attendanceRecords.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              暫無出勤記錄
            </div>
          )}
        </div>
      </div>

      {/* 統計摘要 */}
      {attendanceRecords.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">統計摘要</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {attendanceRecords.length}
              </div>
              <div className="text-sm text-gray-500">總記錄數</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {attendanceRecords.filter(r => r.status === 'normal').length}
              </div>
              <div className="text-sm text-gray-500">正常出勤</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {attendanceRecords.filter(r => r.status === 'late').length}
              </div>
              <div className="text-sm text-gray-500">遲到次數</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {attendanceRecords.filter(r => r.checkIn && !r.checkOut).length}
              </div>
              <div className="text-sm text-gray-500">工作中</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceRecords;