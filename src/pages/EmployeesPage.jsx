import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Search, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../firebase/firestoreService';
import { authService } from '../firebase/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmployeeModal from '../components/EmployeeModal';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/config';
import toast from 'react-hot-toast';

const EmployeesPage = () => {
  const { userData, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // 使用分頁 Hook
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData,
    setCurrentPage,
    setItemsPerPage,
    resetToFirstPage
  } = usePagination(filteredEmployees, 20); // 預設每頁 20 筆

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm]);

  // 當搜尋結果改變時，重置到第一頁
  useEffect(() => {
    resetToFirstPage();
  }, [filteredEmployees.length, resetToFirstPage]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const users = await firestoreService.getAllUsers();
      setEmployees(users);
    } catch (error) {
      console.error('載入員工列表失敗:', error);
      toast.error('載入數據失敗');
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const filtered = employees.filter(employee => 
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  };

  const handleCreateEmployee = async (employeeData) => {
    try {
      await authService.createUser(employeeData);
      toast.success('員工創建成功');
      setShowModal(false);
      loadEmployees();
      // 移除跳轉邏輯，保持在員工管理頁面
    } catch (error) {
      console.error('創建員工失敗:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('此電子郵件已被使用');
      } else {
        toast.error('創建員工失敗');
      }
    }
  };

  const handleUpdateEmployee = async (employeeData) => {
    try {
      if (employeeData.password && employeeData.password.trim()) {
        // 如果管理員想要修改密碼，提示使用密碼重設功能
        toast.error('安全考量：無法直接修改用戶密碼。請使用密碼重設功能或請用戶自行修改密碼。');
        return;
      }

      await authService.updateUser(employeeData);
      toast.success('員工資料更新成功');
      setShowModal(false);
      setEditingEmployee(null);
      loadEmployees();
    } catch (error) {
      console.error('更新員工失敗:', error);
      toast.error('更新員工失敗');
    }
  };

  const handleResetPassword = async (employee) => {
    if (!window.confirm(`確定要發送密碼重設郵件給 ${employee.name} (${employee.email}) 嗎？`)) {
      return;
    }

    try {
      await sendPasswordResetEmail(auth, employee.email);
      toast.success(`密碼重設郵件已發送至 ${employee.email}`);
    } catch (error) {
      console.error('發送密碼重設郵件失敗:', error);
      toast.error('發送密碼重設郵件失敗');
    }
  };

  const handleDeleteEmployee = async (employee) => {
    if (!window.confirm(`確定要刪除員工 ${employee.name} 嗎？此操作無法復原。`)) {
      return;
    }

    try {
      await firestoreService.updateUser(employee.uid, { isActive: false });
      toast.success('員工已停用');
      loadEmployees();
    } catch (error) {
      console.error('刪除員工失敗:', error);
      toast.error('操作失敗');
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return '系統管理員';
      case 'manager': return '部門主管';
      case 'employee': return '一般員工';
      default: return role;
    }
  };

  const getStatusText = (isActive) => {
    return isActive ? '啟用' : '停用';
  };

  if (loading) {
    return <LoadingSpinner text="載入員工資料中..." />;
  }

  // 檢查權限
  if (!isAdmin && userData?.role !== 'manager') {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">權限不足</h2>
        <p className="text-gray-500">您沒有權限訪問員工管理功能</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>員工管理</h1>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            <Plus size={20} />
            新增員工
          </button>
        )}
      </div>

      {/* 搜尋框 */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜尋員工姓名、電子郵件、部門或職位..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
        </div>
      </div>

      {/* 員工列表 */}
      <div className="card">
        <div className="card-header">
          <h3>員工列表 ({totalItems} 人)</h3>
        </div>
        <div className="card-body">
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? '沒有找到符合條件的員工' : '暫無員工資料'}
              </p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>姓名</th>
                      <th>電子郵件</th>
                      <th>部門</th>
                      <th>職位</th>
                      <th>角色</th>
                      <th>工作時間</th>
                      <th>狀態</th>
                      {isAdmin && <th>操作</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((employee) => (
                      <tr key={employee.uid}>
                        <td className="font-medium">{employee.name}</td>
                        <td>{employee.email}</td>
                        <td>{employee.department || '-'}</td>
                        <td>{employee.position || '-'}</td>
                        <td>
                          <span className={`status-badge ${employee.role === 'admin' ? 'pending' : 'approved'}`}>
                            {getRoleText(employee.role)}
                          </span>
                        </td>
                        <td>
                          {employee.workingHours ? 
                            `${employee.workingHours.start} - ${employee.workingHours.end}` : 
                            '-'
                          }
                        </td>
                        <td>
                          <span className={`status-badge ${employee.isActive !== false ? 'active' : 'inactive'}`}>
                            {getStatusText(employee.isActive !== false)}
                          </span>
                        </td>
                        {isAdmin && (
                          <td>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingEmployee(employee);
                                  setShowModal(true);
                                }}
                                className="btn btn-outline btn-sm"
                                title="編輯"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleResetPassword(employee)}
                                className="btn btn-secondary btn-sm"
                                title="重設密碼"
                              >
                                <RotateCcw size={16} />
                              </button>
                              {employee.isActive !== false && (
                                <button
                                  onClick={() => handleDeleteEmployee(employee)}
                                  className="btn btn-danger btn-sm"
                                  title="停用"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分頁組件 */}
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </>
          )}
        </div>
      </div>

      {/* 員工編輯彈窗 */}
      {showModal && (
        <EmployeeModal
          employee={editingEmployee}
          onClose={() => {
            setShowModal(false);
            setEditingEmployee(null);
          }}
          onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}
        />
      )}
    </div>
  );
};

export default EmployeesPage;