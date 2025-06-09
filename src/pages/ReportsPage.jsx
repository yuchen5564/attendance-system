import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  DatePicker, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Typography, 
  Space,
  Empty,
  Progress,
  App
} from 'antd';
import { 
  BarChartOutlined, 
  DownloadOutlined, 
  CalendarOutlined, 
  TeamOutlined, 
  ArrowUpOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../firebase/firestoreService';
import LoadingSpinner from '../components/LoadingSpinner';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

// 初始化 dayjs 插件
dayjs.extend(isBetween);

const { Title } = Typography;
const { RangePicker } = DatePicker;

const ReportsPage = () => {
  const { userData, isAdmin, isManager } = useAuth();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    attendanceStats: {
      totalRecords: 0,
      totalUsers: 0,
      clockInCount: 0,
      clockOutCount: 0,
      activeUsers: 0,
      averageDaily: 0
    },
    departmentStats: [],
    leaveStats: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      typeBreakdown: {}
    },
    monthlyTrends: []
  });
  const [dateRange, setDateRange] = useState([
    dayjs().startOf('month'),
    dayjs().endOf('day')
  ]);

  useEffect(() => {
    if (isAdmin || isManager) {
      loadReportData();
    }
  }, [userData, dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const [startDate, endDate] = dateRange;

      // 載入所有相關數據
      const [users, allAttendance, allLeaves] = await Promise.all([
        firestoreService.getAllUsers(),
        firestoreService.getAttendanceRecords(),
        firestoreService.getLeaveRequests()
      ]);

      // 篩選日期範圍內的數據
      const filteredAttendance = allAttendance.filter(record => {
        const recordDate = dayjs(record.timestamp.toDate ? record.timestamp.toDate() : new Date(record.timestamp));
        return recordDate.isBetween(startDate, endDate, 'day', '[]');
      });

      const filteredLeaves = allLeaves.filter(leave => {
        const leaveDate = dayjs(leave.createdAt.toDate ? leave.createdAt.toDate() : new Date(leave.createdAt));
        return leaveDate.isBetween(startDate, endDate, 'day', '[]');
      });

      // 計算統計數據
      const attendanceStats = calculateAttendanceStats(filteredAttendance, users);
      const departmentStats = calculateDepartmentStats(filteredAttendance, users);
      const leaveStats = calculateLeaveStats(filteredLeaves);
      const monthlyTrends = calculateMonthlyTrends(filteredAttendance);

      setReportData({
        attendanceStats,
        departmentStats,
        leaveStats,
        monthlyTrends
      });
    } catch (error) {
      console.error('載入報表數據失敗:', error);
      message.error('載入報表數據失敗');
      
      // 設置預設空值，避免頁面崩潰
      setReportData({
        attendanceStats: {
          totalRecords: 0,
          totalUsers: 0,
          clockInCount: 0,
          clockOutCount: 0,
          activeUsers: 0,
          averageDaily: 0
        },
        departmentStats: [],
        leaveStats: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          typeBreakdown: {}
        },
        monthlyTrends: []
      });
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
    const days = dateRange[1].diff(dateRange[0], 'day') + 1;
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
      key: dept,
      department: dept,
      totalRecords: data.total,
      totalUsers: data.users,
      activeUsers: data.userSet.size,
      averagePerUser: data.userSet.size > 0 ? Math.round(data.total / data.userSet.size) : 0,
      activityRate: data.users > 0 ? Math.round((data.userSet.size / data.users) * 100) : 0
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
      const date = dayjs(record.timestamp.toDate ? record.timestamp.toDate() : new Date(record.timestamp));
      const month = date.format('YYYY-MM');
      
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
        key: month,
        month,
        clockIn: data.clockIn,
        clockOut: data.clockOut,
        total: data.clockIn + data.clockOut
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const exportReport = () => {
    const reportContent = [
      ['出勤報表', '', '', ''],
      ['統計期間', `${dateRange[0].format('YYYY-MM-DD')} 至 ${dateRange[1].format('YYYY-MM-DD')}`, '', ''],
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
    link.setAttribute('download', `出勤報表_${dayjs().format('YYYY-MM-DD')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('報表已匯出');
  };

  const departmentColumns = [
    {
      title: '部門',
      dataIndex: 'department',
      key: 'department',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: '總記錄',
      dataIndex: 'totalRecords',
      key: 'totalRecords',
      sorter: (a, b) => a.totalRecords - b.totalRecords,
    },
    {
      title: '活躍用戶',
      dataIndex: 'activeUsers',
      key: 'activeUsers',
      render: (activeUsers, record) => (
        <span>{activeUsers}/{record.totalUsers}</span>
      ),
      sorter: (a, b) => a.activeUsers - b.activeUsers,
    },
    {
      title: '活躍率',
      dataIndex: 'activityRate',
      key: 'activityRate',
      render: (rate) => (
        <Progress 
          percent={rate} 
          size="small" 
          status={rate > 80 ? 'success' : rate > 60 ? 'normal' : 'exception'}
        />
      ),
      sorter: (a, b) => a.activityRate - b.activityRate,
    },
    {
      title: '平均/人',
      dataIndex: 'averagePerUser',
      key: 'averagePerUser',
      sorter: (a, b) => a.averagePerUser - b.averagePerUser,
    },
  ];

  const monthlyColumns = [
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: '上班打卡',
      dataIndex: 'clockIn',
      key: 'clockIn',
      sorter: (a, b) => a.clockIn - b.clockIn,
    },
    {
      title: '下班打卡',
      dataIndex: 'clockOut',
      key: 'clockOut',
      sorter: (a, b) => a.clockOut - b.clockOut,
    },
    {
      title: '總計',
      dataIndex: 'total',
      key: 'total',
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
      sorter: (a, b) => a.total - b.total,
    },
  ];

  if (!isAdmin && !isManager) {
    return (
      <Card>
        <Empty
          image={<BarChartOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
          description={
            <div>
              <Title level={4}>權限不足</Title>
              <p>您沒有權限訪問報表分析功能</p>
            </div>
          }
        />
      </Card>
    );
  }

  if (loading) {
    return <LoadingSpinner text="載入報表數據中..." />;
  }

  const getLeaveTypeText = (type) => {
    const types = {
      annual: '年假',
      sick: '病假',
      personal: '事假',
      maternity: '產假',
      paternity: '陪產假',
      funeral: '喪假',
      marriage: '婚假',
      other: '其他'
    };
    return types[type] || type;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>報表分析</Title>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={exportReport}
        >
          匯出報表
        </Button>
      </div>

      {/* 日期範圍選擇 */}
      <Card 
        title={
          <Space>
            <CalendarOutlined />
            統計期間
          </Space>
        }
        style={{ marginBottom: '24px' }}
      >
        <RangePicker
          value={dateRange}
          onChange={setDateRange}
          style={{ width: '300px' }}
          placeholder={['開始日期', '結束日期']}
        />
      </Card>

      {/* 統計卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="總出勤記錄"
              value={reportData.attendanceStats?.totalRecords || 0}
              prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
              suffix="次"
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活躍員工"
              value={reportData.attendanceStats?.activeUsers || 0}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
              suffix={`/ ${reportData.attendanceStats?.totalUsers || 0} 人`}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待審核請假"
              value={reportData.leaveStats?.pending || 0}
              prefix={<CalendarOutlined style={{ color: '#faad14' }} />}
              suffix="件"
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均每日出勤"
              value={reportData.attendanceStats?.averageDaily || 0}
              prefix={<ArrowUpOutlined style={{ color: '#1890ff' }} />}
              suffix="次"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 部門統計 */}
        <Col xs={24} lg={14}>
          <Card 
            title={
              <Space>
                <TeamOutlined />
                部門出勤統計
              </Space>
            }
          >
            <Table
              columns={departmentColumns}
              dataSource={reportData.departmentStats}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* 請假統計 */}
        <Col xs={24} lg={10}>
          <Card 
            title={
              <Space>
                <CalendarOutlined />
                請假統計
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="總申請數" value={reportData.leaveStats?.total || 0} />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="待審核" 
                    value={reportData.leaveStats?.pending || 0}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic 
                    title="已批准" 
                    value={reportData.leaveStats?.approved || 0}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="已拒絕" 
                    value={reportData.leaveStats?.rejected || 0}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Col>
              </Row>

              {Object.keys(reportData.leaveStats.typeBreakdown || {}).length > 0 && (
                <div>
                  <Title level={5}>請假類型分佈</Title>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {Object.entries(reportData.leaveStats.typeBreakdown || {}).map(([type, count]) => (
                      <div key={type} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{getLeaveTypeText(type)}</span>
                        <span style={{ fontWeight: 500 }}>{count}</span>
                      </div>
                    ))}
                  </Space>
                </div>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 月度趨勢 */}
      {reportData.monthlyTrends.length > 0 && (
        <Card 
          title={
            <Space>
              <ArrowUpOutlined />
              月度出勤趨勢
            </Space>
          }
          style={{ marginTop: '16px' }}
        >
          <Table
            columns={monthlyColumns}
            dataSource={reportData.monthlyTrends}
            pagination={false}
            size="small"
          />
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;