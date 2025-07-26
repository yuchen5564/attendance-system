// 文件位置: src/components/settings/LeaveTypeModal.jsx

import React from 'react';
import { 
  Modal,
  Form, 
  Input, 
  InputNumber,
  Switch,
  Button, 
  Space, 
  Typography, 
  Alert,
  Row,
  Col
} from 'antd';
import { 
  SaveOutlined, 
  CalendarOutlined
} from '@ant-design/icons';

const { Text } = Typography;

// 預設顏色選項
const COLOR_OPTIONS = [
  { label: '藍色', value: '#1890ff' },
  { label: '綠色', value: '#52c41a' },
  { label: '橙色', value: '#fa8c16' },
  { label: '紅色', value: '#ff4d4f' },
  { label: '紫色', value: '#722ed1' },
  { label: '青色', value: '#13c2c2' },
  { label: '粉色', value: '#eb2f96' },
  { label: '黃色', value: '#fadb14' },
];

const LeaveTypeModal = ({
  visible,
  editingLeaveType,
  form,
  onSubmit,
  onCancel
}) => {
  return (
    <Modal
      title={
        <Space>
          <CalendarOutlined />
          {editingLeaveType ? '編輯請假假別' : '新增請假假別'}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width="90%"
      style={{ maxWidth: '600px', minWidth: '320px' }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        autoComplete="off"
        initialValues={{
          daysAllowed: 0,
          requireApproval: true,
          color: '#1890ff',
          isActive: true
        }}
      >
        <Alert
          message={editingLeaveType ? "編輯假別資訊" : "新增假別"}
          description={
            editingLeaveType 
              ? "修改假別的設定資訊，變更會立即生效。"
              : "新增一個假別到請假制度中，新增後可在請假申請中選擇此假別。"
          }
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
        />

        <Row gutter={[16, 16]} style={{ display: 'flex', flexWrap: 'wrap' }}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="name"
              label="假別名稱"
              rules={[
                { required: true, message: '請輸入假別名稱' },
                { max: 30, message: '假別名稱不能超過30個字元' },
                { pattern: /^[a-zA-Z0-9\u4e00-\u9fa5\s]+$/, message: '假別名稱只能包含中文、英文、數字和空格' }
              ]}
            >
              <Input 
                placeholder="請輸入假別名稱，例如：年假、病假" 
                prefix={<CalendarOutlined />}
                showCount
                maxLength={30}
                size="large"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="daysAllowed"
              label="年度可請天數"
              rules={[
                { required: true, message: '請設定年度可請天數' },
                { type: 'number', min: 0, max: 365, message: '天數範圍為 0-365 天' }
              ]}
            >
              <InputNumber
                placeholder="0"
                style={{ width: '100%' }}
                min={0}
                max={365}
                addonAfter="天"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="假別描述"
          rules={[
            { max: 200, message: '假別描述不能超過200個字元' }
          ]}
        >
          <Input.TextArea
            placeholder="請輸入假別描述，說明此假別的用途和規則（選填）"
            rows={3}
            showCount
            maxLength={200}
            style={{ fontSize: '16px' }}
          />
        </Form.Item>

        <Row gutter={[16, 16]} style={{ display: 'flex', flexWrap: 'wrap' }}>
          <Col xs={24} sm={8}>
            <Form.Item
              name="requireApproval"
              label="需要主管審核"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="需要" 
                unCheckedChildren="不需要"
                size="default"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="isActive"
              label="啟用狀態"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="啟用" 
                unCheckedChildren="停用"
                size="default"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="color"
              label="顯示顏色"
              rules={[{ required: true, message: '請選擇顯示顏色' }]}
            >
              <select
                style={{
                  width: '100%',
                  height: '40px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '16px'
                }}
              >
                {COLOR_OPTIONS.map(color => (
                  <option key={color.value} value={color.value} style={color.value ? { backgroundColor: color.value, color: '#fff' } : {}}>
                    {color.label}
                  </option>
                ))}
              </select>
            </Form.Item>
          </Col>
        </Row>

        <div style={{ 
          background: '#f9f9f9', 
          padding: '12px', 
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <Space direction="vertical" size={2}>
              <div>💡 <strong>設定說明：</strong></div>
              <div>• 年度可請天數：員工每年可以請此類假別的最大天數</div>
              <div>• 需要審核：是否需要主管批准才能請假</div>
              <div>• 啟用狀態：停用的假別不會在請假申請中顯示</div>
              <div>• 顯示顏色：在日曆和報表中區分不同假別的顏色</div>
            </Space>
          </Text>
        </div>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onCancel}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              {editingLeaveType ? '更新假別' : '新增假別'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LeaveTypeModal;