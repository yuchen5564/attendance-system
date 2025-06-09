import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Badge, Statistic, App } from 'antd';
import { 
  ClockCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../firebase/firestoreService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ClockWidget = ({ onClockAction }) => {
  const { userData } = useAuth();
  const { message } = App.useApp();
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [todayRecords, setTodayRecords] = useState([]);

  useEffect(() => {
    // 更新時間
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
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
      
      const records = await firestoreService.getTodayAttendance(userData.uid);
      console.log('✅ ClockWidget: 今日記錄數量:', records?.length || 0);
      
      setTodayRecords(records || []);
    } catch (error) {
      console.error('❌ ClockWidget: 載入今日打卡記錄失敗:', error);
      setTodayRecords([]);
    }
  };

  const handleClockIn = async () => {
    setLoading(true);
    try {
      await firestoreService.clockIn(userData.uid);
      message.success('上班打卡成功！');
      await loadTodayRecords();
      if (onClockAction) onClockAction();
    } catch (error) {
      console.error('打卡失敗:', error);
      message.error('打卡失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    try {
      await firestoreService.clockOut(userData.uid);
      message.success('下班打卡成功！');
      await loadTodayRecords();
      if (onClockAction) onClockAction();
    } catch (error) {
      console.error('打卡失敗:', error);
      message.error('打卡失敗，請稍後再試');
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

  const getStatusInfo = () => {
    const lastAction = getLastClockAction();
    if (!lastAction) {
      return { text: '尚未打卡', status: 'default' };
    }
    
    if (lastAction.type === 'clock_in') {
      return { text: '已上班', status: 'processing' };
    } else {
      return { text: '已下班', status: 'success' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card
      style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        border: 'none',
        borderRadius: '16px',
        color: 'white',
        marginBottom: '24px',
      }}
      bodyStyle={{ padding: '32px' }}
    >
      <div style={{ textAlign: 'center' }}>
        <Title 
          level={1} 
          style={{ 
            color: 'white', 
            fontSize: '48px', 
            fontWeight: '700',
            marginBottom: '8px',
            fontFamily: 'monospace',
          }}
        >
          {currentTime.format('HH:mm:ss')}
        </Title>
        
        <Text 
          style={{ 
            color: 'rgba(255, 255, 255, 0.9)', 
            fontSize: '18px',
            marginBottom: '24px',
            display: 'block',
          }}
        >
          {currentTime.format('YYYY年MM月DD日 dddd')}
        </Text>

        <div style={{ marginBottom: '24px' }}>
          <Badge 
            status={statusInfo.status} 
            text={
              <Text style={{ color: 'white', fontSize: '16px' }}>
                {statusInfo.text}
              </Text>
            } 
          />
        </div>

        <Space size="large">
          <Button
            type="primary"
            size="large"
            icon={<LoginOutlined />}
            loading={loading}
            disabled={!canClockIn()}
            onClick={handleClockIn}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              fontWeight: '600',
            }}
            ghost
          >
            上班打卡
          </Button>
          
          <Button
            type="primary"
            size="large"
            icon={<LogoutOutlined />}
            loading={loading}
            disabled={!canClockOut()}
            onClick={handleClockOut}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              fontWeight: '600',
            }}
            ghost
          >
            下班打卡
          </Button>
        </Space>

        {todayRecords.length > 0 && (
          <div style={{ marginTop: '24px', opacity: 0.9 }}>
            <Space direction="vertical" size="small">
              <Text style={{ color: 'white', fontSize: '14px' }}>
                今日打卡 {todayRecords.length} 次
              </Text>
              <Text style={{ color: 'white', fontSize: '14px' }}>
                最後打卡: {dayjs(todayRecords[0].timestamp.toDate ? 
                  todayRecords[0].timestamp.toDate() : 
                  new Date(todayRecords[0].timestamp)
                ).format('HH:mm:ss')}
              </Text>
            </Space>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ClockWidget;