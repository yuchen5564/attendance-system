import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  Select, 
  DatePicker, 
  Input, 
  Alert, 
  Space, 
  Button,
  App
} from 'antd';
import { CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const LeaveRequestModal = ({ onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const { message } = App.useApp();

  const leaveTypes = [
    { value: 'annual', label: '年假' },
    { value: 'sick', label: '病假' },
    { value: 'personal', label: '事假' },
    { value: 'maternity', label: '產假' },
    { value: 'paternity', label: '陪產假' },
    { value: 'funeral', label: '喪假' },
    { value: 'marriage', label: '婚假' },
    { value: 'other', label: '其他' }
  ];

  const calculateDays = (dates) => {
    if (!dates || dates.length !== 2) return 0;
    
    const [start, end] = dates;
    const diffDays = end.diff(start, 'day') + 1; // 包含開始和結束日
    
    return diffDays;
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const submitData = {
        type: values.type,
        startDate: values.dateRange[0].toDate(),
        endDate: values.dateRange[1].toDate(),
        reason: values.reason,
        days: calculateDays(values.dateRange)
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
          <Select placeholder="請選擇請假類型">
            {leaveTypes.map(type => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

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
              </Space>
            }
            type="info"
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
              提交申請
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LeaveRequestModal;