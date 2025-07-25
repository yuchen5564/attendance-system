/**
 * 出勤管理系統 - Google App Script 郵件服務
 * 
 * 部署步驟：
 * 1. 在 Google Apps Script (https://script.google.com) 創建新專案
 * 2. 貼上此程式碼
 * 3. 啟用 Gmail API 服務
 * 4. 部署為 Web 應用程式，設定執行身分為「我」，存取權限為「任何人」
 * 5. 複製部署後的 Web 應用程式 URL 中的 Script ID
 * 6. 將 Script ID 設定到前端的環境變數 REACT_APP_GAS_SCRIPT_ID
 */

/**
 * 處理 POST 請求發送郵件
 */
function doPost(e) {
  try {
    // 解析請求資料
    const requestData = JSON.parse(e.postData.contents);
    
    // 驗證必要欄位
    if (!requestData.to || !requestData.subject || !requestData.textContent) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: '缺少必要的郵件欄位'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 發送郵件
    const result = sendEmail(requestData);
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('處理 POST 請求錯誤:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 處理 GET 請求（JSONP 方式發送郵件）
 */
function doGet(e) {
  try {
    const params = e.parameter;
    
    // 檢查是否為 JSONP 回調請求
    if (params.callback) {
      let emailData;
      
      // 檢查是否使用 payload 參數傳遞 JSON 資料
      if (params.payload) {
        try {
          emailData = JSON.parse(params.payload);
        } catch (parseError) {
          console.error('解析 payload 失敗:', parseError);
          const errorResponse = `${params.callback}(${JSON.stringify({
            success: false,
            error: '無效的 JSON 格式: ' + parseError.toString()
          })})`;
          return ContentService
            .createTextOutput(errorResponse)
            .setMimeType(ContentService.MimeType.JAVASCRIPT);
        }
      } else {
        // 舊版格式支援
        emailData = {
          to: params.to,
          subject: params.subject,
          textContent: params.textContent,
          from: {
            email: params.fromEmail,
            name: params.fromName
          }
        };
      }
      
      console.log('收到郵件請求:', emailData);
      
      // 發送郵件
      const result = sendEmail(emailData);
      
      // 返回 JSONP 回調
      const response = `${params.callback}(${JSON.stringify(result)})`;
      return ContentService
        .createTextOutput(response)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    // 一般測試請求
    return ContentService
      .createTextOutput(JSON.stringify({
        message: '出勤管理系統郵件服務運作中',
        timestamp: new Date().toISOString(),
        version: '1.1'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('處理 GET 請求錯誤:', error);
    
    if (e.parameter && e.parameter.callback) {
      // JSONP 錯誤回調
      const errorResponse = `${e.parameter.callback}(${JSON.stringify({
        success: false,
        error: error.toString()
      })})`;
      return ContentService
        .createTextOutput(errorResponse)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 核心郵件發送功能
 */
function sendEmail(emailData) {
  try {
    // 準備郵件選項
    const options = {
      name: emailData.from?.name || '出勤管理系統',
      replyTo: emailData.from?.email || 'noreply@company.com'
    };

    // 如果有 HTML 內容，使用 HTML；否則使用純文字
    if (emailData.htmlContent) {
      options.htmlBody = emailData.htmlContent;
    }

    // 發送郵件
    GmailApp.sendEmail(
      emailData.to,
      emailData.subject,
      emailData.textContent,
      options
    );

    console.log(`郵件發送成功: ${emailData.to} - ${emailData.subject}`);
    
    return {
      success: true,
      message: '郵件發送成功',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('郵件發送失敗:', error);
    
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 測試郵件發送功能
 */
function testEmailSending() {
  const testData = {
    to: 'your-test-email@gmail.com', // 請替換為你的測試郵件
    subject: '測試郵件 - 出勤管理系統',
    textContent: '這是一封測試郵件，用於驗證 Google App Script 郵件服務是否正常運作。',
    from: {
      name: '出勤管理系統',
      email: 'noreply@company.com'
    }
  };
  
  const result = sendEmail(testData);
  console.log('測試結果:', result);
  return result;
}