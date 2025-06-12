// 文件位置: src/components/settings/DepartmentManagement.jsx

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
  Alert
} from 'antd';
import { 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined
} from '@ant-design/icons';
import Pagination from '../Pagination';
import dayjs from 'dayjs';

const { Text } = Typography;

const DepartmentManagement = ({
  departments,
  paginatedDepartments,
  currentPage,
  itemsPerPage,
  totalItems,
  setCurrentPage,
  setItemsPerPage,
  handleAddDepartment,
  handleEditDepartment,
  handleDeleteDepartment,
  departmentColumns
}) => {
  return (
    <div>
      <Card 
        title={
          <Space>
            <TeamOutlined />
            部門管理
            <Tag color="blue">{totalItems} 個部門</Tag>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddDepartment}
          >
            新增部門
          </Button>
        }
      >
        <Alert
          message="部門管理說明"
          description="在此管理公司的組織架構，所有部門資訊會同步到用戶管理中。預設部門無法刪除，但可以編輯描述。"
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />

        <Table
          dataSource={paginatedDepartments}
          columns={departmentColumns}
          rowKey="id"
          size="middle"
          pagination={false}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="尚未設定任何部門"
                style={{ margin: '40px 0' }}
              >
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleAddDepartment}
                >
                  新增第一個部門
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

export default DepartmentManagement;