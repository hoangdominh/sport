/**
 * HƯỚNG DẪN SỬ DỤNG:
 * 1. Mở Google Sheet của bạn
 * 2. Vào menu: Extensions → Apps Script
 * 3. Xóa code cũ, dán toàn bộ đoạn này vào
 * 4. Nhấn Run (▶) → chọn hàm "setupSportTracker"
 * 5. Cấp quyền khi được hỏi → Done!
 *
 * Script sẽ tự động tạo 4 tab với đúng headers:
 *   sessions | expenses | payments | votes
 */

function setupSportTracker() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const sheets = {
    sessions: ['id', 'sport', 'date', 'participants', 'created_at'],
    expenses: ['id', 'session_id', 'payer', 'amount', 'note', 'created_at'],
    payments: ['id', 'session_id', 'player', 'created_at'],
    votes:    ['id', 'type', 'option', 'voter', 'created_at'],
  };

  Object.entries(sheets).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);

    // Tạo mới nếu chưa có
    if (!sheet) {
      sheet = ss.insertSheet(name);
      Logger.log('Đã tạo tab: ' + name);
    } else {
      Logger.log('Tab đã tồn tại, cập nhật headers: ' + name);
    }

    // Ghi headers vào dòng 1
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f0f0f0');

    // Auto-resize columns
    sheet.autoResizeColumns(1, headers.length);
  });

  // Xoá sheet mặc định "Sheet1" nếu còn
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
    Logger.log('Đã xóa Sheet1 mặc định');
  }

  SpreadsheetApp.getUi().alert(
    '✅ Setup xong!\n\n' +
    'Đã tạo 4 tabs:\n' +
    '• sessions   → lưu thông tin mỗi buổi chơi\n' +
    '• expenses   → lưu chi tiêu trong buổi\n' +
    '• payments   → theo dõi ai đã trả tiền\n' +
    '• votes      → vote lịch và bộ môn\n\n' +
    'Bước tiếp theo:\n' +
    '1. Vào sheetdb.io → Create API → dán link Google Sheet này\n' +
    '2. Copy API URL → dán vào file .env của project'
  );
}
