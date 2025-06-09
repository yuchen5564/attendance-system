import React from 'react';
import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

const LoadingSpinner = ({ size = 'large', text = '載入中...' }) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : 24 }} spin />;

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        padding: '32px',
      }}
    >
      <Spin indicator={antIcon} size={size} />
      {text && (
        <Text 
          type="secondary" 
          style={{ 
            marginTop: '16px',
            fontSize: '14px',
          }}
        >
          {text}
        </Text>
      )}
    </div>
  );
};

export default LoadingSpinner;