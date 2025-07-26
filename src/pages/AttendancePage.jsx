import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  DatePicker, 
  Select, 
  Space, 
  Typography, 
  Tag,
  Row,
  Col,
  App,
  Empty
} from 'antd';
import { 
  CalendarOutlined, 
  DownloadOutlined, 
  FilterOutlined, 
  ClockCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../firebase/firestoreService';
import LoadingSpinner from '../components/LoadingSpinner';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AttendancePage = () => {
  const { userData, isAdmin, isManager } = useAuth();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: null,
    userId: userData?.uid || '',
    type: ''
  });
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadData();
  }, [userData]);

  useEffect(() => {
    applyFilters();
  }, [attendanceRecords, filters]);

  const loadData = async () => {
    if (!userData) return;

    try {
      setLoading(true);

      if (isAdmin || isManager) {
        // 管理員和主管可以看到所有員工的記錄
        const [allUsers, allRecords] = await Promise.all([
          firestoreService.getAllUsers(),
          firestoreService.getAttendanceRecords() // 獲取所有記錄
        ]);
        setUsers(allUsers);
        setAttendanceRecords(allRecords);
      } else {
        // 一般員工只能看到自己的記錄
        const userRecords = await firestoreService.getAttendanceRecords(userData.uid);
        setAttendanceRecords(userRecords);
        setUsers([userData]);
      }
    } catch (error) {
      console.error('載入出勤記錄失敗:', error);
      message.error('載入數據失敗');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...attendanceRecords];

    // 按用戶篩選
    if (filters.userId) {
      filtered = filtered.filter(record => record.userId === filters.userId);
    }

    // 按類型篩選
    if (filters.type) {
      filtered = filtered.filter(record => record.type === filters.type);
    }

    // 按日期範圍篩選
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      filtered = filtered.filter(record => {
        const recordDate = dayjs(record.timestamp.toDate ? record.timestamp.toDate() : new Date(record.timestamp));
        return recordDate.isBetween(startDate, endDate, 'day', '[]');
      });
    }

    setFilteredRecords(filtered);
  };

  const exportRecords = () => {
    if (filteredRecords.length === 0) {
      message.error('沒有數據可以匯出');
      return;
    }

    const csvData = [
      ['日期', '時間', '員工姓名', '類型', '位置'],
      ...filteredRecords.map(record => {
        const user = users.find(u => u.uid === record.userId);
        const date = dayjs(record.timestamp.toDate ? record.timestamp.toDate() : new Date(record.timestamp));
        return [
          date.format('YYYY-MM-DD'),
          date.format('HH:mm:ss'),
          user?.name || '未知用戶',
          record.type === 'clock_in' ? '上班' : '下班',
          record.location ? `${record.location.latitude}, ${record.location.longitude}` : '無'
        ];
      })
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `出勤記錄_${dayjs().format('YYYY-MM-DD')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('記錄已匯出');
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.uid === userId);
    return user?.name || '未知用戶';
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'timestamp',
      key: 'date',
      width: 120,
      render: (timestamp) => {
        const date = dayjs(timestamp.toDate ? timestamp.toDate() : new Date(timestamp));
        return date.format('YYYY-MM-DD');
      },
    },
    {
      title: '時間',
      dataIndex: 'timestamp',
      key: 'time',
      width: 100,
      render: (timestamp) => {
        const date = dayjs(timestamp.toDate ? timestamp.toDate() : new Date(timestamp));
        return date.format('HH:mm:ss');
      },
    },
  ];

  if (isAdmin || isManager) {
    columns.push({
      title: '員工',
      dataIndex: 'userId',
      key: 'user',
      width: 120,
      render: (userId) => getUserName(userId),
    });
  }

  columns.push({
    title: '類型',
    dataIndex: 'type',
    key: 'type',
    width: 100,
    render: (type) => (
      <Tag 
        icon={type === 'clock_in' ? <LoginOutlined /> : <LogoutOutlined />}
        color={type === 'clock_in' ? 'green' : 'orange'}
      >
        {type === 'clock_in' ? '上班' : '下班'}
      </Tag>
    ),
  });

  if (loading) {
    return <LoadingSpinner text="載入出勤記錄中..." />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>出勤記錄</Title>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={exportRecords}
          disabled={filteredRecords.length === 0}
        >
          匯出記錄
        </Button>
      </div>

      {/* 篩選器 */}
      <Card 
        title={
          <Space>
            <FilterOutlined />
            篩選條件
          </Space>
        }
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                日期範圍
              </label>
              <RangePicker
                style={{ width: '100%' }}
                value={filters.dateRange}
                onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
                placeholder={['開始日期', '結束日期']}
              />
            </div>
          </Col>

          {(isAdmin || isManager) && (
            <Col xs={24} sm={12} md={8}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  員工
                </label>
                <Select
                  style={{ width: '100%' }}
                  value={filters.userId}
                  onChange={(value) => setFilters(prev => ({ ...prev, userId: value }))}
                  placeholder="選擇員工"
                  allowClear
                >
                  <Option value="">所有員工</Option>
                  {users.map(user => (
                    <Option key={user.uid} value={user.uid}>
                      {user.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
          )}

          <Col xs={24} sm={12} md={8}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                類型
              </label>
              <Select
                style={{ width: '100%' }}
                value={filters.type}
                onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                placeholder="選擇類型"
                allowClear
              >
                <Option value="">所有類型</Option>
                <Option value="clock_in">上班打卡</Option>
                <Option value="clock_out">下班打卡</Option>
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 記錄表格 */}
      <Card 
        title={
          <Space>
            <ClockCircleOutlined />
            出勤記錄 ({filteredRecords.length} 筆)
          </Space>
        }
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadData}
          >
            重新載入
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          pagination={{
            pageSize: pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50', '100'],
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 條，共 ${total} 條記錄`,
            onShowSizeChange: (current, size) => {
              setPageSize(size);
            }
          }}
          locale={{
            emptyText: (
              <Empty
                image={<CalendarOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
                description="沒有找到符合條件的記錄"
              />
            )
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default AttendancePage;