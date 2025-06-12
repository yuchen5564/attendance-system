// 文件位置: src/components/settings/GeneralSettings.jsx

import React from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Switch, 
  TimePicker, 
  InputNumber, 
  Button, 
  Space, 
  Typography, 
  Row, 
  Col, 
  Alert, 
  Divider,
  Tag,
  Popconfirm,
  App
} from 'antd';
import { 
  SaveOutlined, 
  ClockCircleOutlined, 
  HomeOutlined,
  BellOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const GeneralSettings = ({ form, handleSave, handleReset, saving }) => {
  const { message } = App.useApp();

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
      autoComplete="off"
    >
      <Row gutter={[24, 24]}>
        {/* 公司資訊 */}
        <Col span={24}>
          <Card 
            title={
              <Space>
                <HomeOutlined />
                公司資訊
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="companyName"
                  label="公司名稱"
                  rules={[{ required: true, message: '請輸入公司名稱' }]}
                >
                  <Input placeholder="請輸入公司名稱" />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="companyPhone"
                  label="聯絡電話"
                >
                  <Input placeholder="請輸入聯絡電話" />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="companyAddress"
                  label="公司地址"
                >
                  <Input placeholder="請輸入公司地址" />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="companyEmail"
                  label="聯絡信箱"
                  rules={[{ type: 'email', message: '請輸入有效的電子郵件格式' }]}
                >
                  <Input placeholder="請輸入聯絡信箱" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 工作時間設定 */}
        <Col span={24}>
          <Card 
            title={
              <Space>
                <ClockCircleOutlined />
                工作時間設定
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="defaultWorkingHours"
                  label="預設工作時間"
                  rules={[{ required: true, message: '請設定工作時間' }]}
                >
                  <TimePicker.RangePicker
                    format="HH:mm"
                    placeholder={['上班時間', '下班時間']}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="flexibleWorkingHours"
                  label="彈性工時"
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="啟用" 
                    unCheckedChildren="停用"
                  />
                </Form.Item>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  啟用後員工可以在允許範圍內彈性調整工作時間
                </Text>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 打卡設定 */}
        <Col span={24}>
          <Card 
            title={
              <Space>
                <ClockCircleOutlined />
                打卡設定
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="allowEarlyClockIn"
                  label="允許提前打卡 (分鐘)"
                >
                  <InputNumber
                    min={0}
                    max={120}
                    style={{ width: '100%' }}
                    placeholder="30"
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item
                  name="allowLateClockOut"
                  label="允許延後打卡 (分鐘)"
                >
                  <InputNumber
                    min={0}
                    max={120}
                    style={{ width: '100%' }}
                    placeholder="30"
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item
                  name="autoClockOut"
                  label="自動下班打卡"
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="啟用" 
                    unCheckedChildren="停用"
                  />
                </Form.Item>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  超過下班時間自動記錄下班打卡
                </Text>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 請假設定 */}
        <Col span={24}>
          <Card title="請假設定">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="requireApproval"
                  label="需要主管審核"
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="需要" 
                    unCheckedChildren="不需要"
                  />
                </Form.Item>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  所有請假申請需要主管批准
                </Text>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item
                  name="maxAdvanceDays"
                  label="最大提前申請天數"
                >
                  <InputNumber
                    min={1}
                    max={365}
                    style={{ width: '100%' }}
                    placeholder="30"
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item
                  name="allowSameDay"
                  label="允許當日請假"
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="允許" 
                    unCheckedChildren="不允許"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 通知設定 */}
        <Col span={24}>
          <Card 
            title={
              <Space>
                <BellOutlined />
                通知設定
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="emailNotifications"
                  label="電子郵件通知"
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="啟用" 
                    unCheckedChildren="停用"
                  />
                </Form.Item>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  發送重要事件的電子郵件通知
                </Text>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item
                  name="reminderTime"
                  label="每日提醒時間"
                >
                  <TimePicker
                    format="HH:mm"
                    style={{ width: '100%' }}
                    placeholder="08:30"
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item
                  name="weekendReminders"
                  label="週末提醒"
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="啟用" 
                    unCheckedChildren="停用"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 系統資訊 */}
        <Col span={24}>
          <Card title="系統資訊">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <div>
                  <Text strong>系統版本</Text>
                  <div><Tag color="blue">v2.0.0</Tag></div>
                </div>
              </Col>
              
              <Col xs={24} md={6}>
                <div>
                  <Text strong>最後更新</Text>
                  <div><Text type="secondary">{dayjs().format('YYYY-MM-DD')}</Text></div>
                </div>
              </Col>
              
              <Col xs={24} md={6}>
                <div>
                  <Text strong>資料庫狀態</Text>
                  <div><Tag color="green">正常</Tag></div>
                </div>
              </Col>
              
              <Col xs={24} md={6}>
                <div>
                  <Text strong>備份狀態</Text>
                  <div><Tag color="green">已啟用</Tag></div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 危險操作 */}
        <Col span={24}>
          <Card 
            title={
              <Space>
                <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                <span style={{ color: '#ff4d4f' }}>危險操作</span>
              </Space>
            }
          >
            <Alert
              message="警告"
              description="以下操作可能會影響系統正常運作，請謹慎使用。"
              type="warning"
              showIcon
              style={{ marginBottom: '24px' }}
            />

            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>清除所有打卡記錄</Text>
                  <div>
                    <Text type="secondary">這將永久刪除所有員工的打卡記錄</Text>
                  </div>
                </div>
                <Popconfirm
                  title="確定要清除所有打卡記錄嗎？"
                  description="此操作無法復原！"
                  onConfirm={() => message.error('此功能暫未實作')}
                  okText="確定"
                  cancelText="取消"
                >
                  <Button danger size="small">
                    清除記錄
                  </Button>
                </Popconfirm>
              </div>

              <Divider style={{ margin: '16px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>重置系統設定</Text>
                  <div>
                    <Text type="secondary">將所有設定恢復為預設值</Text>
                  </div>
                </div>
                <Popconfirm
                  title="確定要重置所有系統設定嗎？"
                  onConfirm={handleReset}
                  okText="確定"
                  cancelText="取消"
                >
                  <Button danger size="small">
                    重置設定
                  </Button>
                </Popconfirm>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Form>
  );
};

export default GeneralSettings;