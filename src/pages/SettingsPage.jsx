// 文件位置: src/pages/SettingsPage.jsx

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Button, 
  Space, 
  Typography, 
  Empty,
  Tabs,
  App
} from 'antd';
import { 
  SettingOutlined, 
  SaveOutlined, 
  ReloadOutlined, 
  LockOutlined, 
  TeamOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { systemService } from '../firebase/systemService';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePagination } from '../hooks/usePagination';
import GeneralSettings from '../components/settings/GeneralSettings';
import DepartmentManagement from '../components/settings/DepartmentManagement';
import DepartmentModal from '../components/settings/DepartmentModal';
import { createDepartmentColumns } from '../utils/departmentTableConfig';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const SettingsPage = () => {
  const { 
    userData, 
    isAdmin, 
    systemSettings, 
    updateSystemSettings, 
    loadSystemSettings,
    addDepartment,
    deleteDepartment,
    updateDepartment
  } = useAuth();
  const { message } = App.useApp();
  
  // 表單實例
  const [form] = Form.useForm();
  const [departmentForm] = Form.useForm();
  
  // 狀態管理
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [departmentModalVisible, setDepartmentModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [activeTab, setActiveTab] = useState('general');

  // 部門分頁相關
  const {
    currentPage,
    itemsPerPage,
    totalItems,
    paginatedData: paginatedDepartments,
    setCurrentPage,
    setItemsPerPage,
    resetToFirstPage
  } = usePagination(departments, 10);

  useEffect(() => {
    if (isAdmin) {
      loadSettings();
    }
  }, [isAdmin]);

  useEffect(() => {
    // 當系統設定載入後，填入表單和部門列表
    if (systemSettings) {
      fillFormWithSettings(systemSettings);
      const deptList = systemSettings.departments || [];
      setDepartments(deptList);
      // 當部門列表更新時，重置分頁
      resetToFirstPage();
    }
  }, [systemSettings, form, resetToFirstPage]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      await loadSystemSettings();
    } catch (error) {
      console.error('載入設定失敗:', error);
      message.error('載入設定失敗');
    } finally {
      setLoading(false);
    }
  };

  const fillFormWithSettings = (settings) => {
    form.setFieldsValue({
      companyName: settings.company?.name || '企業打卡系統',
      companyAddress: settings.company?.address || '',
      companyPhone: settings.company?.phone || '',
      companyEmail: settings.company?.email || '',
      defaultWorkingHours: [
        dayjs(settings.workingHours?.defaultStart || '09:00', 'HH:mm'),
        dayjs(settings.workingHours?.defaultEnd || '18:00', 'HH:mm')
      ],
      flexibleWorkingHours: settings.workingHours?.flexible || false,
      allowEarlyClockIn: settings.attendance?.allowEarlyClockIn || 30,
      allowLateClockOut: settings.attendance?.allowLateClockOut || 30,
      autoClockOut: settings.attendance?.autoClockOut || false,
      requireApproval: settings.leave?.requireApproval !== false, // 預設為 true
      maxAdvanceDays: settings.leave?.maxAdvanceDays || 30,
      allowSameDay: settings.leave?.allowSameDay || false,
      emailNotifications: settings.notifications?.emailNotifications !== false, // 預設為 true
      reminderTime: dayjs(settings.notifications?.reminderTime || '08:30', 'HH:mm'),
      weekendReminders: settings.notifications?.weekendReminders || false
    });
  };

  const handleSave = async (values) => {
    try {
      setSaving(true);
      
      // 構建新的設定物件，保留現有的部門列表
      const newSettings = {
        company: {
          name: values.companyName,
          address: values.companyAddress,
          phone: values.companyPhone,
          email: values.companyEmail
        },
        workingHours: {
          defaultStart: values.defaultWorkingHours[0].format('HH:mm'),
          defaultEnd: values.defaultWorkingHours[1].format('HH:mm'),
          flexible: values.flexibleWorkingHours
        },
        attendance: {
          allowEarlyClockIn: values.allowEarlyClockIn,
          allowLateClockOut: values.allowLateClockOut,
          autoClockOut: values.autoClockOut
        },
        leave: {
          requireApproval: values.requireApproval,
          maxAdvanceDays: values.maxAdvanceDays,
          allowSameDay: values.allowSameDay
        },
        notifications: {
          emailNotifications: values.emailNotifications,
          reminderTime: values.reminderTime.format('HH:mm'),
          weekendReminders: values.weekendReminders
        },
        // 保留現有的部門列表
        departments: systemSettings?.departments || []
      };

      // 更新系統設定
      await updateSystemSettings(newSettings);
      
      message.success('設定已儲存');
    } catch (error) {
      console.error('儲存設定失敗:', error);
      message.error('儲存設定失敗：' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      await systemService.resetSystemSettings();
      await loadSystemSettings();
      message.success('設定已重置為預設值');
    } catch (error) {
      console.error('重置設定失敗:', error);
      message.error('重置設定失敗：' + error.message);
    }
  };

  // 部門管理相關函數
  const handleAddDepartment = () => {
    setEditingDepartment(null);
    departmentForm.resetFields();
    setDepartmentModalVisible(true);
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    departmentForm.setFieldsValue({
      name: department.name,
      description: department.description
    });
    setDepartmentModalVisible(true);
  };

  const handleDeleteDepartment = async (departmentId) => {
    try {
      await deleteDepartment(departmentId);
      message.success('部門已刪除');
      // 如果刪除後當前頁沒有資料，回到上一頁
      if (paginatedDepartments.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      message.error('刪除部門失敗：' + error.message);
    }
  };

  const handleDepartmentSubmit = async (values) => {
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, values);
        message.success('部門已更新');
      } else {
        await addDepartment(values);
        message.success('部門已新增');
      }
      setDepartmentModalVisible(false);
      departmentForm.resetFields();
      setEditingDepartment(null);
    } catch (error) {
      message.error(editingDepartment ? '更新部門失敗：' : '新增部門失敗：' + error.message);
    }
  };

  const handleDepartmentModalCancel = () => {
    setDepartmentModalVisible(false);
    departmentForm.resetFields();
    setEditingDepartment(null);
  };

  // 生成部門表格欄位
  const departmentColumns = createDepartmentColumns(handleEditDepartment, handleDeleteDepartment);

  // 權限檢查
  if (!isAdmin) {
    return (
      <Card>
        <Empty
          image={<LockOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
          description={
            <div>
              <Title level={4}>權限不足</Title>
              <p>只有系統管理員可以訪問系統設定</p>
            </div>
          }
        />
      </Card>
    );
  }

  // 載入中狀態
  if (loading) {
    return <LoadingSpinner text="載入系統設定中..." />;
  }

  return (
    <div>
      {/* 頁面標題和操作按鈕 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px' 
      }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>系統設定</Title>
          <Text type="secondary">管理系統全域設定和參數</Text>
        </div>
        {activeTab === 'general' && (
          <Button
            type="primary"
            icon={saving ? <ReloadOutlined spin /> : <SaveOutlined />}
            loading={saving}
            onClick={() => form.submit()}
          >
            {saving ? '儲存中...' : '儲存設定'}
          </Button>
        )}
      </div>

      {/* 分頁內容 */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'general',
            label: (
              <Space>
                <SettingOutlined />
                一般設定
              </Space>
            ),
            children: (
              <GeneralSettings 
                form={form}
                handleSave={handleSave}
                handleReset={handleReset}
                saving={saving}
              />
            )
          },
          {
            key: 'departments',
            label: (
              <Space>
                <TeamOutlined />
                部門管理
              </Space>
            ),
            children: (
              <DepartmentManagement
                departments={departments}
                paginatedDepartments={paginatedDepartments}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                setCurrentPage={setCurrentPage}
                setItemsPerPage={setItemsPerPage}
                handleAddDepartment={handleAddDepartment}
                handleEditDepartment={handleEditDepartment}
                handleDeleteDepartment={handleDeleteDepartment}
                departmentColumns={departmentColumns}
              />
            )
          }
        ]}
      />

      {/* 部門管理 Modal */}
      <DepartmentModal
        visible={departmentModalVisible}
        editingDepartment={editingDepartment}
        form={departmentForm}
        onSubmit={handleDepartmentSubmit}
        onCancel={handleDepartmentModalCancel}
      />
    </div>
  );
};

export default SettingsPage;