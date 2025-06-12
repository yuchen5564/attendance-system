// 文件位置: src/utils/leaveTypeTableConfig.js

import React from 'react';
import { 
  Button, 
  Space, 
  Typography, 
  Tag,
  Tooltip,
  Popconfirm,
  Badge
} from 'antd';
import { 
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

// 生成請假假別表格欄位定義
export const createLeaveTypeColumns = (handleEditLeaveType, handleDeleteLeaveType) => [
  {
    title: '假別名稱',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => (
      <Space>
        <div 
          style={{ 
            width: '12px', 
            height: '12px', 
            backgroundColor: record.color || '#1890ff',
            borderRadius: '2px',
            flexShrink: 0
          }} 
        />
        <span style={{ fontWeight: record.isDefault ? 'bold' : 'normal' }}>
          {text}
        </span>
        {record.isDefault && <Tag color="blue" size="small">預設</Tag>}
      </Space>
    )
  },
  {
    title: '假別描述',
    dataIndex: 'description',
    key: 'description',
    render: (text) => (
      <span style={{ color: text ? 'inherit' : '#999' }}>
        {text || '無描述'}
      </span>
    ),
    ellipsis: true
  },
  {
    title: '年度天數',
    dataIndex: 'daysAllowed',
    key: 'daysAllowed',
    width: 100,
    render: (days) => (
      <Space>
        <CalendarOutlined style={{ color: '#1890ff' }} />
        <span>{days} 天</span>
      </Space>
    ),
    sorter: (a, b) => a.daysAllowed - b.daysAllowed
  },
  {
    title: '審核設定',
    dataIndex: 'requireApproval',
    key: 'requireApproval',
    width: 100,
    render: (requireApproval) => (
      <Tag color={requireApproval ? 'orange' : 'green'} size="small">
        {requireApproval ? '需要審核' : '免審核'}
      </Tag>
    ),
    filters: [
      { text: '需要審核', value: true },
      { text: '免審核', value: false }
    ],
    onFilter: (value, record) => record.requireApproval === value
  },
  {
    title: '狀態',
    dataIndex: 'isActive',
    key: 'isActive',
    width: 80,
    render: (isActive, record) => {
      if (record.isDefault) {
        return <Tag color="blue" size="small">系統預設</Tag>;
      }
      return (
        <Badge 
          status={isActive ? 'success' : 'default'} 
          text={isActive ? '啟用' : '停用'}
        />
      );
    },
    filters: [
      { text: '啟用', value: true },
      { text: '停用', value: false }
    ],
    onFilter: (value, record) => record.isActive === value
  },
  {
    title: '創建時間',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180,
    render: (date) => {
      if (!date) return '-';
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return (
        <Space direction="vertical" size={0}>
          <span>{dayjs(dateObj).format('YYYY-MM-DD')}</span>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {dayjs(dateObj).format('HH:mm:ss')}
          </Text>
        </Space>
      );
    },
    sorter: (a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateA - dateB;
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render: (_, record) => (
      <Space>
        <Tooltip title="編輯假別">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditLeaveType(record)}
            size="small"
            style={{ color: '#1890ff' }}
          />
        </Tooltip>
        {!record.isDefault ? (
          <Tooltip title="刪除假別">
            <Popconfirm
              title="確定要刪除此假別嗎？"
              description="此操作無法復原，請確認沒有員工正在使用此假別"
              onConfirm={() => handleDeleteLeaveType(record.id)}
              okText="確定"
              cancelText="取消"
              placement="left"
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        ) : (
          <Tooltip title="預設假別無法刪除">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              disabled
              size="small"
            />
          </Tooltip>
        )}
      </Space>
    )
  }
];