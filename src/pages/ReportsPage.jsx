import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../firebase/firestoreService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ReportsPage = () => {
  const { userData, isAdmin, isManager } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    attendanceStats: {},
    departmentStats: {},
    leaveStats: {},
    monthlyTrends: []
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isAdmin || isManager) {
      loadReportData();
    }
  }, [userData, dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);

      // 載入所有相關數據
      const [users, allAttendance, allLeaves] = await Promise.all([
        firestoreService.getAllUsers(),
        firestoreService.getAttendanceRecords(), // 獲取所有出勤記錄
        firestoreService.getLeaveRequests()
      ]);

      // 篩選日期範圍內的數據
      const filteredAttendance = allAttendance.filter(record => {
        const recordDate = record.timestamp.toDate ? record.timestamp.toDate() : new Date(record.timestamp);
        return recordDate >= startDate && recordDate <= endDate;
      });

      const filteredLeaves = allLeaves.filter(leave => {
        const leaveDate = leave.createdAt.toDate ? leave.createdAt.toDate() : new Date(leave.createdAt);
        return leaveDate >= startDate && leaveDate <= endDate;
      });

      // 計算出勤統計
      const attendanceStats = calculateAttendanceStats(filteredAttendance, users);
      
      // 計算部門統計
      const departmentStats = calculateDepartmentStats(filteredAttendance, users);
      
      // 計算請假統計
      const leaveStats = calculateLeaveStats(filteredLeaves);
      
      // 計算月度趨勢
      const monthlyTrends = calculateMonthlyTrends(filteredAttendance);

      setReportData({
        attendanceStats,
        departmentStats,
        leaveStats,
        monthlyTrends
      });
    } catch (error) {
      console.error('載入報表數據失敗:', error);
      toast.error('載入報表數據失敗');
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendanceStats = (attendance, users) => {
    const stats = {
      totalRecords: attendance.length,
      totalUsers: users.length,
      clockInCount: attendance.filter(r => r.type === 'clock_in').length,
      clockOutCount: attendance.filter(r => r.type === 'clock_out').length,
      activeUsers: new Set(attendance.map(r => r.userId)).size,
      averageDaily: 0
    };

    // 計算平均每日出勤
    const days = Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24)) + 1;
    stats.averageDaily = Math.round(stats.totalRecords / days);

    return stats;
  };

  const calculateDepartmentStats = (attendance, users) => {
    const deptMap = {};
    
    users.forEach(user => {
      const dept = user.department || '未分配';
      if (!deptMap[dept]) {
        deptMap[dept] = { total: 0, users: 0, userSet: new Set() };
      }
      deptMap[dept].users++;
    });

    attendance.forEach(record => {
      const user = users.find(u => u.uid === record.userId);
      const dept = user?.department || '未分配';
      if (deptMap[dept]) {
        deptMap[dept].total++;
        deptMap[dept].userSet.add(record.userId);
      }
    });

    return Object.entries(deptMap).map(([dept, data]) => ({
      department: dept,
      totalRecords: data.total,
      totalUsers: data.users,
      activeUsers: data.userSet.size,
      averagePerUser: data.userSet.size > 0 ? Math.round(data.total / data.userSet.size) : 0
    }));
  };

  const calculateLeaveStats = (leaves) => {
    const stats = {
      total: leaves.length,
      pending: leaves.filter(l => l.status === 'pending').length,
      approved: leaves.filter(l => l.status === 'approved').length,
      rejected: leaves.filter(l => l.status === 'rejected').length,
      typeBreakdown: {}
    };

    // 按類型統計
    leaves.forEach(leave => {
      const type = leave.type || 'other';
      stats.typeBreakdown[type] = (stats.typeBreakdown[type] || 0) + 1;
    });

    return stats;
  };

  const calculateMonthlyTrends = (attendance) => {
    const monthlyData = {};
    
    attendance.forEach(record => {
      const date = record.timestamp.toDate ? record.timestamp.toDate() : new Date(record.timestamp);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[month]) {
        monthlyData[month] = { clockIn: 0, clockOut: 0 };
      }
      
      if (record.type === 'clock_in') {
        monthlyData[month].clockIn++;
      } else {
        monthlyData[month].clockOut++;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        ...data,
        total: data.clockIn + data.clockOut
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const exportReport = () => {
    const reportContent = [
      ['出勤報表', '', '', ''],
      ['統計期間', `${dateRange.startDate} 至 ${dateRange.endDate}`, '', ''],
      ['', '', '', ''],
      ['出勤統計', '', '', ''],
      ['總記錄數', reportData.attendanceStats.totalRecords, '', ''],
      ['總員工數', reportData.attendanceStats.totalUsers, '', ''],
      ['上班打卡', reportData.attendanceStats.clockInCount, '', ''],
      ['下班打卡', reportData.attendanceStats.clockOutCount, '', ''],
      ['活躍用戶', reportData.attendanceStats.activeUsers, '', ''],
      ['', '', '', ''],
      ['部門統計', '', '', ''],
      ['部門', '總記錄', '總員工', '活躍用戶'],
      ...reportData.departmentStats.map(dept => [
        dept.department,
        dept.totalRecords,
        dept.totalUsers,
        dept.activeUsers
      ]),
      ['', '', '', ''],
      ['請假統計', '', '', ''],
      ['總申請數', reportData.leaveStats.total, '', ''],
      ['待審核', reportData.leaveStats.pending, '', ''],
      ['已批准', reportData.leaveStats.approved, '', ''],
      ['已拒絕', reportData.leaveStats.rejected, '', '']
    ];

    const csvContent = reportContent.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `出勤報表_${new Date().toLocaleDateString('zh-TW')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('報表已匯出');
  };

  if (!isAdmin && !isManager) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">權限不足</h2>
        <p className="text-gray-500">您沒有權限訪問報表分析功能</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner text="載入報表數據中..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>報表分析</h1>
        <button
          onClick={exportReport}
          className="btn btn-primary"
        >
          <Download size={20} />
          匯出報表
        </button>
      </div>

      {/* 日期範圍選擇 */}
      <div className="card mb-6">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Calendar size={20} />
            <h3>統計期間</h3>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">開始日期</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">結束日期</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="form-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <div className="stat-label">總出勤記錄</div>
          <div className="stat-value">{reportData.attendanceStats.totalRecords}</div>
          <div className="flex items-center gap-1 mt-2">
            <Clock size={16} className="text-blue-600" />
            <span className="text-sm text-gray-600">次</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-label">活躍員工</div>
          <div className="stat-value">{reportData.attendanceStats.activeUsers}</div>
          <div className="flex items-center gap-1 mt-2">
            <Users size={16} className="text-green-600" />
            <span className="text-sm text-gray-600">
              / {reportData.attendanceStats.totalUsers} 人
            </span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-label">待審核請假</div>
          <div className="stat-value">{reportData.leaveStats.pending}</div>
          <div className="flex items-center gap-1 mt-2">
            <Calendar size={16} className="text-yellow-600" />
            <span className="text-sm text-gray-600">件</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">平均每日出勤</div>
          <div className="stat-value">{reportData.attendanceStats.averageDaily}</div>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp size={16} className="text-blue-600" />
            <span className="text-sm text-gray-600">次</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 部門統計 */}
        <div className="card">
          <div className="card-header">
            <h3>部門出勤統計</h3>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>部門</th>
                    <th>總記錄</th>
                    <th>活躍用戶</th>
                    <th>平均/人</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.departmentStats.map((dept, index) => (
                    <tr key={index}>
                      <td className="font-medium">{dept.department}</td>
                      <td>{dept.totalRecords}</td>
                      <td>{dept.activeUsers}/{dept.totalUsers}</td>
                      <td>{dept.averagePerUser}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 請假統計 */}
        <div className="card">
          <div className="card-header">
            <h3>請假統計</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>總申請數</span>
                <span className="font-semibold">{reportData.leaveStats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>待審核</span>
                <span className="status-badge pending">{reportData.leaveStats.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>已批准</span>
                <span className="status-badge approved">{reportData.leaveStats.approved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>已拒絕</span>
                <span className="status-badge rejected">{reportData.leaveStats.rejected}</span>
              </div>
              
              {Object.keys(reportData.leaveStats.typeBreakdown).length > 0 && (
                <>
                  <hr className="my-4" />
                  <h4 className="font-medium mb-2">請假類型分佈</h4>
                  {Object.entries(reportData.leaveStats.typeBreakdown).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span>{type}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 月度趨勢 */}
      {reportData.monthlyTrends.length > 0 && (
        <div className="card mt-6">
          <div className="card-header">
            <h3>月度出勤趨勢</h3>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>月份</th>
                    <th>上班打卡</th>
                    <th>下班打卡</th>
                    <th>總計</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.monthlyTrends.map((trend, index) => (
                    <tr key={index}>
                      <td className="font-medium">{trend.month}</td>
                      <td>{trend.clockIn}</td>
                      <td>{trend.clockOut}</td>
                      <td className="font-semibold">{trend.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;