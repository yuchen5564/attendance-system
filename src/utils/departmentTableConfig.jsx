// 文件位置: src/utils/departmentTableConfig.js

import React from 'react';
import { 
  Button, 
  Space, 
  Typography, 
  Tag,
  Tooltip,
  Popconfirm
} from 'antd';
import { 
  EditOutlined,
  DeleteOutlined,
  TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

// 生成部門表格欄位定義
export const createDepartmentColumns = (handleEditDepartment, handleDeleteDepartment) => [
  {
    title: '部門名稱',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => (
      <Space>
        <TeamOutlined style={{ color: '#1890ff' }} />
        <span style={{ fontWeight: record.isDefault ? 'bold' : 'normal' }}>
          {text}
        </span>
        {record.isDefault && <Tag color="blue" size="small">預設</Tag>}
      </Space>
    )
  },
  {
    title: '部門描述',
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
    }
  },
  {
    title: '狀態',
    key: 'status',
    width: 80,
    render: (_, record) => (
      <Tag color={record.isDefault ? 'blue' : 'green'} size="small">
        {record.isDefault ? '系統預設' : '正常'}
      </Tag>
    )
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render: (_, record) => (
      <Space>
        <Tooltip title="編輯部門">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditDepartment(record)}
            size="small"
            style={{ color: '#1890ff' }}
          />
        </Tooltip>
        {!record.isDefault ? (
          <Tooltip title="刪除部門">
            <Popconfirm
              title="確定要刪除此部門嗎？"
              description="此操作無法復原，請確認該部門下沒有員工"
              onConfirm={() => handleDeleteDepartment(record.id)}
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
          <Tooltip title="預設部門無法刪除">
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