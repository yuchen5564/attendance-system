// 文件位置: src/components/settings/DepartmentModal.jsx

import React from 'react';
import { 
  Modal,
  Form, 
  Input, 
  Button, 
  Space, 
  Typography, 
  Alert
} from 'antd';
import { 
  SaveOutlined, 
  TeamOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const DepartmentModal = ({
  visible,
  editingDepartment,
  form,
  onSubmit,
  onCancel
}) => {
  return (
    <Modal
      title={
        <Space>
          <TeamOutlined />
          {editingDepartment ? '編輯部門' : '新增部門'}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        autoComplete="off"
      >
        <Alert
          message={editingDepartment ? "編輯部門資訊" : "新增部門"}
          description={
            editingDepartment 
              ? "修改部門的基本資訊，變更會立即生效。"
              : "新增一個部門到組織架構中，新增後可在用戶管理中選擇此部門。"
          }
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
        />

        <Form.Item
          name="name"
          label="部門名稱"
          rules={[
            { required: true, message: '請輸入部門名稱' },
            { max: 50, message: '部門名稱不能超過50個字元' },
            { pattern: /^[a-zA-Z0-9\u4e00-\u9fa5\s]+$/, message: '部門名稱只能包含中文、英文、數字和空格' }
          ]}
        >
          <Input 
            placeholder="請輸入部門名稱，例如：人力資源部、資訊部" 
            prefix={<TeamOutlined />}
            showCount
            maxLength={50}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="部門描述"
          rules={[
            { max: 200, message: '部門描述不能超過200個字元' }
          ]}
        >
          <Input.TextArea
            placeholder="請輸入部門描述，說明部門的主要職責和功能（選填）"
            rows={4}
            showCount
            maxLength={200}
          />
        </Form.Item>

        <div style={{ 
          background: '#f9f9f9', 
          padding: '12px', 
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <Space direction="vertical" size={2}>
              <div>💡 <strong>使用提示：</strong></div>
              <div>• 部門名稱建議使用公司正式的組織名稱</div>
              <div>• 新增的部門會立即在用戶管理中可選</div>
              <div>• 預設部門無法刪除，但可以編輯描述</div>
            </Space>
          </Text>
        </div>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onCancel}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              {editingDepartment ? '更新部門' : '新增部門'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DepartmentModal;