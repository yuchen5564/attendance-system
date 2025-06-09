// components/Leave/LeaveApplicationModal.js
import React, { useState } from 'react';

function LeaveApplicationModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    type: 'personal',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const days = calculateDays();
    if (days <= 0) {
      alert('請選擇正確的日期');
      return;
    }
    
    if (!formData.reason.trim()) {
      alert('請輸入請假原因');
      return;
    }
    
    // 檢查結束日期不能早於開始日期
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert('結束日期不能早於開始日期');
      return;
    }
    
    onSubmit({ ...formData, days });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">申請請假</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              請假類型 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="personal">事假</option>
              <option value="sick">病假</option>
              <option value="annual">年假</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]} // 不能選擇過去的日期
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                結束日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>
          
          {formData.startDate && formData.endDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="text-sm text-blue-800">
                <strong>請假天數: {calculateDays()} 天</strong>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                從 {formData.startDate} 到 {formData.endDate}
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              請假原因 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="請詳細說明請假原因..."
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              提交申請
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeaveApplicationModal;