// data/mockData.js

// 模擬不同角色的用戶
export const mockUsers = {
  admin: { 
    uid: 'admin1', 
    email: 'admin@company.com', 
    displayName: 'Admin User', 
    role: 'admin',
    employeeId: 'emp_admin'
  },
  manager: { 
    uid: 'manager1', 
    email: 'manager@company.com', 
    displayName: 'Manager User', 
    role: 'manager',
    employeeId: 'emp1',
    department: '技術部'
  },
  employee: { 
    uid: 'employee1', 
    email: 'employee@company.com', 
    displayName: 'Employee User', 
    role: 'employee',
    employeeId: 'emp2',
    department: '技術部'
  }
};

// 模擬員工數據
export const mockEmployees = [
  { 
    id: 'emp1', 
    name: '張小明', 
    email: 'ming@company.com', 
    role: 'manager', 
    department: '技術部', 
    workHours: { start: '09:00', end: '18:00' },
    userId: 'manager1'
  },
  { 
    id: 'emp2', 
    name: '李小華', 
    email: 'hua@company.com', 
    role: 'employee', 
    department: '技術部', 
    workHours: { start: '09:30', end: '18:30' },
    userId: 'employee1'
  },
  { 
    id: 'emp3', 
    name: '王小美', 
    email: 'mei@company.com', 
    role: 'employee', 
    department: '業務部', 
    workHours: { start: '09:00', end: '18:00' },
    userId: 'employee2'
  },
  { 
    id: 'emp4', 
    name: '陳大華', 
    email: 'chen@company.com', 
    role: 'employee', 
    department: '人事部', 
    workHours: { start: '09:00', end: '18:00' },
    userId: 'employee3'
  },
  {
    id: 'emp_admin',
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'admin',
    department: '管理部',
    workHours: { start: '08:30', end: '18:00' },
    userId: 'admin1'
  }
];

export const mockAttendanceRecords = [
  { id: '1', employeeId: 'emp1', date: '2025-06-08', checkIn: '09:05', checkOut: '18:10', status: 'normal' },
  { id: '2', employeeId: 'emp2', date: '2025-06-08', checkIn: '09:25', checkOut: null, status: 'working' },
  { id: '3', employeeId: 'emp3', date: '2025-06-08', checkIn: '09:15', checkOut: '18:05', status: 'late' },
  { id: '4', employeeId: 'emp1', date: '2025-06-07', checkIn: '09:15', checkOut: '18:05', status: 'late' },
  { id: '5', employeeId: 'emp2', date: '2025-06-07', checkIn: '09:00', checkOut: '18:00', status: 'normal' },
  { id: '6', employeeId: 'emp_admin', date: '2025-06-08', checkIn: '08:45', checkOut: '19:00', status: 'normal' },
  { id: '7', employeeId: 'emp_admin', date: '2025-06-07', checkIn: '08:50', checkOut: '18:30', status: 'normal' },
];

// 請假單數據
export const mockLeaveRequests = [
  {
    id: 'leave1',
    employeeId: 'emp2',
    type: 'sick',
    startDate: '2025-06-10',
    endDate: '2025-06-11',
    days: 2,
    reason: '感冒發燒需要休息',
    status: 'pending',
    appliedAt: '2025-06-08T10:30:00',
    reviewedAt: null,
    reviewedBy: null,
    reviewComment: null
  },
  {
    id: 'leave2',
    employeeId: 'emp3',
    type: 'personal',
    startDate: '2025-06-15',
    endDate: '2025-06-15',
    days: 1,
    reason: '家庭事務處理',
    status: 'approved',
    appliedAt: '2025-06-07T14:20:00',
    reviewedAt: '2025-06-07T16:45:00',
    reviewedBy: 'emp1',
    reviewComment: '同意請假'
  },
  {
    id: 'leave3',
    employeeId: 'emp2',
    type: 'annual',
    startDate: '2025-06-20',
    endDate: '2025-06-22',
    days: 3,
    reason: '年假旅遊',
    status: 'rejected',
    appliedAt: '2025-06-06T09:15:00',
    reviewedAt: '2025-06-06T11:30:00',
    reviewedBy: 'emp1',
    reviewComment: '該時段部門人力不足，建議改期'
  }
];