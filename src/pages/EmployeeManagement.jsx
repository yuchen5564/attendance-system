// pages/EmployeeManagement.js
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth, usePermissions } from '../contexts/AuthContext';
import { employeeService } from '../firebase/firestoreService';
import EmployeeModal from '../components/Employee/EmployeeModal';
import LoadingSpinner from '../components/Common/LoadingSpinner';

function EmployeeManagement() {
  const { user } = useAuth();
  const permissions = usePermissions();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  useEffect(() => {
    loadEmployees();
    
    // 設置實時監聽
    const unsubscribe = employeeService.listen((employeesData) => {
      const filteredEmployees = getFilteredEmployees(employeesData);
      setEmployees(filteredEmployees);
    });

    return () => unsubscribe();
  }, [user]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError('');

      let employeesData;
      if (permissions.canViewAllEmployees) {
        employeesData = await employeeService.getAll();
      } else if (permissions.canManageDepartmentEmployees) {
        employeesData = await employeeService.getByDepartment(user.department);
      } else {
        employeesData = [];
      }

      setEmployees(employeesData);
    } catch (error) {
      console.error('載入員工列表錯誤:', error);
      setError('載入員工列表失敗');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEmployees = (employeesData) => {
    if (permissions.canViewAllEmployees) {
      return employeesData;
    } else if (permissions.canManageDepartmentEmployees) {
      return employeesData.filter(emp => emp.department === user.department);
    }
    return [];
  };

  // 權限檢查
  if (!permissions.canViewAllEmployees && !permissions.canManageDepartmentEmployees) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-red-500 text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">訪問受限</h2>
        <p className="text-gray-600">您沒有權限訪問此頁面</p>
      </div>
    );
  }

  const handleDeleteEmployee = async (id, employeeName) => {
    // 主管不能刪除自己部門以外的員工
    if (user.role === 'manager') {
      const employee = employees.find(emp => emp.id === id);
      if (employee?.department !== user.department) {
        alert('您只能管理自己部門的員工');
        return;
      }
    }
    
    if (window.confirm(`確定要刪除員工 ${employeeName} 嗎？`)) {
      try {
        await employeeService.delete(id);
        // 本地狀態會通過監聽器自動更新
      } catch (error) {
        console.error('刪除員工錯誤:', error);
        alert('刪除員工失敗，請重試');
      }
    }
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      setError('');
      
      if (editingEmployee) {
        await employeeService.update(editingEmployee.id, employeeData);
      } else {
        await employeeService.create(employeeData);
      }
      
      setShowAddModal(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error('保存員工錯誤:', error);
      setError('保存員工失敗，請重試');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">
          {user.role === 'admin' ? '員工管理' : `${user.department} 部門員工管理`}
        </h2>
        {(permissions.canManageEmployees || permissions.canManageDepartmentEmployees) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 btn-animate"
          >
            <Plus className="h-4 w-4" />
            <span>新增員工</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* 員工列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-6 gap-4 font-medium text-gray-700">
            <div>姓名</div>
            <div>信箱</div>
            <div>部門</div>
            <div>角色</div>
            <div>上班時間</div>
            <div>操作</div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {employees.map(employee => (
            <div key={employee.id} className="px-6 py-4 grid grid-cols-6 gap-4 items-center table-row">
              <div className="font-medium text-gray-900">{employee.name}</div>
              <div className="text-gray-600">{employee.email}</div>
              <div className="text-gray-600">{employee.department}</div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  employee.role === 'manager' ? 'bg-purple-100 text-purple-800' : 
                  employee.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {employee.role === 'admin' ? '管理員' : 
                   employee.role === 'manager' ? '主管' : '員工'}
                </span>
              </div>
              <div className="text-gray-600">
                {employee.workHours?.start} - {employee.workHours?.end}
              </div>
              <div className="flex space-x-2">
                {(permissions.canManageEmployees || 
                  (permissions.canManageDepartmentEmployees && employee.department === user.department)) && (
                  <>
                    <button
                      onClick={() => setEditingEmployee(employee)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                      title="編輯"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                      title="刪除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {employees.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              暫無員工資料
            </div>
          )}
        </div>
      </div>

      {/* 新增/編輯員工Modal */}
      {(showAddModal || editingEmployee) && (
        <EmployeeModal
          employee={editingEmployee}
          onClose={() => {
            setShowAddModal(false);
            setEditingEmployee(null);
            setError('');
          }}
          onSave={handleSaveEmployee}
        />
      )}
    </div>
  );
}

export default EmployeeManagement;