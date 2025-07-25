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
  CalendarOutlined, 
  CheckOutlined, 
  CloseOutlined, 
  EyeOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../firebase/firestoreService';
import { emailService } from '../firebase/emailService';
import LoadingSpinner from '../components/LoadingSpinner';
import LeaveRequestModal from '../components/LeaveRequestModal';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const LeaveRequestsPage = () => {
  const { userData, isAdmin, isManager, getLeaveTypes } = useAuth();
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
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
    loadLeaveTypes();
  }, [userData]);

  useEffect(() => {
    const filtered = filter === 'all' 
      ? leaveRequests 
      : leaveRequests.filter(request => request.status === filter);
    setFilteredRequests(filtered);
  }, [leaveRequests, filter]);

  const loadLeaveTypes = async () => {
    try {
      const types = await getLeaveTypes();
      setLeaveTypes(types || []);
    } catch (error) {
      console.error('載入請假假別失敗:', error);
      // 設定預設假別作為備案
      setLeaveTypes([
        { id: 'annual', name: '特休', color: '#52c41a' },
        { id: 'sick', name: '病假', color: '#fa8c16' },
        { id: 'personal', name: '事假', color: '#1890ff' }
      ]);
    }
  };

  const loadData = async () => {
    if (!userData) return;

    try {
      setLoading(true);

      if (isAdmin || isManager) {
        // 管理員和主管可以看到所有請假申請
        const [allRequests, allUsers] = await Promise.all([
          firestoreService.getLeaveRequests(),
          firestoreService.getAllUsers()
        ]);
        setLeaveRequests(allRequests);
        setUsers(allUsers);
      } else {
        // 一般員工只能看到自己的請假申請
        const userRequests = await firestoreService.getLeaveRequests(userData.uid);
        setLeaveRequests(userRequests);
        setUsers([userData]);
      }
    } catch (error) {
      console.error('載入請假申請失敗:', error);
      message.error('載入數據失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await firestoreService.approveLeaveRequest(requestId, userData.uid);
      message.success('請假申請已批准');
      loadData();
    } catch (error) {
      console.error('批准請假申請失敗:', error);
      message.error('操作失敗');
    }
  };

  const handleReject = (requestId) => {
    modal.confirm({
      title: '拒絕請假申請',
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
          await firestoreService.rejectLeaveRequest(requestId, userData.uid, reason);
          message.success('請假申請已拒絕');
          loadData();
        } catch (error) {
          console.error('拒絕請假申請失敗:', error);
          message.error('操作失敗');
        }
      },
    });
  };

  const handleSubmitRequest = async (requestData) => {
    try {
      // 提交請假申請
      const requestId = await firestoreService.submitLeaveRequest({
        ...requestData,
        userId: userData.uid,
        userName: userData.name,
        userDepartment: userData.department
      });

      // 如果用戶有設定主管，發送郵件通知
      const hasValidManager = userData.managerId && 
                              userData.managerId !== null && 
                              userData.managerId !== '' && 
                              typeof userData.managerId === 'string' && 
                              userData.managerId.trim() !== '';
      
      if (hasValidManager) {
        try {
          const manager = await firestoreService.getUserById(userData.managerId);
          if (manager && manager.email) {
            await emailService.sendLeaveRequestNotification(
              { ...requestData, id: requestId },
              manager.email,
              manager.name,
              userData.name
            );
            console.log('已發送請假申請通知郵件給主管');
          }
        } catch (emailError) {
          console.warn('發送郵件通知失敗:', emailError);
          // 郵件發送失敗不影響請假申請本身
        }
      }

      message.success('請假申請已提交');
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('提交請假申請失敗:', error);
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

  const getLeaveTypeInfo = (typeId) => {
    // 先嘗試從系統設定的假別中找
    const systemType = leaveTypes.find(type => type.id === typeId);
    if (systemType) {
      return {
        name: systemType.name,
        color: systemType.color || '#1890ff'
      };
    }

    // 備案：舊的靜態假別對應
    const legacyTypes = {
      annual: { name: '特休', color: '#52c41a' },
      sick: { name: '病假', color: '#fa8c16' },
      personal: { name: '事假', color: '#1890ff' },
      maternity: { name: '產假', color: '#722ed1' },
      paternity: { name: '陪產假', color: '#13c2c2' },
      funeral: { name: '喪假', color: '#595959' },
      marriage: { name: '婚假', color: '#eb2f96' },
      other: { name: '其他', color: '#fadb14' }
    };
    
    return legacyTypes[typeId] || { name: typeId, color: '#1890ff' };
  };

  if (loading) {
    return <LoadingSpinner text="載入請假申請中..." />;
  }

  const getFilterCount = (filterValue) => {
    if (filterValue === 'all') return leaveRequests.length;
    return leaveRequests.filter(r => r.status === filterValue).length;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>請假管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowModal(true)}
        >
          新增請假申請
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

      {/* 請假申請列表 */}
      <Card 
        title={
          <Space>
            <CalendarOutlined />
            請假申請 ({filteredRequests.length} 筆)
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
            image={<CalendarOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
            description="沒有找到符合條件的請假申請"
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
              const leaveTypeInfo = getLeaveTypeInfo(request.type);
              
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
                        title="確定批准此請假申請嗎？"
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
                            color={leaveTypeInfo.color}
                            style={{ 
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            {request.typeName || leaveTypeInfo.name}
                          </Tag>
                        </Space>
                        <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
                      </div>
                    }
                    description={
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text>
                          <CalendarOutlined style={{ marginRight: '8px' }} />
                          {formatDate(request.startDate)} ~ {formatDate(request.endDate)}
                          <Text type="secondary" style={{ marginLeft: '8px' }}>
                            ({request.days} 天)
                          </Text>
                        </Text>
                        
                        <div>
                          <Text strong>請假原因：</Text>
                          <Paragraph 
                            ellipsis={{ rows: 2, expandable: true, symbol: '展開' }}
                            style={{ marginBottom: 0 }}
                          >
                            {request.reason}
                          </Paragraph>
                        </div>

                        {/* 顯示是否需要審核 */}
                        {request.requireApproval !== undefined && (
                          <div>
                            <Tag 
                              color={request.requireApproval ? 'orange' : 'green'} 
                              size="small"
                            >
                              {request.requireApproval ? '需要審核' : '免審核'}
                            </Tag>
                          </div>
                        )}

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
                          申請時間：{formatDate(request.createdAt)}
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

      {/* 請假申請彈窗 */}
      {showModal && (
        <LeaveRequestModal
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitRequest}
        />
      )}
    </div>
  );
};

export default LeaveRequestsPage;