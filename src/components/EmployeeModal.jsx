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
  App
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  HomeOutlined, 
  ClockCircleOutlined,
  LockOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

const EmployeeModal = ({ employee, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const departments = [
    '人力資源部',
    '財務部',
    '資訊部',
    '業務部',
    '行銷部',
    '研發部',
    '製造部',
    '品管部',
    '客服部',
    '總務部'
  ];

  const roles = [
    { value: 'employee', label: '一般員工' },
    { value: 'manager', label: '部門主管' },
    { value: 'admin', label: '系統管理員' }
  ];

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
        isActive: employee.isActive !== false
      });
    } else {
      form.setFieldsValue({
        role: 'employee',
        workingHours: [dayjs('09:00', 'HH:mm'), dayjs('18:00', 'HH:mm')],
        isActive: true
      });
    }
  }, [employee, form]);

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
              allowClear
            >
              {departments.map(dept => (
                <Option key={dept} value={dept}>{dept}</Option>
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

        <Form.Item
          name="role"
          label="角色"
        >
          <Select placeholder="請選擇角色">
            {roles.map(role => (
              <Option key={role.value} value={role.value}>
                {role.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="workingHours"
          label="工作時間"
        >
          <TimePicker.RangePicker
            format="HH:mm"
            placeholder={['上班時間', '下班時間']}
            style={{ width: '100%' }}
          />
        </Form.Item>

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