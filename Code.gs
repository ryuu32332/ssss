/**
 * Link this script to your Google Sheet (Extensions → Apps Script),
 * make sure there is a tab named "Orders" with headers in row 1:
 * name | phone | address | payment | items | total
 */
const SHEET_NAME = 'Orders';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Sheet tab "Orders" not found');

    // Ensure headers exist
    const headerRange = sheet.getRange(1,1,1,6);
    const headers = headerRange.getValues()[0];
    const wanted = ['name','phone','address','payment','items','total'];
    if (headers.join('') === '' || headers.length < 6) {
      headerRange.setValues([wanted]);
    }

    sheet.appendRow([
      data.name || '',
      data.phone || '',
      data.address || '',
      data.payment || '',
      Array.isArray(data.items) ? data.items.join(', ') : (data.items || ''),
      data.total || ''
    ]);

    return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const action = e.parameter.action || '';
  if (action === 'getOrders') {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const headers = values.shift();
    const rows = values.map(r => {
      const obj = {};
      headers.forEach((h, i) => obj[String(h).trim().toLowerCase()] = r[i]);
      return obj;
    });
    return ContentService.createTextOutput(JSON.stringify(rows))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(JSON.stringify({ ok:true }))
    .setMimeType(ContentService.MimeType.JSON);
}
