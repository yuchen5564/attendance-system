import React from 'react';
import { Pagination as AntPagination, Select, Space, Typography } from 'antd';

const { Text } = Typography;
const { Option } = Select;

const Pagination = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange,
  showItemsPerPage = true 
}) => {
  const itemsPerPageOptions = [10, 25, 50, 100];

  if (totalItems === 0) {
    return null;
  }

  return (
    <div 
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '24px',
        padding: '16px 0',
        borderTop: '1px solid #f0f0f0',
      }}
    >
      <div>
        {showItemsPerPage && (
          <Space>
            <Text>每頁顯示：</Text>
            <Select
              value={itemsPerPage}
              onChange={onItemsPerPageChange}
              style={{ width: 80 }}
              size="small"
            >
              {itemsPerPageOptions.map(option => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
            <Text type="secondary">條記錄</Text>
          </Space>
        )}
      </div>

      <AntPagination
        current={currentPage}
        total={totalItems}
        pageSize={itemsPerPage}
        onChange={onPageChange}
        showSizeChanger={false}
        showQuickJumper
        showTotal={(total, range) =>
          `第 ${range[0]}-${range[1]} 條，共 ${total} 條記錄`
        }
        size="default"
      />
    </div>
  );
};

export default Pagination;