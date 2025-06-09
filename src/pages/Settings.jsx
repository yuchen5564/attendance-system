// pages/Settings.js
import React, { useState, useEffect } from 'react';
import { Shield, User, Save } from 'lucide-react';
import { usePermissions } from '../contexts/AuthContext';
import { settingsService } from '../firebase/firestoreService';
import LoadingSpinner from '../components/Common/LoadingSpinner';

function Settings() {
  const permissions = usePermissions();
  const [settings, setSettings] = useState({
    companyName: '範例公司',
    workHours: { start: '09:00', end: '18:00' },
    breakTime: { start: '12:00', end: '13:00' },
    overtimeRate: 1.5,
    lateThreshold: 15,
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
    
    // 設置實時監聽
    const unsubscribe = settingsService.listen((settingsData) => {
      if (settingsData) {
        setSettings(settingsData);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const settingsData = await settingsService.get();
      setSettings(settingsData);
    } catch (error) {
      console.error('載入系統設定錯誤:', error);
      setError('載入系統設定失敗');
    } finally {
      setLoading(false);
    }
  };

  // 權限檢查
  if (!permissions.canManageSettings) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-red-500 text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">訪問受限</h2>
        <p className="text-gray-600">您沒有權限訪問此頁面</p>
      </div>
    );
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      await settingsService.update(settings);
      alert('設定已儲存！');
    } catch (error) {
      console.error('儲存系統設定錯誤:', error);
      setError('儲存系統設定失敗');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">系統設定</h2>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center space-x-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? '儲存中...' : '儲存設定'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 公司基本設定 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">公司基本設定</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                公司名稱
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  標準上班時間
                </label>
                <input
                  type="time"
                  value={settings.workHours.start}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    workHours: { ...prev.workHours, start: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  標準下班時間
                </label>
                <input
                  type="time"
                  value={settings.workHours.end}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    workHours: { ...prev.workHours, end: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  午休開始
                </label>
                <input
                  type="time"
                  value={settings.breakTime.start}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    breakTime: { ...prev.breakTime, start: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  午休結束
                </label>
                <input
                  type="time"
                  value={settings.breakTime.end}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    breakTime: { ...prev.breakTime, end: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 考勤規則設定 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">考勤規則</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                遲到容忍時間 (分鐘)
              </label>
              <input
                type="number"
                value={settings.lateThreshold}
                onChange={(e) => setSettings(prev => ({ ...prev, lateThreshold: parseInt(e.target.value) || 0 }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="60"
              />
              <p className="text-xs text-gray-500 mt-1">
                超過此時間才算遲到
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                加班費倍率
              </label>
              <input
                type="number"
                value={settings.overtimeRate}
                onChange={(e) => setSettings(prev => ({ ...prev, overtimeRate: parseFloat(e.target.value) || 1 }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="3"
                step="0.1"
              />
              <p className="text-xs text-gray-500 mt-1">
                加班時薪計算倍率
              </p>
            </div>
          </div>
        </div>

        {/* 通知設定 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">通知設定</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">電子郵件通知</label>
                <p className="text-xs text-gray-500">遲到、請假等重要事件通知</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, email: e.target.checked }
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">簡訊通知</label>
                <p className="text-xs text-gray-500">緊急事件簡訊提醒</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.sms}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, sms: e.target.checked }
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">推播通知</label>
                <p className="text-xs text-gray-500">即時系統通知</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, push: e.target.checked }
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* 權限管理說明 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">權限管理</h3>
          <div className="space-y-4">
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-center space-x-3 mb-3">
                <Shield className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-900">管理員權限</span>
              </div>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• 查看所有員工出勤記錄</li>
                <li>• 新增/編輯/刪除員工資料</li>
                <li>• 系統設定管理</li>
                <li>• 匯出全公司報表</li>
                <li>• 審核所有部門請假申請</li>
              </ul>
            </div>
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <div className="flex items-center space-x-3 mb-3">
                <User className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900">主管權限</span>
              </div>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• 查看部門員工出勤記錄</li>
                <li>• 管理部門員工資料</li>
                <li>• 部門報表匯出</li>
                <li>• 審核部門請假申請</li>
                <li>• 部門打卡監控</li>
              </ul>
            </div>
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center space-x-3 mb-3">
                <User className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">員工權限</span>
              </div>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 個人打卡功能</li>
                <li>• 查看個人出勤記錄</li>
                <li>• 編輯個人資料</li>
                <li>• 申請請假</li>
                <li>• 查看請假狀態</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Firebase 設定說明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Firebase 整合說明</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>已整合的 Firebase 服務：</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Authentication:</strong> 用戶登入認證與角色管理</li>
            <li><strong>Firestore:</strong> 員工資料、出勤記錄、請假申請存儲</li>
            <li><strong>實時同步:</strong> 多用戶實時數據同步</li>
            <li><strong>安全規則:</strong> 基於角色的資料訪問控制</li>
          </ul>
          <p className="mt-3"><strong>Firestore 資料庫集合：</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><code>users/</code> - 用戶認證資料</li>
            <li><code>employees/</code> - 員工基本資料</li>
            <li><code>attendance/</code> - 出勤打卡記錄</li>
            <li><code>leaves/</code> - 請假申請記錄</li>
            <li><code>settings/</code> - 系統設定參數</li>
          </ul>
          <p className="mt-3 text-green-800">
            <strong>✅ 系統已完全整合 Firebase，支援實時數據同步和離線快取！</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Settings;
             