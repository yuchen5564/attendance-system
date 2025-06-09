// pages/LeaveManagement.js
import React, { useState, useEffect } from 'react';
import { Plus, Eye, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import { useAuth, usePermissions } from '../contexts/AuthContext';
import { employeeService, leaveService } from '../firebase/firestoreService';
import LeaveApplicationModal from '../components/Leave/LeaveApplicationModal';
import LoadingSpinner from '../components/Common/LoadingSpinner';

function LeaveManagement() {
  const { user } = useAuth();
  const permissions = usePermissions();
  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    loadData();
    
    // 設置實時監聽
    const unsubscribe = leaveService.listen((leavesData) => {
      const filteredLeaves = getFilteredLeaves(leavesData);
      setLeaveRequests(filteredLeaves);
    });

    return () => unsubscribe();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // 載入員工和請假記錄
      const [employeesData, leavesData] = await Promise.all([
        loadEmployees(),
        leaveService.getAll()
      ]);

      setEmployees(employeesData);
      const filteredLeaves = getFilteredLeaves(leavesData);
      setLeaveRequests(filteredLeaves);

    } catch (error) {
      console.error('載入請假記錄錯誤:', error);
      setError('載入請假記錄失敗');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    if (permissions.canReviewAllLeaves) {
      return await employeeService.getAll();
    } else if (permissions.canReviewDepartmentLeaves) {
      return await employeeService.getByDepartment(user.department);
    } else if (permissions.canViewOwnLeaves) {
      const allEmployees = await employeeService.getAll();
      return allEmployees.filter(emp => emp.employeeId === user.employeeId);
    }
    return [];
  };

  const getFilteredLeaves = (leavesData) => {
    if (permissions.canReviewAllLeaves) {
      return leavesData;
    } else if (permissions.canReviewDepartmentLeaves) {
      const departmentEmployeeIds = employees
        .filter(emp => emp.department === user.department)
        .map(emp => emp.id);
      return leavesData.filter(leave => 
        departmentEmployeeIds.includes(leave.employeeId)
      );
    } else if (permissions.canViewOwnLeaves) {
      return leavesData.filter(leave => leave.employeeId === user.employeeId);
    }
    return [];
  };

  const pendingLeaves = leaveRequests.filter(leave => leave.status === 'pending');

  const handleReview = async (leaveId, status, comment) => {
    try {
      await leaveService.update(leaveId, {
        status,
        reviewedAt: new Date().toISOString(),
        reviewedBy: user.employeeId,
        reviewComment: comment
      });
      // 本地狀態會通過監聽器自動更新
    } catch (error) {
      console.error('審核請假錯誤:', error);
      alert('審核失敗，請重試');
    }
  };

  const handleApplyLeave = async (leaveData) => {
    try {
      await leaveService.create({
        ...leaveData,
        employeeId: user.employeeId,
        employeeName: user.name || user.displayName,
        department: user.department,
        status: 'pending',
        appliedAt: new Date().toISOString()
      });
      setShowApplyModal(false);
    } catch (error) {
      console.error('申請請假錯誤:', error);
      alert('申請請假失敗，請重試');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'sick': return '病假';
      case 'annual': return '年假';
      case 'personal': return '事假';
      default: return '其他';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">請假管理</h2>
        <div className="flex space-x-3">
          <button
            onClick={loadData}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>重新整理</span>
          </button>
          {permissions.canApplyLeave && (
            <button
              onClick={() => setShowApplyModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>申請請假</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* 標籤頁 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            請假記錄
          </button>
          {(permissions.canReviewAllLeaves || permissions.canReviewDepartmentLeaves) && (
            <button
              onClick={() => setActiveTab('review')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'review'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              待審核 
              {pendingLeaves.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  {pendingLeaves.length}
                </span>
              )}
            </button>
          )}
        </nav>
      </div>

      {/* 請假記錄列表 */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-7 gap-4 font-medium text-gray-700">
              <div>申請人</div>
              <div>請假類型</div>
              <div>開始日期</div>
              <div>結束日期</div>
              <div>天數</div>
              <div>狀態</div>
              <div>操作</div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {leaveRequests
              .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
              .map(leave => {
                const employee = employees.find(emp => emp.id === leave.employeeId);
                const reviewer = employees.find(emp => emp.id === leave.reviewedBy);
                return (
                  <div key={leave.id} className="px-6 py-4">
                    <div className="grid grid-cols-7 gap-4 items-center">
                      <div className="font-medium text-gray-900">
                        {employee?.name || leave.employeeName || '未知員工'}
                      </div>
                      <div className="text-gray-600">{getTypeLabel(leave.type)}</div>
                      <div className="text-gray-600">{leave.startDate}</div>
                      <div className="text-gray-600">{leave.endDate}</div>
                      <div className="text-gray-600">{leave.days} 天</div>
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                          {leave.status === 'approved' ? '已核准' : 
                           leave.status === 'rejected' ? '已拒絕' : '待審核'}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 text-sm p-1 rounded hover:bg-blue-50"
                          onClick={() => alert(`請假原因: ${leave.reason}`)}
                          title="查看詳情"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {(permissions.canReviewAllLeaves || permissions.canReviewDepartmentLeaves) && 
                         leave.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleReview(leave.id, 'approved', '核准請假')}
                              className="text-green-600 hover:text-green-800 text-sm p-1 rounded hover:bg-green-50"
                              title="核准"
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                const comment = prompt('請輸入拒絕原因:');
                                if (comment) handleReview(leave.id, 'rejected', comment);
                              }}
                              className="text-red-600 hover:text-red-800 text-sm p-1 rounded hover:bg-red-50"
                              title="拒絕"
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {leave.reviewComment && (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="font-medium">審核意見:</span> {leave.reviewComment}
                        {reviewer && <span className="ml-2 text-gray-500">({reviewer.name})</span>}
                        {leave.reviewedAt && (
                          <span className="ml-2 text-gray-500">
                            {new Date(leave.reviewedAt).toLocaleString('zh-TW')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            {leaveRequests.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                暫無請假記錄
              </div>
            )}
          </div>
        </div>
      )}

      {/* 待審核請假 */}
      {activeTab === 'review' && (
        <div className="space-y-4">
          {pendingLeaves.map(leave => {
            const employee = employees.find(emp => emp.id === leave.employeeId);
            return (
              <div key={leave.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {employee?.name || leave.employeeName || '未知員工'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        leave.type === 'sick' ? 'bg-red-100 text-red-800' :
                        leave.type === 'annual' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getTypeLabel(leave.type)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-500">請假日期:</span>
                        <div className="font-medium">{leave.startDate} - {leave.endDate}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">請假天數:</span>
                        <div className="font-medium">{leave.days} 天</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">申請時間:</span>
                        <div className="font-medium">
                          {new Date(leave.appliedAt).toLocaleString('zh-TW')}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">請假原因:</span>
                      <div className="mt-1 text-gray-900 bg-gray-50 p-3 rounded">{leave.reason}</div>
                    </div>
                  </div>
                  <div className="flex space-x-3 ml-6">
                    <button
                      onClick={() => handleReview(leave.id, 'approved', '核准請假')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 btn-animate"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>核准</span>
                    </button>
                    <button
                      onClick={() => {
                        const comment = prompt('請輸入拒絕原因:');
                        if (comment) handleReview(leave.id, 'rejected', comment);
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2 btn-animate"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span>拒絕</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {pendingLeaves.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              目前沒有待審核的請假申請
            </div>
          )}
        </div>
      )}

      {/* 申請請假 Modal */}
      {showApplyModal && (
        <LeaveApplicationModal
          onClose={() => setShowApplyModal(false)}
          onSubmit={handleApplyLeave}
        />
      )}

      {/* 統計摘要 */}
      {leaveRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">請假統計</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {leaveRequests.length}
              </div>
              <div className="text-sm text-gray-500">總申請數</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {leaveRequests.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-500">待審核</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {leaveRequests.filter(r => r.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-500">已核准</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {leaveRequests.filter(r => r.status === 'rejected').length}
              </div>
              <div className="text-sm text-gray-500">已拒絕</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveManagement;
 