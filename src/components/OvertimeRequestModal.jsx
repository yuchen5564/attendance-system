import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  DatePicker, 
  Input, 
  Alert, 
  Space, 
  Button,
  App,
  TimePicker,
  Typography
} from 'antd';
import { ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

const OvertimeRequestModal = ({ onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState([null, null]);
  const { message } = App.useApp();

  const calculateHours = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    
    const diffMinutes = endTime.diff(startTime, 'minute');
    const hours = Math.round((diffMinutes / 60) * 10) / 10; // 四捨五入到小數點第一位
    
    return Math.max(0, hours); // 確保不會是負數
  };

  const handleTimeChange = (times) => {
    setTimeRange(times);
    if (times && times.length === 2) {
      const hours = calculateHours(times[0], times[1]);
      form.setFieldValue('hours', hours);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const overtimeHours = calculateHours(values.timeRange[0], values.timeRange[1]);
      
      if (overtimeHours <= 0) {
        message.error('加班時間必須大於0小時');
        return;
      }

      const submitData = {
        date: values.date.toDate(),
        startTime: values.timeRange[0].format('HH:mm'),
        endTime: values.timeRange[1].format('HH:mm'),
        hours: overtimeHours,
        reason: values.reason
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('提交加班申請失敗:', error);
      message.error('提交失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current) => {
    // 不允許選擇未來超過30天的日期
    return current && current > dayjs().add(30, 'day');
  };

  const getHoursDisplay = () => {
    if (!timeRange || timeRange.length !== 2 || !timeRange[0] || !timeRange[1]) {
      return 0;
    }
    return calculateHours(timeRange[0], timeRange[1]);
  };

  return (
    <Modal
      title={
        <Space>
          <ClockCircleOutlined />
          新增加班申請
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
          name="date"
          label="加班日期"
          rules={[{ required: true, message: '請選擇加班日期' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            placeholder="選擇加班日期"
            disabledDate={disabledDate}
            format="YYYY-MM-DD"
          />
        </Form.Item>

        <Form.Item
          name="timeRange"
          label="加班時間"
          rules={[{ required: true, message: '請選擇加班時間' }]}
        >
          <TimePicker.RangePicker
            style={{ width: '100%' }}
            placeholder={['開始時間', '結束時間']}
            format="HH:mm"
            onChange={handleTimeChange}
            minuteStep={15}
          />
        </Form.Item>

        {timeRange && timeRange.length === 2 && timeRange[0] && timeRange[1] && (
          <Alert
            message={
              <Space>
                <FileTextOutlined />
                {`加班時數：${getHoursDisplay()} 小時`}
              </Space>
            }
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        <Form.Item
          name="reason"
          label="加班原因"
          rules={[{ required: true, message: '請填寫加班原因' }]}
        >
          <TextArea
            rows={4}
            placeholder="請詳細說明加班原因..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Alert
          message="提醒"
          description="提交加班申請後需要主管審核批准。請確保填寫的時間和原因正確無誤。"
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

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

export default OvertimeRequestModal;