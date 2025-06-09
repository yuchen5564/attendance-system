import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Space, 
  Alert,
  App
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  ClockCircleOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const InitializeSystem = () => {
  const { initializeSystem } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      await initializeSystem(values);
      message.success('🎉 系統初始化完成！管理員帳戶已創建');
    } catch (error) {
      console.error('初始化失敗:', error);
      if (error.code === 'auth/email-already-in-use') {
        message.error('此電子郵件已被使用，系統可能已經初始化');
      } else if (error.code === 'auth/weak-password') {
        message.error('密碼太弱，請使用至少6個字元');
      } else {
        message.error('系統初始化失敗：' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const createSampleData = () => {
    form.setFieldsValue({
      email: 'admin@company.com',
      password: 'admin123',
      name: '系統管理員',
      department: '資訊部',
      position: '系統管理員'
    });
    message.success('已填入範例資料');
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        overflow: 'auto',
        boxSizing: 'border-box'
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          margin: 'auto',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <ClockCircleOutlined 
              style={{ 
                fontSize: '48px', 
                color: '#3b82f6',
                backgroundColor: '#eff6ff',
                padding: '16px',
                borderRadius: '50%',
              }} 
            />
          </div>
          <Title level={2} style={{ marginBottom: '8px' }}>
            企業打卡系統
          </Title>
          <Text type="secondary">首次使用需要初始化系統</Text>
        </div>

        <Alert
          message="創建管理員帳戶"
          description={
            <div>
              <p>這將創建系統的第一個管理員帳戶，管理員可以管理其他用戶和系統設定。</p>
              <Button 
                type="link" 
                onClick={createSampleData}
                style={{ padding: 0 }}
              >
                使用範例資料
              </Button>
            </div>
          }
          type="info"
          showIcon
          icon={<HomeOutlined />}
          style={{ marginBottom: '24px' }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{
            email: 'admin@company.com',
            password: 'admin123',
            name: '系統管理員',
            department: '資訊部',
            position: '系統管理員'
          }}
        >
          <Form.Item
            name="name"
            label="管理員姓名"
            rules={[{ required: true, message: '請輸入管理員姓名' }]}
          >
            <Input 
              prefix={<UserOutlined />}
              placeholder="請輸入管理員姓名" 
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
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密碼"
            rules={[
              { required: true, message: '請設定密碼' },
              { min: 6, message: '密碼至少需要6個字元' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="請設定密碼（至少6個字元）"
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="department"
              label="部門"
            >
              <Input 
                prefix={<HomeOutlined />}
                placeholder="部門" 
              />
            </Form.Item>

            <Form.Item
              name="position"
              label="職位"
            >
              <Input placeholder="職位" />
            </Form.Item>
          </div>

          <Form.Item style={{ marginTop: '24px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              {loading ? '初始化中...' : '🚀 開始使用企業打卡系統'}
            </Button>
          </Form.Item>
        </Form>

        <Alert
          message="系統功能"
          description={
            <Space direction="vertical" size="small">
              <Text>✅ 員工打卡管理</Text>
              <Text>✅ 請假申請與審核</Text>
              <Text>✅ 出勤報表分析</Text>
              <Text>✅ 多層級權限管理</Text>
            </Space>
          }
          type="success"
          style={{ marginTop: '24px' }}
        />
      </Card>
    </div>
  );
};

export default InitializeSystem;