import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Alert,
  Typography,
  Divider,
  Table,
  Tag,
  App
} from 'antd';
import {
  MailOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  SendOutlined
} from '@ant-design/icons';
import { systemService } from '../../firebase/systemService';
import { emailService } from '../../firebase/emailService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const EmailSettings = () => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [emailLogs, setEmailLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    loadEmailSettings();
    loadEmailLogs();
  }, []);

  const loadEmailSettings = async () => {
    try {
      const settings = await systemService.getEmailSettings();
      if (settings) {
        form.setFieldsValue(settings);
      }
    } catch (error) {
      console.error('載入郵件設定失敗:', error);
      message.error('載入郵件設定失敗');
    }
  };

  const loadEmailLogs = async () => {
    try {
      setLogsLoading(true);
      const logs = await systemService.getEmailLogs(20);
      setEmailLogs(logs);
    } catch (error) {
      console.error('載入郵件記錄失敗:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleSave = async (values) => {
    try {
      setLoading(true);
      
      // 清理表單數據，移除空字符串和 undefined
      const cleanValues = {};
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== '') {
          cleanValues[key] = values[key];
        }
      });

      await systemService.updateEmailSettings(cleanValues);
      message.success('郵件設定已儲存');
    } catch (error) {
      console.error('儲存郵件設定失敗:', error);
      message.error('儲存失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    try {
      const values = await form.validateFields(['senderName', 'senderEmail', 'adminEmail']);
      setTestLoading(true);
      
      // 檢查環境變數
      const gasScriptId = import.meta.env.VITE_GAS_SCRIPT_ID;
      if (!gasScriptId) {
        message.error('請先在環境變數中設定 VITE_GAS_SCRIPT_ID');
        return;
      }
      
      const testResult = await emailService.sendEmail({
        to: values.adminEmail,
        subject: '郵件服務測試',
        body: `這是一封測試郵件，如果您收到此郵件，表示郵件服務設定正確。

寄件人名稱：${values.senderName}
寄件人信箱：${values.senderEmail}
Google App Script ID：${gasScriptId}

此為系統自動發送的測試郵件。`,
        type: 'test'
      });

      if (testResult.success) {
        message.success('測試郵件發送成功');
        loadEmailLogs(); // 重新載入記錄
      } else {
        message.error(`測試郵件發送失敗: ${testResult.error || '未知錯誤'}`);
      }
    } catch (error) {
      console.error('測試郵件失敗:', error);
      if (error.errorFields) {
        message.error('請先填入必要的設定資訊');
      } else {
        message.error('測試郵件失敗');
      }
    } finally {
      setTestLoading(false);
    }
  };

  const logColumns = [
    {
      title: '時間',
      dataIndex: 'sentAt',
      key: 'sentAt',
      width: 150,
      render: (sentAt) => {
        if (!sentAt) return '-';
        const date = sentAt.toDate ? sentAt.toDate() : new Date(sentAt);
        return date.toLocaleString('zh-TW');
      },
    },
    {
      title: '收件人',
      dataIndex: 'to',
      key: 'to',
      width: 200,
    },
    {
      title: '主旨',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
    },
    {
      title: '類型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const typeMap = {
          leave_request: { text: '請假申請', color: 'blue' },
          overtime_request: { text: '加班申請', color: 'orange' },
          test: { text: '測試郵件', color: 'purple' },
        };
        const typeInfo = typeMap[type] || { text: type, color: 'default' };
        return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
      },
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag 
          color={status === 'sent' ? 'green' : 'red'}
          icon={status === 'sent' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {status === 'sent' ? '成功' : '失敗'}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Card title={
        <Space>
          <MailOutlined />
          郵件服務設定
        </Space>
      }>
        <Alert
          message="設定說明"
          description={
            <div>
              <p>1. 需要先建立 Google App Script 郵件服務並部署為 Web 應用程式</p>
              <p>2. 將 Google App Script ID 設定在環境變數 VITE_GAS_SCRIPT_ID 中</p>
              <p>3. 在下方填入寄件者資訊並進行測試</p>
              <p>4. 設定完成後，系統會在用戶提交請假或加班申請時自動發送郵件給其直屬主管</p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="senderName"
            label="寄件人名稱"
            rules={[{ required: true, message: '請輸入寄件人名稱' }]}
          >
            <Input placeholder="例如：出勤管理系統" />
          </Form.Item>

          <Form.Item
            name="senderEmail"
            label="寄件人信箱"
            rules={[
              { required: true, message: '請輸入寄件人信箱' },
              { type: 'email', message: '請輸入有效的郵件地址' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="noreply@company.com"
            />
          </Form.Item>

          <Form.Item
            name="adminEmail"
            label="管理員信箱（用於測試）"
            rules={[
              { required: true, message: '請輸入管理員信箱' },
              { type: 'email', message: '請輸入有效的郵件地址' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="admin@company.com"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="說明"
          >
            <TextArea
              rows={3}
              placeholder="郵件服務相關說明（選填）"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
              >
                儲存設定
              </Button>
              <Button 
                onClick={handleTest}
                loading={testLoading}
                icon={<SendOutlined />}
              >
                發送測試郵件
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={
          <Space>
            <MailOutlined />
            郵件發送記錄
          </Space>
        }
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadEmailLogs}
            loading={logsLoading}
          >
            重新載入
          </Button>
        }
        style={{ marginTop: 24 }}
      >
        <Table
          columns={logColumns}
          dataSource={emailLogs}
          rowKey="id"
          loading={logsLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 條，共 ${total} 條記錄`,
          }}
          locale={{
            emptyText: '暫無郵件發送記錄'
          }}
        />
      </Card>
    </div>
  );
};

export default EmailSettings;