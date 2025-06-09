import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Check, X, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../firebase/firestoreService';
import LoadingSpinner from '../components/LoadingSpinner';
import LeaveRequestModal from '../components/LeaveRequestModal';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';
import toast from 'react-hot-toast';

const LeaveRequestsPage = () => {
  const { userData, isAdmin, isManager } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('all');

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
  } = usePagination(filteredRequests, 15); // 預設每頁 15 筆

  useEffect(() => {
    loadData();
  }, [userData]);

  // 當篩選條件改變時，更新篩選結果並重置頁碼
  useEffect(() => {
    const filtered = getFilteredRequests();
    setFilteredRequests(filtered);
    resetToFirstPage();
  }, [leaveRequests, filter, resetToFirstPage]);

  const loadData = async () => {
    if (!userData) return;

    try {
      setLoading(true);

      if (isAdmin || isManager) {
        // 管理員和主管可以看到所有請假申請
        const [allRequests, allUsers] = await Promise.all([
          firestoreService.getLeaveRequests(),
          firestoreService.getAllUsers()
        ]);
        setLeaveRequests(allRequests);
        setUsers(allUsers);
      } else {
        // 一般員工只能看到自己的請假申請
        const userRequests = await firestoreService.getLeaveRequests(userData.uid);
        setLeaveRequests(userRequests);
        setUsers([userData]);
      }
    } catch (error) {
      console.error('載入請假申請失敗:', error);
      toast.error('載入數據失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await firestoreService.approveLeaveRequest(requestId, userData.uid);
      toast.success('請假申請已批准');
      loadData();
    } catch (error) {
      console.error('批准請假申請失敗:', error);
      toast.error('操作失敗');
    }
  };

  const handleReject = async (requestId, comments = '') => {
    try {
      await firestoreService.rejectLeaveRequest(requestId, userData.uid, comments);
      toast.success('請假申請已拒絕');
      loadData();
    } catch (error) {
      console.error('拒絕請假申請失敗:', error);
      toast.error('操作失敗');
    }
  };

  const handleSubmitRequest = async (requestData) => {
    try {
      await firestoreService.submitLeaveRequest({
        ...requestData,
        userId: userData.uid,
        userName: userData.name,
        userDepartment: userData.department
      });
      toast.success('請假申請已提交');
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('提交請假申請失敗:', error);
      toast.error('提交失敗');
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.uid === userId);
    return user?.name || '未知用戶';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('zh-TW');
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '待審核';
      case 'approved': return '已批准';
      case 'rejected': return '已拒絕';
      default: return status;
    }
  };

  const getFilteredRequests = () => {
    if (filter === 'all') return leaveRequests;
    return leaveRequests.filter(request => request.status === filter);
  };

  if (loading) {
    return <LoadingSpinner text="載入請假申請中..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>請假管理</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus size={20} />
          新增請假申請
        </button>
      </div>

      {/* 篩選標籤 */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: '全部', count: leaveRequests.length },
          { key: 'pending', label: '待審核', count: leaveRequests.filter(r => r.status === 'pending').length },
          { key: 'approved', label: '已批准', count: leaveRequests.filter(r => r.status === 'approved').length },
          { key: 'rejected', label: '已拒絕', count: leaveRequests.filter(r => r.status === 'rejected').length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`btn ${filter === tab.key ? 'btn-primary' : 'btn-outline'}`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* 請假申請列表 */}
      <div className="card">
        <div className="card-header">
          <h3>請假申請 ({totalItems} 筆)</h3>
        </div>
        <div className="card-body">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">沒有找到符合條件的請假申請</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedData.map((request) => (
                  <div key={request.id} className={`leave-request-card card ${request.status}`}>
                    <div className="card-body">
                      <div className="leave-request-header">
                        <div>
                          {(isAdmin || isManager) && (
                            <div className="leave-request-user">{getUserName(request.userId)}</div>
                          )}
                          <div className="leave-request-dates">
                            {formatDate(request.startDate)} - {formatDate(request.endDate)}
                            <span className="ml-2 text-sm">({request.days} 天)</span>
                          </div>
                        </div>
                        <span className={`status-badge ${request.status}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-1">請假類型：{request.type}</div>
                        <div className="leave-request-reason">{request.reason}</div>
                      </div>

                      {request.comments && (
                        <div className="mb-4 p-3 bg-gray-50 rounded">
                          <div className="text-sm font-medium text-gray-700 mb-1">審核意見：</div>
                          <div className="text-sm text-gray-600">{request.comments}</div>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          申請時間：{formatDate(request.createdAt)}
                        </div>

                        {(isAdmin || isManager) && request.status === 'pending' && (
                          <div className="leave-request-actions">
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="btn btn-success btn-sm"
                            >
                              <Check size={16} />
                              批准
                            </button>
                            <button
                              onClick={() => {
                                const comments = prompt('請輸入拒絕原因（可選）：');
                                if (comments !== null) {
                                  handleReject(request.id, comments);
                                }
                              }}
                              className="btn btn-danger btn-sm"
                            >
                              <X size={16} />
                              拒絕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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

      {/* 請假申請彈窗 */}
      {showModal && (
        <LeaveRequestModal
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitRequest}
        />
      )}
    </div>
  );
};

export default LeaveRequestsPage;