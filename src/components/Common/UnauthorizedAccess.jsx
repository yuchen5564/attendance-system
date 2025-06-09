// components/Common/UnauthorizedAccess.js
import React from 'react';
import { AlertCircle } from 'lucide-react';

function UnauthorizedAccess() {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center">
      <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">訪問受限</h2>
      <p className="text-gray-600">您沒有權限訪問此頁面</p>
    </div>
  );
}

export default UnauthorizedAccess;