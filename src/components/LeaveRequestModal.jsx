// 文件位置: src/components/LeaveRequestModal.jsx

import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Select, 
  DatePicker, 
  Input, 
  Alert, 
  Space, 
  Button,
  App,
  Tag,
  Spin,
  Typography
} from 'antd';
import { CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const LeaveRequestModal = ({ onClose, onSubmit }) => {
  const { getLeaveTypes } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [leaveTypesLoading, setLeaveTypesLoading] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const { message } = App.useApp();

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  const loadLeaveTypes = async () => {
    try {
      setLeaveTypesLoading(true);
      const types = await getLeaveTypes();
      // 只顯示啟用的假別
      const activeTypes = types.filter(leaveType => leaveType.isActive);
      setLeaveTypes(activeTypes);
    } catch (error) {
      console.error('載入請假假別失敗:', error);
      message.error('載入請假假別失敗');
      // 設定預設假別作為備案
      setLeaveTypes([
        { id: 'annual', name: '特休', daysAllowed: 14, color: '#52c41a' },
        { id: 'sick', name: '病假', daysAllowed: 30, color: '#fa8c16' },
        { id: 'personal', name: '事假', daysAllowed: 7, color: '#1890ff' }
      ]);
    } finally {
      setLeaveTypesLoading(false);
    }
  };

  const calculateDays = (dates) => {
    if (!dates || dates.length !== 2) return 0;
    
    const [start, end] = dates;
    const diffDays = end.diff(start, 'day') + 1; // 包含開始和結束日
    
    return diffDays;
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  const handleLeaveTypeChange = (value) => {
    const selectedType = leaveTypes.find(leaveType => leaveType.id === value);
    setSelectedLeaveType(selectedType);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const requestedDays = calculateDays(values.dateRange);
      const selectedType = leaveTypes.find(leaveType => leaveType.id === values.type);
      
      // 檢查請假天數是否超過限制
      if (selectedType && selectedType.daysAllowed > 0 && requestedDays > selectedType.daysAllowed) {
        message.error(`${selectedType.name}年度可請天數為${selectedType.daysAllowed}天，您申請了${requestedDays}天，已超出限制`);
        return;
      }

      const submitData = {
        type: values.type,
        typeName: selectedType?.name || values.type,
        typeColor: selectedType?.color || '#1890ff',
        startDate: values.dateRange[0].toDate(),
        endDate: values.dateRange[1].toDate(),
        reason: values.reason,
        days: requestedDays,
        requireApproval: selectedType?.requireApproval !== false
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('提交請假申請失敗:', error);
      message.error('提交失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current) => {
    // 不能選擇過去的日期
    return current && current < dayjs().startOf('day');
  };

  const getDaysExceeded = () => {
    if (!dateRange || !selectedLeaveType || selectedLeaveType.daysAllowed === 0) return false;
    const requestedDays = calculateDays(dateRange);
    return requestedDays > selectedLeaveType.daysAllowed;
  };

  return (
    <Modal
      title={
        <Space>
          <CalendarOutlined />
          新增請假申請
        </Space>
      }
      open={true}
      onCancel={onClose}
      footer={null}
      width={500}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        preserve={false}
      >
        <Form.Item
          name="type"
          label="請假類型"
          rules={[{ required: true, message: '請選擇請假類型' }]}
        >
          <Select 
            placeholder="請選擇請假類型"
            loading={leaveTypesLoading}
            onChange={handleLeaveTypeChange}
            notFoundContent={leaveTypesLoading ? <Spin size="small" /> : '無可用假別'}
          >
            {leaveTypes.map(leaveType => (
              <Option key={leaveType.id} value={leaveType.id}>
                <Space>
                  <div 
                    style={{ 
                      width: '8px', 
                      height: '8px', 
                      backgroundColor: leaveType.color || '#1890ff',
                      borderRadius: '50%',
                      flexShrink: 0
                    }} 
                  />
                  <span>{leaveType.name}</span>
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    ({leaveType.daysAllowed > 0 ? `${leaveType.daysAllowed}天/年` : '無限制'})
                  </Text>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedLeaveType && (
          <Alert
            message="假別資訊"
            description={
              <Space direction="vertical" size={4}>
                <div>
                  <strong>假別說明：</strong>{selectedLeaveType.description || '無說明'}
                </div>
                <div>
                  <strong>年度額度：</strong>
                  {selectedLeaveType.daysAllowed > 0 ? `${selectedLeaveType.daysAllowed} 天` : '無限制'}
                </div>
                <div>
                  <strong>審核方式：</strong>
                  <Tag color={selectedLeaveType.requireApproval ? 'orange' : 'green'} size="small">
                    {selectedLeaveType.requireApproval ? '需要主管審核' : '免審核'}
                  </Tag>
                </div>
              </Space>
            }
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        <Form.Item
          name="dateRange"
          label="請假日期"
          rules={[{ required: true, message: '請選擇請假日期' }]}
        >
          <RangePicker
            style={{ width: '100%' }}
            placeholder={['開始日期', '結束日期']}
            disabledDate={disabledDate}
            onChange={handleDateChange}
          />
        </Form.Item>

        {dateRange && dateRange.length === 2 && (
          <Alert
            message={
              <Space>
                <FileTextOutlined />
                {`請假天數：${calculateDays(dateRange)} 天`}
                {getDaysExceeded() && (
                  <Tag color="red" size="small">超出年度額度</Tag>
                )}
              </Space>
            }
            type={getDaysExceeded() ? "warning" : "info"}
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        <Form.Item
          name="reason"
          label="請假原因"
          rules={[{ required: true, message: '請填寫請假原因' }]}
        >
          <TextArea
            rows={4}
            placeholder="請詳細說明請假原因..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        {/* 假別列表提示 */}
        {leaveTypes.length === 0 && !leaveTypesLoading && (
          <Alert
            message="提醒"
            description="目前沒有可用的請假假別，請聯繫管理員在系統設定中新增假別。"
            type="warning"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>
              取消
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              disabled={getDaysExceeded()}
            >
              提交申請
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LeaveRequestModal;