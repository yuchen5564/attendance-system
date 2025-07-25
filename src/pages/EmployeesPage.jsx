import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Table, 
  Input, 
  Space, 
  Tag, 
  Typography, 
  Card, 
  Popconfirm,
  App,
  Empty
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  TeamOutlined, 
  SearchOutlined, 
  ReloadOutlined,
  KeyOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../firebase/firestoreService';
import { authService } from '../firebase/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmployeeModal from '../components/EmployeeModal';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/config';

const { Title } = Typography;
const { Search } = Input;

const EmployeesPage = () => {
  const { userData, isAdmin } = useAuth();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [managers, setManagers] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const users = await firestoreService.getAllUsers();
      setEmployees(users);
      
      // 載入主管資料以便顯示主管姓名
      const managerData = {};
      const uniqueManagerIds = [...new Set(users.map(user => user.managerId).filter(Boolean))];
      
      for (const managerId of uniqueManagerIds) {
        try {
          const manager = await firestoreService.getUserById(managerId);
          if (manager) {
            managerData[managerId] = manager;
          }
        } catch (error) {
          console.warn(`無法載入主管資料 ${managerId}:`, error);
        }
      }
      
      setManagers(managerData);
    } catch (error) {
      console.error('載入員工列表失敗:', error);
      message.error('載入數據失敗');
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const filtered = employees.filter(employee => {
      const managerName = employee.managerId ? managers[employee.managerId]?.name || '' : '';
      return employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        managerName.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredEmployees(filtered);
  };

  const handleCreateEmployee = async (employeeData) => {
    try {
      await authService.createUser(employeeData);
      message.success('員工創建成功');
      setShowModal(false);
      loadEmployees();
    } catch (error) {
      console.error('創建員工失敗:', error);
      if (error.code === 'auth/email-already-in-use') {
        message.error('此電子郵件已被使用');
      } else {
        message.error('創建員工失敗');
      }
      throw error;
    }
  };

  const handleUpdateEmployee = async (employeeData) => {
    try {
      if (employeeData.password && employeeData.password.trim()) {
        message.error('安全考量：無法直接修改用戶密碼。請使用密碼重設功能或請用戶自行修改密碼。');
        return;
      }

      await authService.updateUser(employeeData);
      message.success('員工資料更新成功');
      setShowModal(false);
      setEditingEmployee(null);
      loadEmployees();
    } catch (error) {
      console.error('更新員工失敗:', error);
      message.error('更新員工失敗');
      throw error;
    }
  };

  const handleResetPassword = async (employee) => {
    try {
      await sendPasswordResetEmail(auth, employee.email);
      message.success(`密碼重設郵件已發送至 ${employee.email}`);
    } catch (error) {
      console.error('發送密碼重設郵件失敗:', error);
      message.error('發送密碼重設郵件失敗');
    }
  };

  const handleDeleteEmployee = async (employee) => {
    try {
      await firestoreService.updateUser(employee.uid, { isActive: false });
      message.success('員工已停用');
      loadEmployees();
    } catch (error) {
      console.error('刪除員工失敗:', error);
      message.error('操作失敗');
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': 
        return { text: '系統管理員', color: 'red' };
      case 'manager': 
        return { text: '部門主管', color: 'blue' };
      case 'employee': 
        return { text: '一般員工', color: 'green' };
      default: 
        return { text: role, color: 'default' };
    }
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: '電子郵件',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: '部門',
      dataIndex: 'department',
      key: 'department',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: '職位',
      dataIndex: 'position',
      key: 'position',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => {
        const roleInfo = getRoleText(role);
        return <Tag color={roleInfo.color}>{roleInfo.text}</Tag>;
      },
    },
    {
      title: '直屬主管',
      dataIndex: 'managerId',
      key: 'managerId',
      width: 120,
      render: (managerId) => {
        if (!managerId) return '-';
        const manager = managers[managerId];
        return manager ? manager.name : '載入中...';
      },
    },
    {
      title: '工作時間',
      dataIndex: 'workingHours',
      key: 'workingHours',
      width: 140,
      render: (workingHours) => 
        workingHours ? `${workingHours.start} - ${workingHours.end}` : '-',
    },
    {
      title: '狀態',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive) => (
        <Tag color={isActive !== false ? 'green' : 'red'}>
          {isActive !== false ? '啟用' : '停用'}
        </Tag>
      ),
    },
  ];

  if (isAdmin) {
    columns.push({
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingEmployee(record);
              setShowModal(true);
            }}
            size="small"
          >
            編輯
          </Button>
          <Button
            type="link"
            icon={<KeyOutlined />}
            onClick={() => handleResetPassword(record)}
            size="small"
          >
            重設密碼
          </Button>
          {/* {record.isActive !== false && (
            <Popconfirm
              title="確定要停用此員工嗎？"
              description="此操作將停用員工帳戶"
              onConfirm={() => handleDeleteEmployee(record)}
              okText="確定"
              cancelText="取消"
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                size="small"
              >
                停用
              </Button>
            </Popconfirm>
          )} */}
        </Space>
      ),
    });
  }

  if (loading) {
    return <LoadingSpinner text="載入員工資料中..." />;
  }

  // 檢查權限
  if (!isAdmin && userData?.role !== 'manager') {
    return (
      <Card>
        <Empty
          image={<TeamOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
          description={
            <div>
              <Title level={4}>權限不足</Title>
              <p>您沒有權限訪問員工管理功能</p>
            </div>
          }
        />
      </Card>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>員工管理</Title>
        </div>
        {isAdmin && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowModal(true)}
          >
            新增員工
          </Button>
        )}
      </div>

      {/* 搜尋框 */}
      <Card style={{ marginBottom: '24px' }}>
        <Search
          placeholder="搜尋員工姓名、電子郵件、部門、職位或主管..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* 員工列表 */}
      <Card 
        title={
          <Space>
            <TeamOutlined />
            員工列表 ({filteredEmployees.length} 人)
          </Space>
        }
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadEmployees}
          >
            重新載入
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredEmployees}
          rowKey="uid"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 條，共 ${total} 條記錄`,
          }}
          locale={{
            emptyText: searchTerm ? '沒有找到符合條件的員工' : '暫無員工資料'
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 員工編輯彈窗 */}
      {showModal && (
        <EmployeeModal
          employee={editingEmployee}
          onClose={() => {
            setShowModal(false);
            setEditingEmployee(null);
          }}
          onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}
        />
      )}
    </div>
  );
};

export default EmployeesPage;