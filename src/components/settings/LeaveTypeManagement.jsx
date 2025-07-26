// 文件位置: src/components/settings/LeaveTypeManagement.jsx

import React from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Tag,
  Empty,
  Table,
  Tooltip,
  Popconfirm,
  Alert,
  Badge
} from 'antd';
import { 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import Pagination from '../Pagination';
import dayjs from 'dayjs';

const { Text } = Typography;

const LeaveTypeManagement = ({
  leaveTypes,
  paginatedLeaveTypes,
  currentPage,
  itemsPerPage,
  totalItems,
  setCurrentPage,
  setItemsPerPage,
  handleAddLeaveType,
  handleEditLeaveType,
  handleDeleteLeaveType,
  leaveTypeColumns
}) => {
  return (
    <div>
      <Card 
        title={
          <Space size={window.innerWidth < 768 ? 'small' : 'middle'}>
            <CalendarOutlined />
            <span style={{ fontSize: window.innerWidth < 768 ? '14px' : '16px' }}>
              請假假別管理
            </span>
            <Tag color="blue" style={{ fontSize: window.innerWidth < 768 ? '12px' : '14px' }}>
              {totalItems} 個假別
            </Tag>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddLeaveType}
            size={window.innerWidth < 768 ? 'large' : 'middle'}
          >
            {window.innerWidth < 480 ? '新增' : '新增假別'}
          </Button>
        }
      >
        <Alert
          message="請假假別管理說明"
          description="在此管理公司的請假制度，所有假別資訊會同步到請假申請中。預設假別無法刪除，但可以編輯設定。"
          type="info"
          showIcon
          style={{ 
            marginBottom: '16px',
            fontSize: window.innerWidth < 768 ? '12px' : '14px'
          }}
        />

        <Table
          dataSource={paginatedLeaveTypes}
          columns={leaveTypeColumns}
          rowKey="id"
          size={window.innerWidth < 768 ? "small" : "middle"}
          pagination={false}
          scroll={{ x: true }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="尚未設定任何請假假別"
                style={{ margin: window.innerWidth < 768 ? '20px 0' : '40px 0' }}
              >
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleAddLeaveType}
                  size={window.innerWidth < 768 ? 'large' : 'middle'}
                >
                  新增第一個假別
                </Button>
              </Empty>
            )
          }}
        />

        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            showItemsPerPage={true}
          />
        )}
      </Card>
    </div>
  );
};

export default LeaveTypeManagement;