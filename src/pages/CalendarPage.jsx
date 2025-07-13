import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Card, 
  Badge, 
  Select, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Tag,
  App,
  Drawer,
  List,
  Button,
  Empty
} from 'antd';
import { 
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ReloadOutlined,
  LoginOutlined,
  LogoutOutlined,
  FileTextOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../firebase/firestoreService';
import LoadingSpinner from '../components/LoadingSpinner';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const CalendarPage = () => {
  const { userData, isAdmin, isManager, getLeaveTypes } = useAuth();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedDateRecords, setSelectedDateRecords] = useState({
    attendance: [],
    leaves: []
  });
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  useEffect(() => {
    loadData();
  }, [userData]);

  useEffect(() => {
    // 當選擇的用戶改變時，重新載入數據
    if (selectedUserId) {
      loadUserData(selectedUserId);
    } else if (userData && !isAdmin && !isManager) {
      // 如果是一般員工，載入自己的數據
      loadUserData(userData.uid);
    }
  }, [selectedUserId]);

  const loadData = async () => {
    if (!userData) return;

    try {
      setLoading(true);

      // 載入假別列表
      try {
        const types = await getLeaveTypes();
        setLeaveTypes(types || []);
      } catch (error) {
        console.error('載入假別列表失敗:', error);
        setLeaveTypes([]);
      }

      if (isAdmin || isManager) {
        // 管理員和主管可以看到所有員工
        const allUsers = await firestoreService.getAllUsers();
        setUsers(allUsers);
        
        if (allUsers.length > 0) {
          // 預設選擇第一個用戶
          const defaultUserId = allUsers[0].uid;
          setSelectedUserId(defaultUserId);
          await loadUserData(defaultUserId);
        }
      } else {
        // 一般員工只能看到自己的記錄
        setUsers([userData]);
        setSelectedUserId(userData.uid);
        await loadUserData(userData.uid);
      }
    } catch (error) {
      console.error('載入數據失敗:', error);
      message.error('載入數據失敗');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (userId) => {
    try {
      const [attendanceData, leaveData] = await Promise.all([
        firestoreService.getAttendanceRecords(userId),
        firestoreService.getLeaveRequests(userId)
      ]);
      
      setAttendanceRecords(attendanceData);
      setLeaveRequests(leaveData);
    } catch (error) {
      console.error('載入用戶數據失敗:', error);
      message.error('載入用戶數據失敗');
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.uid === userId);
    return user?.name || '未知用戶';
  };

  const getLeaveTypeName = (leave) => {
    // 優先使用儲存的 typeName
    if (leave.typeName) {
      return leave.typeName;
    }
    
    // 如果沒有 typeName，從假別列表中查找
    const leaveType = leaveTypes.find(type => type.id === leave.type);
    if (leaveType) {
      return leaveType.name;
    }
    
    // 最後回退使用 type 或預設值
    return leave.type || '請假';
  };

  const getLeaveTypeColor = (leave) => {
    // 優先使用儲存的 typeColor
    if (leave.typeColor) {
      return leave.typeColor;
    }
    
    // 如果沒有 typeColor，從假別列表中查找
    const leaveType = leaveTypes.find(type => type.id === leave.type);
    if (leaveType) {
      return leaveType.color;
    }
    
    // 預設顏色
    return 'orange';
  };

  const getListData = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const listData = [];

    // 獲取該日期的打卡記錄
    const dayAttendance = attendanceRecords.filter(record => {
      const recordDate = dayjs(record.timestamp.toDate ? record.timestamp.toDate() : new Date(record.timestamp));
      return recordDate.format('YYYY-MM-DD') === dateStr;
    });

    // 獲取該日期的請假記錄 - 顯示所有狀態的請假
    const dayLeaves = leaveRequests.filter(leave => {
      const startDate = dayjs(leave.startDate.toDate ? leave.startDate.toDate() : new Date(leave.startDate));
      const endDate = dayjs(leave.endDate.toDate ? leave.endDate.toDate() : new Date(leave.endDate));
      return value.isBetween(startDate, endDate, 'day', '[]');
    });

    // 添加打卡記錄，按時間排序
    const sortedAttendance = dayAttendance.sort((a, b) => {
      const timeA = dayjs(a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp));
      const timeB = dayjs(b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp));
      return timeA.diff(timeB);
    });

    sortedAttendance.forEach(record => {
      const time = dayjs(record.timestamp.toDate ? record.timestamp.toDate() : new Date(record.timestamp));
      listData.push({
        type: record.type === 'clock_in' ? 'success' : 'processing',
        recordType: record.type,
        content: record.type === 'clock_in' ? '上班打卡' : '下班打卡',
        time: time.format('HH:mm'),
        color: record.type === 'clock_in' ? '#52c41a' : '#fa8c16'
      });
    });

    // 添加請假記錄
    dayLeaves.forEach(leave => {
      const leaveTypeName = getLeaveTypeName(leave);
      const leaveTypeColor = getLeaveTypeColor(leave);
      listData.push({
        type: leave.status === 'approved' ? 'warning' : 'default',
        recordType: 'leave',
        content: leaveTypeName,
        color: leaveTypeColor,
        status: leave.status
      });
    });

    return listData || [];
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    
    // 按類型分組和排序記錄
    const groupedData = {
      clockIn: [],
      clockOut: [],
      leaves: []
    };
    
    listData.forEach(item => {
      if (item.recordType === 'clock_in') {
        groupedData.clockIn.push(item);
      } else if (item.recordType === 'clock_out') {
        groupedData.clockOut.push(item);
      } else if (item.recordType === 'leave') {
        groupedData.leaves.push(item);
      }
    });

    return (
      <div style={{ 
        padding: '4px', 
        fontSize: '14px', 
        lineHeight: '1.4',
        height: '100%',
        overflow: 'hidden'
      }}>
        {/* 上班打卡 */}
        {groupedData.clockIn.length > 0 && (
          <div style={{ marginBottom: '3px' }}>
            <span style={{ 
              color: '#52c41a', 
              fontWeight: 'bold',
              fontSize: '13px'
            }}>
              上班 {groupedData.clockIn[0].time}
            </span>
          </div>
        )}
        
        {/* 下班打卡 */}
        {groupedData.clockOut.length > 0 && (
          <div style={{ marginBottom: '3px' }}>
            <span style={{ 
              color: '#fa8c16', 
              fontWeight: 'bold',
              fontSize: '13px'
            }}>
              下班 {groupedData.clockOut[0].time}
            </span>
          </div>
        )}
        
        {/* 請假記錄 */}
        {groupedData.leaves.slice(0, 2).map((item, index) => (
          <div key={index} style={{ marginBottom: '3px' }}>
            <span style={{ 
              color: item.color,
              fontSize: '12px',
              backgroundColor: `${item.color}15`,
              padding: '3px 6px',
              borderRadius: '4px',
              display: 'inline-block',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: '600'
            }}>
              {item.content}
            </span>
          </div>
        ))}
        
        {/* 如果有更多請假記錄，顯示省略號 */}
        {groupedData.leaves.length > 2 && (
          <div style={{ fontSize: '11px', color: '#999', fontWeight: '500' }}>
            +{groupedData.leaves.length - 2}...
          </div>
        )}
      </div>
    );
  };

  const onSelect = (value) => {
    setSelectedDate(value);
    
    const dateStr = value.format('YYYY-MM-DD');
    
    // 獲取該日期的詳細記錄
    const dayAttendance = attendanceRecords.filter(record => {
      const recordDate = dayjs(record.timestamp.toDate ? record.timestamp.toDate() : new Date(record.timestamp));
      return recordDate.format('YYYY-MM-DD') === dateStr;
    });

    const dayLeaves = leaveRequests.filter(leave => {
      const startDate = dayjs(leave.startDate.toDate ? leave.startDate.toDate() : new Date(leave.startDate));
      const endDate = dayjs(leave.endDate.toDate ? leave.endDate.toDate() : new Date(leave.endDate));
      return value.isBetween(startDate, endDate, 'day', '[]');
    });

    setSelectedDateRecords({
      attendance: dayAttendance,
      leaves: dayLeaves
    });
    
    setDrawerVisible(true);
  };

  const onPanelChange = (value) => {
    setCurrentMonth(value);
    // 月份改變時不自動打開抽屜
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => prev.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => prev.add(1, 'month'));
  };

  const renderDrawerContent = () => {
    const { attendance, leaves } = selectedDateRecords;
    const hasData = attendance.length > 0 || leaves.length > 0;

    if (!hasData) {
      return (
        <Empty
          image={<CalendarOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
          description="該日期沒有打卡或請假記錄"
        />
      );
    }

    return (
      <div>
        {/* 打卡記錄 */}
        {attendance.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <Title level={5}>
              <ClockCircleOutlined /> 打卡記錄
            </Title>
            <List
              dataSource={attendance}
              renderItem={(record) => {
                const time = dayjs(record.timestamp.toDate ? record.timestamp.toDate() : new Date(record.timestamp));
                return (
                  <List.Item>
                    <Space>
                      <Tag 
                        icon={record.type === 'clock_in' ? <LoginOutlined /> : <LogoutOutlined />}
                        color={record.type === 'clock_in' ? 'green' : 'orange'}
                      >
                        {record.type === 'clock_in' ? '上班' : '下班'}
                      </Tag>
                      <Text>{time.format('HH:mm:ss')}</Text>
                      {(isAdmin || isManager) && (
                        <Text type="secondary">({getUserName(record.userId)})</Text>
                      )}
                    </Space>
                  </List.Item>
                );
              }}
            />
          </div>
        )}

        {/* 請假記錄 */}
        {leaves.length > 0 && (
          <div>
            <Title level={5}>
              <FileTextOutlined /> 請假記錄
            </Title>
            <List
              dataSource={leaves}
              renderItem={(leave) => {
                const startDate = dayjs(leave.startDate.toDate ? leave.startDate.toDate() : new Date(leave.startDate));
                const endDate = dayjs(leave.endDate.toDate ? leave.endDate.toDate() : new Date(leave.endDate));
                
                return (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <Tag color={getLeaveTypeColor(leave)}>
                            {getLeaveTypeName(leave)}
                          </Tag>
                          <Tag color={
                            leave.status === 'approved' ? 'green' : 
                            leave.status === 'rejected' ? 'red' : 'blue'
                          }>
                            {leave.status === 'approved' ? '已批准' : 
                             leave.status === 'rejected' ? '已拒絕' : '待審核'}
                          </Tag>
                          {(isAdmin || isManager) && (
                            <Text type="secondary">({getUserName(leave.userId)})</Text>
                          )}
                        </Space>
                        <Text type="secondary">
                          {startDate.format('YYYY-MM-DD')} 至 {endDate.format('YYYY-MM-DD')}
                        </Text>
                        {leave.reason && (
                          <Text type="secondary">原因：{leave.reason}</Text>
                        )}
                      </Space>
                    </div>
                  </List.Item>
                );
              }}
            />
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner text="載入月曆數據中..." />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>出勤月曆</Title>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={loadData}
        >
          重新載入
        </Button>
      </div>

      {/* 用戶選擇器 */}
      {(isAdmin || isManager) && (
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col>
              <UserOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
              <span style={{ marginLeft: '8px', fontWeight: 500 }}>選擇員工：</span>
            </Col>
            <Col flex="auto">
              <Select
                style={{ width: '100%', maxWidth: '300px' }}
                value={selectedUserId}
                onChange={setSelectedUserId}
                placeholder="選擇要查看的員工"
              >
                {users.map(user => (
                  <Option key={user.uid} value={user.uid}>
                    {user.name} ({user.email})
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>
      )}

      {/* 月曆顯示 */}
      <Card 
        title={
          <Space>
            <CalendarOutlined />
            {selectedUserId && `${getUserName(selectedUserId)} 的出勤月曆`}
            <Text type="secondary">- {currentMonth.format('YYYY年MM月')}</Text>
          </Space>
        }
        extra={
          <Space>
            <Button 
              type="text" 
              icon={<LeftOutlined />} 
              onClick={handlePrevMonth}
              size="small"
            />
            <Button 
              type="text" 
              icon={<RightOutlined />} 
              onClick={handleNextMonth}
              size="small"
            />
          </Space>
        }
      >
        <style>{`
          .calendar-custom .ant-picker-cell {
            height: 120px;
          }
          .calendar-custom .ant-picker-cell-inner {
            height: 120px !important;
            overflow: hidden !important;
          }
          .calendar-custom .ant-picker-calendar-date-content {
            height: 90px !important;
            overflow: hidden !important;
          }
        `}</style>
        <div className="calendar-custom">
          <Calendar 
            dateCellRender={dateCellRender}
            onSelect={onSelect}
            onPanelChange={onPanelChange}
            value={currentMonth}
          />
        </div>
      </Card>

      {/* 詳細記錄抽屜 */}
      <Drawer
        title={
          <Space>
            <CalendarOutlined />
            {selectedDate && selectedDate.format('YYYY年MM月DD日')} 詳細記錄
          </Space>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
      >
        {renderDrawerContent()}
      </Drawer>
    </div>
  );
};

export default CalendarPage;