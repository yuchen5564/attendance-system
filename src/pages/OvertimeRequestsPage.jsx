import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  Space, 
  Typography, 
  Tag, 
  List, 
  Modal, 
  Input,
  Popconfirm,
  Empty,
  Segmented,
  App
} from 'antd';
import { 
  PlusOutlined, 
  ClockCircleOutlined, 
  CheckOutlined, 
  CloseOutlined, 
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../firebase/firestoreService';
import LoadingSpinner from '../components/LoadingSpinner';
import OvertimeRequestModal from '../components/OvertimeRequestModal';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const OvertimeRequestsPage = () => {
  const { userData, isAdmin, isManager } = useAuth();
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [overtimeRequests, setOvertimeRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const filterOptions = [
    { label: '全部', value: 'all' },
    { label: '待審核', value: 'pending' },
    { label: '已批准', value: 'approved' },
    { label: '已拒絕', value: 'rejected' },
  ];

  useEffect(() => {
    loadData();
  }, [userData]);

  useEffect(() => {
    const filtered = filter === 'all' 
      ? overtimeRequests 
      : overtimeRequests.filter(request => request.status === filter);
    setFilteredRequests(filtered);
  }, [overtimeRequests, filter]);

  const loadData = async () => {
    if (!userData) return;

    try {
      setLoading(true);

      if (isAdmin || isManager) {
        // 管理員和主管可以看到所有加班申請
        const [allRequests, allUsers] = await Promise.all([
          firestoreService.getOvertimeRequests(),
          firestoreService.getAllUsers()
        ]);
        setOvertimeRequests(allRequests);
        setUsers(allUsers);
      } else {
        // 一般員工只能看到自己的加班申請
        const userRequests = await firestoreService.getOvertimeRequests(userData.uid);
        setOvertimeRequests(userRequests);
        setUsers([userData]);
      }
    } catch (error) {
      console.error('載入加班申請失敗:', error);
      message.error('載入數據失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await firestoreService.approveOvertimeRequest(requestId, userData.uid);
      message.success('加班申請已批准');
      loadData();
    } catch (error) {
      console.error('批准加班申請失敗:', error);
      message.error('操作失敗');
    }
  };

  const handleReject = (requestId) => {
    modal.confirm({
      title: '拒絕加班申請',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p style={{ marginBottom: '16px' }}>請輸入拒絕原因：</p>
          <TextArea
            id="reject-reason"
            rows={3}
            placeholder="請輸入拒絕原因（可選）"
            maxLength={200}
          />
        </div>
      ),
      okText: '確認拒絕',
      cancelText: '取消',
      onOk: async () => {
        try {
          const reason = document.getElementById('reject-reason')?.value || '';
          await firestoreService.rejectOvertimeRequest(requestId, userData.uid, reason);
          message.success('加班申請已拒絕');
          loadData();
        } catch (error) {
          console.error('拒絕加班申請失敗:', error);
          message.error('操作失敗');
        }
      },
    });
  };

  const handleSubmitRequest = async (requestData) => {
    try {
      await firestoreService.submitOvertimeRequest({
        ...requestData,
        userId: userData.uid,
        userName: userData.name,
        userDepartment: userData.department
      });
      message.success('加班申請已提交');
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('提交加班申請失敗:', error);
      message.error('提交失敗');
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.uid === userId);
    return user?.name || '未知用戶';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return dayjs(date).format('YYYY-MM-DD');
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return dayjs(date).format('YYYY-MM-DD HH:mm');
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'orange', text: '待審核' };
      case 'approved':
        return { color: 'green', text: '已批准' };
      case 'rejected':
        return { color: 'red', text: '已拒絕' };
      default:
        return { color: 'default', text: status };
    }
  };

  if (loading) {
    return <LoadingSpinner text="載入加班申請中..." />;
  }

  const getFilterCount = (filterValue) => {
    if (filterValue === 'all') return overtimeRequests.length;
    return overtimeRequests.filter(r => r.status === filterValue).length;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>加班管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowModal(true)}
        >
          新增加班申請
        </Button>
      </div>

      {/* 篩選標籤 */}
      <Card style={{ marginBottom: '24px' }}>
        <Segmented
          value={filter}
          onChange={setFilter}
          options={filterOptions.map(option => ({
            ...option,
            label: `${option.label} (${getFilterCount(option.value)})`
          }))}
          style={{ width: '100%' }}
        />
      </Card>

      {/* 加班申請列表 */}
      <Card 
        title={
          <Space>
            <ClockCircleOutlined />
            加班申請 ({filteredRequests.length} 筆)
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
        {filteredRequests.length === 0 ? (
          <Empty 
            image={<ClockCircleOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
            description="沒有找到符合條件的加班申請"
          />
        ) : (
          <List
            itemLayout="vertical"
            size="large"
            pagination={{
              pageSize: 8,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `第 ${range[0]}-${range[1]} 條，共 ${total} 條記錄`,
            }}
            dataSource={filteredRequests}
            renderItem={(request) => {
              const statusConfig = getStatusConfig(request.status);
              
              return (
                <List.Item
                  key={request.id}
                  style={{
                    borderLeft: `4px solid ${
                      request.status === 'pending' ? '#faad14' :
                      request.status === 'approved' ? '#52c41a' : '#ff4d4f'
                    }`,
                    backgroundColor: '#fafafa',
                    marginBottom: '16px',
                    borderRadius: '8px',
                    padding: '16px',
                  }}
                  actions={[
                    ...(isAdmin || isManager) && request.status === 'pending' ? [
                      <Popconfirm
                        key="approve"
                        title="確定批准此加班申請嗎？"
                        onConfirm={() => handleApprove(request.id)}
                        okText="確定"
                        cancelText="取消"
                      >
                        <Button 
                          type="primary" 
                          size="small"
                          icon={<CheckOutlined />}
                        >
                          批准
                        </Button>
                      </Popconfirm>,
                      <Button
                        key="reject"
                        danger
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() => handleReject(request.id)}
                      >
                        拒絕
                      </Button>
                    ] : []
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space>
                          {(isAdmin || isManager) && (
                            <Text strong>{getUserName(request.userId)}</Text>
                          )}
                          <Tag 
                            color="#1890ff"
                            style={{ 
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            加班申請
                          </Tag>
                        </Space>
                        <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
                      </div>
                    }
                    description={
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text>
                          <ClockCircleOutlined style={{ marginRight: '8px' }} />
                          日期：{formatDate(request.date)}
                        </Text>
                        <Text>
                          時間：{request.startTime} ~ {request.endTime}
                          <Text type="secondary" style={{ marginLeft: '8px' }}>
                            ({request.hours} 小時)
                          </Text>
                        </Text>
                        
                        <div>
                          <Text strong>加班原因：</Text>
                          <Paragraph 
                            ellipsis={{ rows: 2, expandable: true, symbol: '展開' }}
                            style={{ marginBottom: 0 }}
                          >
                            {request.reason}
                          </Paragraph>
                        </div>

                        {request.comments && (
                          <div style={{ 
                            padding: '12px', 
                            backgroundColor: '#f0f0f0', 
                            borderRadius: '6px',
                            marginTop: '8px'
                          }}>
                            <Text strong style={{ color: '#1890ff' }}>審核意見：</Text>
                            <div style={{ marginTop: '4px' }}>
                              <Text>{request.comments}</Text>
                            </div>
                          </div>
                        )}

                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          申請時間：{formatDateTime(request.createdAt)}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Card>

      {/* 加班申請彈窗 */}
      {showModal && (
        <OvertimeRequestModal
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitRequest}
        />
      )}
    </div>
  );
};

export default OvertimeRequestsPage;