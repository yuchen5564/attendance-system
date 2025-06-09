// components/Employee/EmployeeModal.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function EmployeeModal({ employee, onClose, onSave }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    department: employee?.department || (user.role === 'manager' ? user.department : ''),
    role: employee?.role || 'employee',
    workHours: employee?.workHours || { start: '09:00', end: '18:00' }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 基本驗證
    if (!formData.name.trim()) {
      alert('請輸入姓名');
      return;
    }
    
    if (!formData.email.trim()) {
      alert('請輸入信箱');
      return;
    }
    
    if (!formData.department.trim()) {
      alert('請輸入部門');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {employee ? '編輯員工' : '新增員工'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              信箱 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              部門 <span className="text-red-500">*</span>
            </label>
            {user.role === 'manager' ? (
              <input
                type="text"
                value={formData.department}
                disabled
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500"
              />
            ) : (
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={user.role === 'manager'} // 主管不能設定主管角色
            >
              <option value="employee">員工</option>
              {user.role === 'admin' && (
                <>
                  <option value="manager">主管</option>
                  <option value="admin">管理員</option>
                </>
              )}
            </select>
            {user.role === 'manager' && (
              <p className="text-xs text-gray-500 mt-1">主管只能新增員工角色</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">上班時間</label>
              <input
                type="time"
                value={formData.workHours.start}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  workHours: { ...prev.workHours, start: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">下班時間</label>
              <input
                type="time"
                value={formData.workHours.end}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  workHours: { ...prev.workHours, end: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
              儲存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployeeModal;