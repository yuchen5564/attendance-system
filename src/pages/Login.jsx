// src/pages/Login.js
import React, { useState } from 'react';
import { Eye, EyeOff, Clock, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { loginUser, resetPassword } from '../firebase/authService';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // 預設測試帳號
  const testAccounts = [
    { email: 'admin@company.com', password: 'admin123', role: '管理員' },
    { email: 'manager@company.com', password: 'manager123', role: '主管' },
    { email: 'employee@company.com', password: 'employee123', role: '員工' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await loginUser(formData.email, formData.password);
      onLogin(user);
    } catch (error) {
      console.error('登入失敗:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await resetPassword(forgotEmail);
      setSuccess('密碼重設郵件已發送，請檢查您的信箱');
      setTimeout(() => {
        setShowForgotPassword(false);
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return '找不到此電子郵件的帳戶';
      case 'auth/wrong-password':
        return '密碼錯誤';
      case 'auth/invalid-email':
        return '電子郵件格式無效';
      case 'auth/user-disabled':
        return '此帳戶已被停用';
      case 'auth/too-many-requests':
        return '登入嘗試次數過多，請稍後再試';
      case 'auth/network-request-failed':
        return '網路連線失敗，請檢查網路連線';
      default:
        return '登入失敗，請再試一次';
    }
  };

  const fillTestAccount = (account) => {
    setFormData({
      email: account.email,
      password: account.password
    });
    setError('');
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">重設密碼</h2>
              <p className="text-gray-600 mt-2">請輸入您的電子郵件地址</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-700 text-sm">{success}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電子郵件
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="請輸入您的電子郵件"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    發送中...
                  </div>
                ) : (
                  '發送重設郵件'
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-gray-600 hover:text-gray-800 transition duration-200"
              >
                返回登入
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左側 - 品牌區域 */}
        <div className="hidden lg:flex flex-col justify-center items-center text-white p-8">
          <div className="text-center">
            <div className="mb-8">
              <Clock className="h-24 w-24 text-blue-300 mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-4">企業打卡系統</h1>
              <p className="text-xl text-blue-200 mb-8">
                智能化員工考勤管理解決方案
              </p>
            </div>
            
            <div className="space-y-4 text-left">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <span>實時打卡與出勤追蹤</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <span>智能請假審核流程</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <span>多層級權限管理</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <span>詳細報表分析</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右側 - 登入表單 */}
        <div className="flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <div className="lg:hidden mb-4">
                <Clock className="h-12 w-12 text-blue-600 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">歡迎回來</h2>
              <p className="text-gray-600 mt-2">請登入您的帳戶</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電子郵件
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="請輸入電子郵件"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密碼
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="請輸入密碼"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">記住我</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  忘記密碼？
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    登入中...
                  </div>
                ) : (
                  '登入'
                )}
              </button>
            </form>

            {/* 測試帳號 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-3">測試帳號 (開發用)</p>
              <div className="space-y-2">
                {testAccounts.map((account, index) => (
                  <button
                    key={index}
                    onClick={() => fillTestAccount(account)}
                    className="w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border transition duration-200"
                  >
                    <div className="font-medium">{account.role}</div>
                    <div className="text-gray-500">{account.email}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                © 2025 企業打卡系統. 版權所有
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;