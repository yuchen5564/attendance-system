import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../firebase/firestoreService';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';
import toast from 'react-hot-toast';

const AttendancePage = () => {
  const { userData, isAdmin, isManager } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    userId: userData?.uid || '',
    type: ''
  });

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
  } = usePagination(filteredRecords, 25); // 預設每頁 25 筆

  useEffect(() => {
    loadData();
  }, [userData]);

  useEffect(() => {
    applyFilters();
  }, [attendanceRecords, filters]);

  // 當篩選結果改變時，重置到第一頁
  useEffect(() => {
    resetToFirstPage();
  }, [filteredRecords.length, resetToFirstPage]);

  const loadData = async () => {
    if (!userData) return;

    try {
      setLoading(true);

      if (isAdmin || isManager) {
        // 管理員和主管可以看到所有員工的記錄
        const [allUsers, allRecords] = await Promise.all([
          firestoreService.getAllUsers(),
          firestoreService.getAttendanceRecords() // 獲取所有記錄
        ]);
        setUsers(allUsers);
        setAttendanceRecords(allRecords);
      } else {
        // 一般員工只能看到自己的記錄
        const userRecords = await firestoreService.getAttendanceRecords(userData.uid);
        setAttendanceRecords(userRecords);
        setUsers([userData]);
      }
    } catch (error) {
      console.error('載入出勤記錄失敗:', error);
      toast.error('載入數據失敗');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...attendanceRecords];

    // 按用戶篩選
    if (filters.userId) {
      filtered = filtered.filter(record => record.userId === filters.userId);
    }

    // 按類型篩選
    if (filters.type) {
      filtered = filtered.filter(record => record.type === filters.type);
    }

    // 按日期範圍篩選
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(record => {
        const recordDate = record.timestamp.toDate ? record.timestamp.toDate() : new Date(record.timestamp);
        return recordDate >= startDate;
      });
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // 包含整天
      filtered = filtered.filter(record => {
        const recordDate = record.timestamp.toDate ? record.timestamp.toDate() : new Date(record.timestamp);
        return recordDate <= endDate;
      });
    }

    setFilteredRecords(filtered);
  };

  const exportRecords = () => {
    if (filteredRecords.length === 0) {
      toast.error('沒有數據可以匯出');
      return;
    }

    const csvData = [
      ['日期', '時間', '員工姓名', '類型', '位置'],
      ...filteredRecords.map(record => {
        const user = users.find(u => u.uid === record.userId);
        const date = record.timestamp.toDate ? record.timestamp.toDate() : new Date(record.timestamp);
        return [
          date.toLocaleDateString('zh-TW'),
          date.toLocaleTimeString('zh-TW'),
          user?.name || '未知用戶',
          record.type === 'clock_in' ? '上班' : '下班',
          record.location ? `${record.location.latitude}, ${record.location.longitude}` : '無'
        ];
      })
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `出勤記錄_${new Date().toLocaleDateString('zh-TW')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('記錄已匯出');
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.uid === userId);
    return user?.name || '未知用戶';
  };

  const formatDateTime = (timestamp) => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return {
      date: date.toLocaleDateString('zh-TW'),
      time: date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return <LoadingSpinner text="載入出勤記錄中..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>出勤記錄</h1>
        <button
          onClick={exportRecords}
          className="btn btn-primary"
          disabled={filteredRecords.length === 0}
        >
          <Download size={20} />
          匯出記錄
        </button>
      </div>

      {/* 篩選器 */}
      <div className="card mb-6">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Filter size={20} />
            <h3>篩選條件</h3>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">開始日期</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">結束日期</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="form-input"
              />
            </div>

            {(isAdmin || isManager) && (
              <div className="form-group">
                <label className="form-label">員工</label>
                <select
                  value={filters.userId}
                  onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
                  className="form-select"
                >
                  <option value="">所有員工</option>
                  {users.map(user => (
                    <option key={user.uid} value={user.uid}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">類型</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="form-select"
              >
                <option value="">所有類型</option>
                <option value="clock_in">上班打卡</option>
                <option value="clock_out">下班打卡</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 記錄表格 */}
      <div className="card">
        <div className="card-header">
          <h3>出勤記錄 ({totalItems} 筆)</h3>
        </div>
        <div className="card-body">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">沒有找到符合條件的記錄</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>日期</th>
                      <th>時間</th>
                      {(isAdmin || isManager) && <th>員工</th>}
                      <th>類型</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((record) => {
                      const { date, time } = formatDateTime(record.timestamp);
                      return (
                        <tr key={record.id}>
                          <td>{date}</td>
                          <td>{time}</td>
                          {(isAdmin || isManager) && <td>{getUserName(record.userId)}</td>}
                          <td>
                            <span className={`status-badge ${record.type === 'clock_in' ? 'approved' : 'pending'}`}>
                              {record.type === 'clock_in' ? '上班' : '下班'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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
    </div>
  );
};

export default AttendancePage;