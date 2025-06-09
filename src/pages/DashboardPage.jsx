import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Typography, 
  Space, 
  List, 
  Tag, 
  Empty,
  App
} from 'antd';
import { 
  ClockCircleOutlined, 
  CalendarOutlined, 
  TeamOutlined, 
  ArrowUpOutlined,
  LoginOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../firebase/firestoreService';
import LoadingSpinner from '../components/LoadingSpinner';
import ClockWidget from '../components/ClockWidget';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const DashboardPage = () => {
  const { userData, isAdmin, isManager } = useAuth();
  const { message } = App.useApp();
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
      
      // 1. 載入今日打卡狀態
      const todayRecords = await firestoreService.getTodayAttendance(userData.uid);
      
      // 2. 載入最近的打卡記錄
      const recentRecords = await firestoreService.getAttendanceRecords(userData.uid);
      setRecentAttendance((recentRecords || []).slice(0, 5));

      // 3. 載入統計數據（根據權限）
      if (isAdmin || isManager) {
        try {
          const users = await firestoreService.getAllUsers();
          const leaveRequests = await firestoreService.getLeaveRequests();

          setStats({
            todayAttendance: (todayRecords || []).length,
            monthlyAttendance: (recentRecords || []).length,
            pendingLeaves: (leaveRequests || []).filter(req => req.status === 'pending').length,
            totalEmployees: (users || []).length
          });
        } catch (adminError) {
          console.error('⚠️ 管理員數據載入部分失敗:', adminError);
          setStats({
            todayAttendance: (todayRecords || []).length,
            monthlyAttendance: (recentRecords || []).length,
            pendingLeaves: 0,
            totalEmployees: 0
          });
        }
      } else {
        try {
          const userLeaves = await firestoreService.getLeaveRequests(userData.uid);
          
          setStats({
            todayAttendance: (todayRecords || []).length,
            monthlyAttendance: (recentRecords || []).length,
            pendingLeaves: (userLeaves || []).filter(req => req.status === 'pending').length,
            totalEmployees: 0
          });
        } catch (employeeError) {
          console.error('⚠️ 員工數據載入部分失敗:', employeeError);
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
      
      if (error.message?.includes('index')) {
        message.error('資料查詢需要建立索引，請檢查 Firebase 設定');
      } else {
        message.error('載入數據失敗');
      }
      
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
      return dayjs(date).format('HH:mm');
    } catch (error) {
      console.warn('時間格式化失敗:', error);
      return '';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return dayjs(date).format('YYYY-MM-DD');
    } catch (error) {
      console.warn('日期格式化失敗:', error);
      return '';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>儀表板</Title>
        <Text type="secondary">歡迎回來，{userData?.name}！</Text>
      </div>

      {/* 打卡組件 */}
      <ClockWidget onClockAction={loadDashboardData} />

      {/* 統計卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日打卡"
              value={stats.todayAttendance}
              prefix={<ClockCircleOutlined style={{ color: '#3b82f6' }} />}
              suffix="次"
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月出勤"
              value={stats.monthlyAttendance}
              prefix={<ArrowUpOutlined style={{ color: '#10b981' }} />}
              suffix="次"
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待審核請假"
              value={stats.pendingLeaves}
              prefix={<CalendarOutlined style={{ color: '#f59e0b' }} />}
              suffix="件"
            />
          </Card>
        </Col>
        
        {(isAdmin || isManager) && (
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="總員工數"
                value={stats.totalEmployees}
                prefix={<TeamOutlined style={{ color: '#3b82f6' }} />}
                suffix="人"
              />
            </Card>
          </Col>
        )}
      </Row>

      {/* 最近打卡記錄 */}
      <Card 
        title={
          <Space>
            <ClockCircleOutlined />
            最近打卡記錄
          </Space>
        }
      >
        {recentAttendance.length === 0 ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暫無打卡記錄" 
          />
        ) : (
          <List
            dataSource={recentAttendance}
            renderItem={(record) => (
              <List.Item>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>
                      {formatTime(record.timestamp)}
                    </div>
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                      {formatDate(record.timestamp)}
                    </Text>
                  </div>
                  <Tag 
                    icon={record.type === 'clock_in' ? <LoginOutlined /> : <LogoutOutlined />}
                    color={record.type === 'clock_in' ? 'green' : 'orange'}
                  >
                    {record.type === 'clock_in' ? '上班打卡' : '下班打卡'}
                  </Tag>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;