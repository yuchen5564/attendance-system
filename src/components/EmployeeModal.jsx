import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  TimePicker, 
  Switch, 
  Button, 
  Alert,
  Space,
  App,
  Spin
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  HomeOutlined, 
  ClockCircleOutlined,
  LockOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../firebase/firestoreService';
import dayjs from 'dayjs';

const { Option } = Select;

const EmployeeModal = ({ employee, onClose, onSubmit }) => {
  const { getDepartments } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [managersLoading, setManagersLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const { message } = App.useApp();

  const roles = [
    { value: 'employee', label: '一般員工' },
    { value: 'manager', label: '部門主管' },
    { value: 'admin', label: '系統管理員' }
  ];

  useEffect(() => {
    loadDepartments();
    loadManagers();
  }, []);

  useEffect(() => {
    if (employee) {
      form.setFieldsValue({
        name: employee.name || '',
        email: employee.email || '',
        department: employee.department || '',
        position: employee.position || '',
        role: employee.role || 'employee',
        workingHours: employee.workingHours ? [
          dayjs(employee.workingHours.start, 'HH:mm'),
          dayjs(employee.workingHours.end, 'HH:mm')
        ] : [dayjs('09:00', 'HH:mm'), dayjs('18:00', 'HH:mm')],
        managerId: employee.managerId || '',
        isActive: employee.isActive !== false
      });
    } else {
      form.setFieldsValue({
        role: 'employee',
        workingHours: [dayjs('09:00', 'HH:mm'), dayjs('18:00', 'HH:mm')],
        managerId: '',
        isActive: true
      });
    }
  }, [employee, form]);

  const loadDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const deptList = await getDepartments();
      setDepartments(deptList || []);
    } catch (error) {
      console.error('載入部門列表失敗:', error);
      message.error('載入部門列表失敗');
      // 設定預設部門列表作為備案
      setDepartments([
        { id: 'it', name: '資訊部', description: '負責資訊系統開發與維護', isDefault: true }
      ]);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const loadManagers = async () => {
    try {
      setManagersLoading(true);
      const managerList = await firestoreService.getManagers();
      setManagers(managerList || []);
    } catch (error) {
      console.error('載入主管列表失敗:', error);
      message.error('載入主管列表失敗');
      setManagers([]);
    } finally {
      setManagersLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const submitData = {
        ...values,
        workingHours: {
          start: values.workingHours[0].format('HH:mm'),
          end: values.workingHours[1].format('HH:mm')
        }
      };

      if (employee) {
        submitData.uid = employee.uid;
      }

      // 編輯模式下，如果沒有輸入新密碼，就不更新密碼
      if (employee && !values.password?.trim()) {
        delete submitData.password;
      }

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('提交員工資料失敗:', error);
      message.error('操作失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          {employee ? '編輯員工' : '新增員工'}
        </Space>
      }
      open={true}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        preserve={false}
      >
        <Form.Item
          name="name"
          label="姓名"
          rules={[{ required: true, message: '請輸入員工姓名' }]}
        >
          <Input 
            prefix={<UserOutlined />}
            placeholder="請輸入員工姓名" 
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="電子郵件"
          rules={[
            { required: true, message: '請輸入電子郵件' },
            { type: 'email', message: '請輸入有效的電子郵件格式' }
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="請輸入電子郵件"
            disabled={!!employee}
          />
        </Form.Item>

        {employee && (
          <Alert
            message="編輯模式下無法修改電子郵件"
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        <Form.Item
          name="password"
          label={`密碼 ${!employee ? '*' : ''}`}
          rules={!employee ? [
            { required: true, message: '請設定密碼' },
            { min: 6, message: '密碼至少需要6個字元' }
          ] : []}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={
              employee 
                ? "編輯模式不支援修改密碼"
                : "請設定密碼（至少6個字元）"
            }
            disabled={!!employee}
          />
        </Form.Item>

        {employee && (
          <Alert
            message="安全考量：無法在此修改密碼。請使用「重設密碼」按鈕發送重設郵件給用戶。"
            type="warning"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="department"
            label="部門"
            rules={[{ required: true, message: '請選擇部門' }]}
          >
            <Select
              placeholder="請選擇部門"
              loading={departmentsLoading}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent={departmentsLoading ? <Spin size="small" /> : '無可用部門'}
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  {departments.length === 0 && !departmentsLoading && (
                    <div style={{ 
                      padding: '8px 12px', 
                      textAlign: 'center', 
                      color: '#999',
                      fontSize: '12px'
                    }}>
                      暫無可用部門，請先在系統設定中新增部門
                    </div>
                  )}
                </div>
              )}
            >
              {departments.map(dept => (
                <Option key={dept.id} value={dept.name} label={dept.name}>
                  <Space>
                    <TeamOutlined />
                    {dept.name}
                    {dept.isDefault && (
                      <span style={{ color: '#1890ff', fontSize: '11px' }}>(預設)</span>
                    )}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="position"
            label="職位"
            rules={[{ required: true, message: '請輸入職位' }]}
          >
            <Input placeholder="請輸入職位" />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="role"
            label="角色權限"
            rules={[{ required: true, message: '請選擇角色權限' }]}
          >
            <Select placeholder="請選擇角色權限">
              {roles.map(role => (
                <Option key={role.value} value={role.value}>
                  <Space>
                    <UserOutlined />
                    {role.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="managerId"
            label="直屬主管"
          >
            <Select
              placeholder="請選擇直屬主管"
              allowClear
              loading={managersLoading}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent={managersLoading ? <Spin size="small" /> : '無可用主管'}
            >
              {managers
                .filter(manager => manager.uid !== employee?.uid)
                .map(manager => (
                  <Option key={manager.uid} value={manager.uid} label={manager.name}>
                    <Space>
                      <TeamOutlined />
                      {manager.name}
                      <span style={{ color: '#666', fontSize: '12px' }}>
                        ({manager.department})
                      </span>
                    </Space>
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          name="workingHours"
          label="工作時間"
          rules={[{ required: true, message: '請設定工作時間' }]}
        >
          <TimePicker.RangePicker
            format="HH:mm"
            placeholder={['上班時間', '下班時間']}
            style={{ width: '100%' }}
          />
        </Form.Item>

        {/* 如果需要啟用/停用功能，可以取消註解 */}
        {/* {employee && (
          <Form.Item
            name="isActive"
            label="啟用狀態"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="啟用" 
              unCheckedChildren="停用" 
            />
          </Form.Item>
        )} */}

        <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>
              取消
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              disabled={departments.length === 0 && !departmentsLoading}
            >
              {employee ? '更新' : '創建'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EmployeeModal;