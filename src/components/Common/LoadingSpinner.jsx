// src/components/Common/LoadingSpinner.js
import React from 'react';
import { Clock } from 'lucide-react';

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <Clock className="h-16 w-16 text-blue-600 animate-pulse mx-auto mb-4" />
          <div className="absolute inset-0 h-16 w-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">載入中...</h2>
        <p className="text-gray-500">正在初始化系統</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;