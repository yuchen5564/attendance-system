import { 
  collection, 
  addDoc, 
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

export const emailService = {
  // 發送郵件
  async sendEmail(emailData) {
    try {
      // 先檢查郵件設定是否存在
      const emailSettings = await this.getEmailSettings();
      if (!emailSettings || !emailSettings.senderEmail) {
        throw new Error('郵件服務未設定，請先在系統設定中配置郵件服務');
      }

      // 獲取 Google App Script ID 從環境變數
      const gasScriptId = import.meta.env.VITE_GAS_SCRIPT_ID;
      if (!gasScriptId) {
        throw new Error('Google App Script ID 未設定，請在環境變數中設定 VITE_GAS_SCRIPT_ID');
      }

      // 構建 GAS Web App URL
      const gasWebAppUrl = `https://script.google.com/macros/s/${gasScriptId}/exec`;

      // 準備發送的資料（配合你的 GAS 程式格式）
      const sendData = {
        to: emailData.to,
        subject: emailData.subject,
        textContent: emailData.body,
        from: {
          email: emailSettings.senderEmail,
          name: emailSettings.senderName || '出勤管理系統'
        }
      };

      // 使用 JSONP 方式發送郵件（避免 CORS 問題）
      console.log('發送郵件資料:', sendData);
      // console.log('GAS URL:', gasWebAppUrl);
      
      const result = await this.sendEmailViaJSONP(gasWebAppUrl, sendData);
      // console.log('GAS 回應:', result);
      
      // 記錄發送結果
      await this.logEmailSend({
        ...emailData,
        status: result.success ? 'sent' : 'failed',
        errorMessage: result.error || null,
        gasResponse: result,
        sentAt: new Date()
      });

      return result;
    } catch (error) {
      console.error('發送郵件錯誤:', error);
      
      // 記錄失敗
      await this.logEmailSend({
        ...emailData,
        status: 'failed',
        errorMessage: error.message,
        sentAt: new Date()
      });
      
      throw error;
    }
  },

  // 使用 JSONP 方式調用 Google App Script（避免 CORS 問題）
  async sendEmailViaJSONP(gasUrl, data) {
    return new Promise((resolve, reject) => {
      const callbackName = 'emailCallback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const script = document.createElement('script');
      
      console.log('JSONP 回調函數名稱:', callbackName);
      
      // 設定全域回調函數
      window[callbackName] = (response) => {
        console.log('收到 JSONP 回應:', response);
        // 清理
        if (script.parentNode) {
          document.body.removeChild(script);
        }
        delete window[callbackName];
        clearTimeout(timeout);
        
        // 確保回應格式正確
        if (typeof response === 'object') {
          resolve(response);
        } else {
          resolve({
            success: false,
            error: '回應格式錯誤: ' + JSON.stringify(response)
          });
        }
      };

      // 設定超時
      const timeout = setTimeout(() => {
        console.warn('JSONP 請求超時');
        // 清理
        if (script.parentNode) {
          document.body.removeChild(script);
        }
        delete window[callbackName];
        reject(new Error('郵件發送超時（30秒）'));
      }, 30000);

      // 構建請求 URL - 使用 payload 參數傳遞 JSON 資料（配合你的 GAS 程式）
      const params = new URLSearchParams({
        payload: JSON.stringify(data),
        callback: callbackName
      });
      
      const fullUrl = `${gasUrl}?${params.toString()}`;
      // console.log('發送 JSONP 請求到:', fullUrl);
      
      script.src = fullUrl;
      script.onerror = (error) => {
        console.error('JSONP 腳本載入錯誤:', error);
        clearTimeout(timeout);
        if (script.parentNode) {
          document.body.removeChild(script);
        }
        delete window[callbackName];
        reject(new Error('無法連接到郵件服務'));
      };

      document.body.appendChild(script);
    });
  },

  // 記錄郵件發送
  async logEmailSend(logData) {
    try {
      await addDoc(collection(db, 'emailLogs'), {
        ...logData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('記錄郵件發送失敗:', error);
    }
  },

  // 獲取郵件設定
  async getEmailSettings() {
    try {
      const docSnap = await getDoc(doc(db, 'systemSettings', 'emailConfig'));
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('獲取郵件設定錯誤:', error);
      return null;
    }
  },

  // 獲取系統設定（用於取得假別資訊）
  async getSystemSettings() {
    try {
      const settingsDoc = await getDoc(doc(db, 'system', 'settings'));
      if (settingsDoc.exists()) {
        return settingsDoc.data();
      }
      return null;
    } catch (error) {
      console.error('獲取系統設定錯誤:', error);
      return null;
    }
  },

  // 更新郵件設定
  async updateEmailSettings(settings) {
    try {
      // 過濾掉 undefined 值
      const cleanSettings = {};
      Object.keys(settings).forEach(key => {
        if (settings[key] !== undefined) {
          cleanSettings[key] = settings[key];
        }
      });

      await updateDoc(doc(db, 'systemSettings', 'emailConfig'), {
        ...cleanSettings,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('更新郵件設定錯誤:', error);
      throw error;
    }
  },

  // 獲取郵件發送記錄
  async getEmailLogs(limit = 50) {
    try {
      const q = collection(db, 'emailLogs');
      const querySnapshot = await getDocs(q);
      const logs = [];
      querySnapshot.forEach((doc) => {
        logs.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return logs.sort((a, b) => b.sentAt - a.sentAt).slice(0, limit);
    } catch (error) {
      console.error('獲取郵件記錄錯誤:', error);
      throw error;
    }
  },

  // 發送請假申請通知郵件
  async sendLeaveRequestNotification(leaveRequest, managerEmail, managerName, employeeName) {
    // 格式化日期
    const formatDate = (date) => {
      if (!date) return '未指定';
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return '日期格式錯誤';
      return d.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '/');
    };

    // 獲取假別名稱（優先使用 typeName，如果沒有則使用 leaveType）
    const leaveTypeName = leaveRequest.typeName || leaveRequest.leaveType || '未指定';

    const subject = `請假申請通知 - ${employeeName}`;
    const body = `
親愛的 ${managerName}，

您有一筆新的請假申請需要審核：

申請人：${employeeName}
請假類型：${leaveTypeName}
請假期間：${formatDate(leaveRequest.startDate)} 至 ${formatDate(leaveRequest.endDate)}
請假天數：${leaveRequest.days || 0} 天
申請原因：${leaveRequest.reason || '未提供'}

請登入系統查看詳細資訊並進行審核。

此為系統自動發送的通知郵件，請勿直接回覆。
    `.trim();

    return await this.sendEmail({
      to: managerEmail,
      subject,
      body,
      type: 'leave_request',
      relatedId: leaveRequest.id,
      recipientName: managerName,
      senderName: employeeName
    });
  },

  // 發送加班申請通知郵件
  async sendOvertimeRequestNotification(overtimeRequest, managerEmail, managerName, employeeName) {
    // 格式化日期
    const formatDate = (date) => {
      if (!date) return '未指定';
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return '日期格式錯誤';
      return d.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '/');
    };

    // 格式化時間
    const formatTime = (time) => {
      if (!time) return '未指定';
      // 如果是 HH:mm 格式直接返回
      if (typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)) {
        return time;
      }
      // 如果是 Date 物件，提取時間部分
      const t = time instanceof Date ? time : new Date(time);
      if (isNaN(t.getTime())) return '時間格式錯誤';
      return t.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };

    const subject = `加班申請通知 - ${employeeName}`;
    const body = `
親愛的 ${managerName}，

您有一筆新的加班申請需要審核：

申請人：${employeeName}
加班日期：${formatDate(overtimeRequest.date)}
加班時間：${formatTime(overtimeRequest.startTime)} 至 ${formatTime(overtimeRequest.endTime)}
加班時數：${overtimeRequest.hours || 0} 小時
申請原因：${overtimeRequest.reason || '未提供'}

請登入系統查看詳細資訊並進行審核。

此為系統自動發送的通知郵件，請勿直接回覆。
    `.trim();

    return await this.sendEmail({
      to: managerEmail,
      subject,
      body,
      type: 'overtime_request',
      relatedId: overtimeRequest.id,
      recipientName: managerName,
      senderName: employeeName
    });
  }
};