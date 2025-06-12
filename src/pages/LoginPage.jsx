import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Space, 
  Alert,
  App
} from 'antd';
import { 
  LoginOutlined, 
  EyeInvisibleOutlined, 
  EyeTwoTone, 
  ClockCircleOutlined,
  UserOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await signIn(values.email, values.password);
      message.success('登入成功！');
      navigate('/dashboard');
    } catch (error) {
      console.error('登入錯誤:', error);
      let errorMessage = '登入失敗，請稍後再試';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = '找不到此用戶';
          break;
        case 'auth/wrong-password':
          errorMessage = '密碼錯誤';
          break;
        case 'auth/invalid-email':
          errorMessage = '無效的電子郵件格式';
          break;
        case 'auth/too-many-requests':
          errorMessage = '登入嘗試過於頻繁，請稍後再試';
          break;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '400px',
          maxHeight: 'calc(100vh - 32px)',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        bodyStyle={{
          padding: '24px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ marginBottom: '12px' }}>
            <ClockCircleOutlined 
              style={{ 
                fontSize: '40px', 
                color: '#3b82f6',
                backgroundColor: '#eff6ff',
                padding: '12px',
                borderRadius: '50%',
              }} 
            />
          </div>
          <Title level={2} style={{ marginBottom: '4px', fontSize: '24px' }}>
            打卡系統 - 使用者登入
          </Title>
          <Text type="secondary">請登入您的帳戶</Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
          size="middle"
        >
          <Form.Item
            name="email"
            label="電子郵件"
            rules={[
              { required: true, message: '請輸入電子郵件' },
              { type: 'email', message: '請輸入有效的電子郵件格式' }
            ]}
            style={{ marginBottom: '16px' }}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="請輸入您的電子郵件"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密碼"
            rules={[{ required: true, message: '請輸入密碼' }]}
            style={{ marginBottom: '20px' }}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="請輸入您的密碼"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '16px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
              icon={<LoginOutlined />}
            >
              {loading ? '登入中...' : '登入'}
            </Button>
          </Form.Item>
        </Form>

        <Alert
          message="預設帳戶"
          description={
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text style={{ fontSize: '12px' }}>管理員: admin@company.com / admin123</Text>
              {/* <Text style={{ fontSize: '12px' }}>員工: employee@company.com / employee123</Text> */}
            </Space>
          }
          type="info"
          showIcon
          style={{ margin: 0 }}
        />
      </Card>
    </div>
  );
};

export default LoginPage;