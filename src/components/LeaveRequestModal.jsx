import React, { useState } from 'react';
import { X, Calendar, FileText } from 'lucide-react';

const LeaveRequestModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);

  const leaveTypes = [
    { value: 'annual', label: '年假' },
    { value: 'sick', label: '病假' },
    { value: 'personal', label: '事假' },
    { value: 'maternity', label: '產假' },
    { value: 'paternity', label: '陪產假' },
    { value: 'funeral', label: '喪假' },
    { value: 'marriage', label: '婚假' },
    { value: 'other', label: '其他' }
  ];

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // 包含開始和結束日
    
    return diffDays;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.type || !formData.startDate || !formData.endDate || !formData.reason.trim()) {
      alert('請填寫所有必填欄位');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      alert('結束日期不能早於開始日期');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        days: calculateDays()
      });
    } catch (error) {
      console.error('提交請假申請失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Calendar className="w-5 h-5 inline mr-2" />
            新增請假申請
          </h2>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">請假類型 *</label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="form-select"
                required
              >
                <option value="">請選擇請假類型</option>
                {leaveTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">開始日期 *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">結束日期 *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className="form-input"
                  min={formData.startDate}
                  required
                />
              </div>
            </div>

            {formData.startDate && formData.endDate && (
              <div className="alert alert-info">
                <FileText className="w-4 h-4 inline mr-2" />
                請假天數：{calculateDays()} 天
              </div>
            )}

            <div className="form-group">
              <label className="form-label">請假原因 *</label>
              <textarea
                value={formData.reason}
                onChange={(e) => handleChange('reason', e.target.value)}
                className="form-textarea"
                placeholder="請詳細說明請假原因..."
                required
              />
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
              {loading ? '提交中...' : '提交申請'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequestModal;