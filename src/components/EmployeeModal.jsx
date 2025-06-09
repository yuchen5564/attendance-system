import React, { useState, useEffect } from 'react';
import { X, User, Mail, Building, Clock } from 'lucide-react';

const EmployeeModal = ({ employee, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    position: '',
    role: 'employee',
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        uid: employee.uid,
        name: employee.name || '',
        email: employee.email || '',
        password: '', // 不顯示現有密碼
        department: employee.department || '',
        position: employee.position || '',
        role: employee.role || 'employee',
        workingHours: employee.workingHours || {
          start: '09:00',
          end: '18:00'
        },
        isActive: employee.isActive !== false
      });
    }
  }, [employee]);

  const departments = [
    '人力資源部',
    '財務部',
    '資訊部',
    '業務部',
    '行銷部',
    '研發部',
    '製造部',
    '品管部',
    '客服部',
    '總務部'
  ];

  const roles = [
    { value: 'employee', label: '一般員工' },
    { value: 'manager', label: '部門主管' },
    { value: 'admin', label: '系統管理員' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('請填寫姓名和電子郵件');
      return;
    }

    if (!employee && !formData.password.trim()) {
      alert('請設定密碼');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      alert('密碼至少需要6個字元');
      return;
    }

    // 編輯模式下，如果沒有輸入新密碼，就不更新密碼
    const submitData = { ...formData };
    if (employee && !formData.password.trim()) {
      delete submitData.password;
    }

    setLoading(true);
    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('提交員工資料失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <User className="w-5 h-5 inline mr-2" />
            {employee ? '編輯員工' : '新增員工'}
          </h2>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="employee-form">
              <div className="form-group">
                <label className="form-label">
                  <User className="w-4 h-4 inline mr-1" />
                  姓名 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="form-input"
                  placeholder="請輸入員工姓名"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  電子郵件 *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="form-input"
                  placeholder="請輸入電子郵件"
                  disabled={!!employee}
                  required
                />
                {employee && (
                  <p className="text-sm text-gray-500 mt-1">
                    編輯模式下無法修改電子郵件
                  </p>
                )}
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  密碼 {!employee && '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="form-input"
                  placeholder={
                    employee 
                      ? "編輯模式不支援修改密碼"
                      : "請設定密碼（至少6個字元）"
                  }
                  minLength="6"
                  required={!employee}
                  disabled={!!employee}
                />
                {employee ? (
                  <p className="text-sm text-orange-600 mt-1">
                    ⚠️ 安全考量：無法在此修改密碼。請使用「重設密碼」按鈕發送重設郵件給用戶。
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">
                    新建用戶必須設定初始密碼
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Building className="w-4 h-4 inline mr-1" />
                  部門
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="form-select"
                >
                  <option value="">請選擇部門</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">職位</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  className="form-input"
                  placeholder="請輸入職位"
                />
              </div>

              <div className="form-group">
                <label className="form-label">角色</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="form-select"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock className="w-4 h-4 inline mr-1" />
                  上班時間
                </label>
                <input
                  type="time"
                  value={formData.workingHours.start}
                  onChange={(e) => handleChange('workingHours.start', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock className="w-4 h-4 inline mr-1" />
                  下班時間
                </label>
                <input
                  type="time"
                  value={formData.workingHours.end}
                  onChange={(e) => handleChange('workingHours.end', e.target.value)}
                  className="form-input"
                />
              </div>

              {employee && (
                <div className="form-group full-width">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => handleChange('isActive', e.target.checked)}
                    />
                    <span>啟用狀態</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '處理中...' : (employee ? '更新' : '創建')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;