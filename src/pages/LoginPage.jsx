import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('請填寫所有欄位');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('登入成功！');
      navigate('/dashboard');
    } catch (error) {
      console.error('登入錯誤:', error);
      if (error.code === 'auth/user-not-found') {
        toast.error('找不到此用戶');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('密碼錯誤');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('無效的電子郵件格式');
      } else {
        toast.error('登入失敗，請稍後再試');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="flex items-center justify-center mb-4">
            <Clock className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="login-title">企業打卡系統</h1>
          <p className="login-subtitle">請登入您的帳戶</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              電子郵件
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="請輸入您的電子郵件"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              密碼
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="請輸入您的密碼"
                required
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
          >
            {loading ? (
              <>
                <div className="loading-spinner" style={{ width: '1rem', height: '1rem' }} />
                登入中...
              </>
            ) : (
              <>
                <LogIn size={20} />
                登入
              </>
            )}
          </button>
        </form>

        <div className="mt-4" style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
          <p>預設帳戶：</p>
          <p>管理員: admin@company.com / admin123</p>
          <p>員工: employee@company.com / employee123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;