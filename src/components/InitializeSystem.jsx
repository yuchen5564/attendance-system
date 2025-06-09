import React, { useState } from 'react';
import { User, Key, Building, Shield, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const InitializeSystem = () => {
  const { initializeSystem } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: 'admin@company.com',
    password: 'admin123',
    name: '系統管理員',
    department: '資訊部',
    position: '系統管理員'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await initializeSystem(formData);
      toast.success('🎉 系統初始化完成！管理員帳戶已創建');
    } catch (error) {
      console.error('初始化失敗:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('此電子郵件已被使用，系統可能已經初始化');
      } else if (error.code === 'auth/weak-password') {
        toast.error('密碼太弱，請使用至少6個字元');
      } else {
        toast.error('系統初始化失敗：' + error.message);
      }
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

  const createSampleData = () => {
    setFormData({
      email: 'admin@company.com',
      password: 'admin123',
      name: '系統管理員',
      department: '資訊部',
      position: '系統管理員'
    });
    toast.success('已填入範例資料');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">企業打卡系統</h1>
          <p className="text-gray-600">首次使用需要初始化系統</p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            創建管理員帳戶
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            這將創建系統的第一個管理員帳戶，管理員可以管理其他用戶和系統設定。
          </p>
          <button
            type="button"
            onClick={createSampleData}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            使用範例資料
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label flex items-center gap-2">
              <User className="w-4 h-4" />
              管理員姓名 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="form-input"
              placeholder="請輸入管理員姓名"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label flex items-center gap-2">
              <Key className="w-4 h-4" />
              電子郵件 *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="form-input"
              placeholder="請輸入電子郵件"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">密碼 *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="form-input"
              placeholder="請設定密碼（至少6個字元）"
              minLength="6"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <Building className="w-4 h-4" />
                部門
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className="form-input"
                placeholder="部門"
              />
            </div>

            <div className="form-group">
              <label className="form-label">職位</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                className="form-input"
                placeholder="職位"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full mt-6"
            style={{ 
              backgroundColor: loading ? '#94a3b8' : '#3b82f6',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="loading-spinner" style={{ width: '1rem', height: '1rem' }} />
                初始化中...
              </div>
            ) : (
              '🚀 開始使用企業打卡系統'
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">系統功能：</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ 員工打卡管理</li>
            <li>✅ 請假申請與審核</li>
            <li>✅ 出勤報表分析</li>
            <li>✅ 多層級權限管理</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InitializeSystem;