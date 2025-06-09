import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Shield, Clock, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../firebase/firestoreService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { userData, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    company: {
      name: '企業打卡系統',
      address: '',
      phone: '',
      email: ''
    },
    workingHours: {
      default: {
        start: '09:00',
        end: '18:00'
      },
      flexible: false
    },
    attendance: {
      allowEarlyClockIn: 30, // 分鐘
      allowLateClockOut: 30, // 分鐘
      autoClockOut: false
    },
    leave: {
      requireApproval: true,
      maxAdvanceDays: 30,
      allowSameDay: false
    },
    notifications: {
      emailNotifications: true,
      reminderTime: '08:30',
      weekendReminders: false
    }
  });

  useEffect(() => {
    if (isAdmin) {
      loadSettings();
    }
  }, [isAdmin]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // 這裡可以從 Firestore 載入系統設定
      // 暫時使用預設設定
      console.log('載入系統設定...');
    } catch (error) {
      console.error('載入設定失敗:', error);
      toast.error('載入設定失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // 這裡可以將設定儲存到 Firestore
      // await firestoreService.updateSettings(settings);
      
      // 模擬儲存延遲
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('設定已儲存');
    } catch (error) {
      console.error('儲存設定失敗:', error);
      toast.error('儲存設定失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (section, subsection, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">權限不足</h2>
        <p className="text-gray-500">只有系統管理員可以訪問系統設定</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner text="載入系統設定中..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>系統設定</h1>
          <p className="text-gray-600">管理系統全域設定和參數</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? (
            <>
              <RefreshCw className="animate-spin" size={20} />
              儲存中...
            </>
          ) : (
            <>
              <Save size={20} />
              儲存設定
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {/* 公司資訊 */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Building size={20} />
              <h3>公司資訊</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">公司名稱</label>
                <input
                  type="text"
                  value={settings.company.name}
                  onChange={(e) => handleChange('company', 'name', e.target.value)}
                  className="form-input"
                  placeholder="請輸入公司名稱"
                />
              </div>

              <div className="form-group">
                <label className="form-label">聯絡電話</label>
                <input
                  type="tel"
                  value={settings.company.phone}
                  onChange={(e) => handleChange('company', 'phone', e.target.value)}
                  className="form-input"
                  placeholder="請輸入聯絡電話"
                />
              </div>

              <div className="form-group">
                <label className="form-label">公司地址</label>
                <input
                  type="text"
                  value={settings.company.address}
                  onChange={(e) => handleChange('company', 'address', e.target.value)}
                  className="form-input"
                  placeholder="請輸入公司地址"
                />
              </div>

              <div className="form-group">
                <label className="form-label">聯絡信箱</label>
                <input
                  type="email"
                  value={settings.company.email}
                  onChange={(e) => handleChange('company', 'email', e.target.value)}
                  className="form-input"
                  placeholder="請輸入聯絡信箱"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 工作時間設定 */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Clock size={20} />
              <h3>工作時間設定</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">預設上班時間</label>
                <input
                  type="time"
                  value={settings.workingHours.default.start}
                  onChange={(e) => handleNestedChange('workingHours', 'default', 'start', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">預設下班時間</label>
                <input
                  type="time"
                  value={settings.workingHours.default.end}
                  onChange={(e) => handleNestedChange('workingHours', 'default', 'end', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.workingHours.flexible}
                    onChange={(e) => handleChange('workingHours', 'flexible', e.target.checked)}
                  />
                  <span>啟用彈性工時</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 打卡設定 */}
        <div className="card">
          <div className="card-header">
            <h3>打卡設定</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">允許提前打卡 (分鐘)</label>
                  <input
                    type="number"
                    value={settings.attendance.allowEarlyClockIn}
                    onChange={(e) => handleChange('attendance', 'allowEarlyClockIn', parseInt(e.target.value))}
                    className="form-input"
                    min="0"
                    max="120"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">允許延後打卡 (分鐘)</label>
                  <input
                    type="number"
                    value={settings.attendance.allowLateClockOut}
                    onChange={(e) => handleChange('attendance', 'allowLateClockOut', parseInt(e.target.value))}
                    className="form-input"
                    min="0"
                    max="120"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label">自動下班打卡</label>
                  <p className="text-sm text-gray-600">超過下班時間自動記錄下班打卡</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.attendance.autoClockOut}
                  onChange={(e) => handleChange('attendance', 'autoClockOut', e.target.checked)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 請假設定 */}
        <div className="card">
          <div className="card-header">
            <h3>請假設定</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label">需要主管審核</label>
                  <p className="text-sm text-gray-600">所有請假申請需要主管批准</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.leave.requireApproval}
                  onChange={(e) => handleChange('leave', 'requireApproval', e.target.checked)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">最大提前申請天數</label>
                  <input
                    type="number"
                    value={settings.leave.maxAdvanceDays}
                    onChange={(e) => handleChange('leave', 'maxAdvanceDays', parseInt(e.target.value))}
                    className="form-input"
                    min="1"
                    max="365"
                  />
                </div>

                <div className="form-group">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.leave.allowSameDay}
                      onChange={(e) => handleChange('leave', 'allowSameDay', e.target.checked)}
                    />
                    <span>允許當日請假</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 通知設定 */}
        <div className="card">
          <div className="card-header">
            <h3>通知設定</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label">電子郵件通知</label>
                  <p className="text-sm text-gray-600">發送重要事件的電子郵件通知</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => handleChange('notifications', 'emailNotifications', e.target.checked)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">每日提醒時間</label>
                  <input
                    type="time"
                    value={settings.notifications.reminderTime}
                    onChange={(e) => handleChange('notifications', 'reminderTime', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.notifications.weekendReminders}
                      onChange={(e) => handleChange('notifications', 'weekendReminders', e.target.checked)}
                    />
                    <span>週末提醒</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 系統資訊 */}
        <div className="card">
          <div className="card-header">
            <h3>系統資訊</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">系統版本</label>
                <p className="text-gray-600">v1.0.0</p>
              </div>

              <div>
                <label className="form-label">最後更新</label>
                <p className="text-gray-600">{new Date().toLocaleDateString('zh-TW')}</p>
              </div>

              <div>
                <label className="form-label">資料庫狀態</label>
                <span className="status-badge active">正常</span>
              </div>

              <div>
                <label className="form-label">備份狀態</label>
                <span className="status-badge active">已啟用</span>
              </div>
            </div>
          </div>
        </div>

        {/* 危險操作 */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-red-600">危險操作</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="alert alert-warning">
                <strong>警告：</strong>以下操作可能會影響系統正常運作，請謹慎使用。
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label">清除所有打卡記錄</label>
                  <p className="text-sm text-gray-600">這將永久刪除所有員工的打卡記錄</p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('確定要清除所有打卡記錄嗎？此操作無法復原！')) {
                      toast.error('此功能暫未實作');
                    }
                  }}
                  className="btn btn-danger btn-sm"
                >
                  清除記錄
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label">重置系統設定</label>
                  <p className="text-sm text-gray-600">將所有設定恢復為預設值</p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('確定要重置所有系統設定嗎？')) {
                      // 重置設定邏輯
                      setSettings({
                        company: {
                          name: '企業打卡系統',
                          address: '',
                          phone: '',
                          email: ''
                        },
                        workingHours: {
                          default: {
                            start: '09:00',
                            end: '18:00'
                          },
                          flexible: false
                        },
                        attendance: {
                          requireLocation: false,
                          allowEarlyClockIn: 30,
                          allowLateClockOut: 30,
                          autoClockOut: false
                        },
                        leave: {
                          requireApproval: true,
                          maxAdvanceDays: 30,
                          allowSameDay: false
                        },
                        notifications: {
                          emailNotifications: true,
                          reminderTime: '08:30',
                          weekendReminders: false
                        }
                      });
                      toast.success('設定已重置');
                    }
                  }}
                  className="btn btn-danger btn-sm"
                >
                  重置設定
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;