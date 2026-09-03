/**
 * TEDx Thyna speaker application receiver.
 *
 * 1. Create/open the destination Google Sheet.
 * 2. Extensions > Apps Script, replace the editor contents with this file.
 * 3. Set SHEET_NAME and WEBHOOK_SECRET below, if desired.
 * 4. Deploy > New deployment > Web app > Execute as Me > Anyone.
 * 5. Put the deployment URL in Vercel as GOOGLE_SHEETS_WEBHOOK_URL.
 */
const SHEET_NAME = "Speaker Applications";
const WEBHOOK_SECRET = "CHANGE_ME_TO_A_LONG_RANDOM_SECRET";

const HEADERS = [
  "Application ID", "Submitted At", "Full Name", "Email", "Phone", "Age",
  "City / Country", "Current Status", "Current Work", "Links", "Idea",
  "Disagreement", "One Thing to Remember", "Area", "Spoken Before",
  "Where They Spoke", "Why Speak", "Photo URL", "Anything Else", "Consent", "Status"
];

function doGet() {
  return jsonResponse({ ok: true, service: "TEDx Thyna speaker applications" });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    if (WEBHOOK_SECRET && WEBHOOK_SECRET !== "CHANGE_ME_TO_A_LONG_RANDOM_SECRET" && body.secret !== WEBHOOK_SECRET) {
      return jsonResponse({ ok: false, error: "Unauthorized" });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = getSheet();
      const row = HEADERS.map(function (header) {
        return valueForHeader(body, header);
      });
      sheet.appendRow(row);
      return jsonResponse({ ok: true });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function valueForHeader(body, header) {
  const fields = {
    "Application ID": "applicationId", "Submitted At": "submittedAt", "Full Name": "fullName",
    "Email": "email", "Phone": "phone", "Age": "age", "City / Country": "cityCountry",
    "Current Status": "currentStatus", "Current Work": "currentWork", "Links": "links",
    "Idea": "idea", "Disagreement": "disagreement", "One Thing to Remember": "oneThing",
    "Area": "area", "Spoken Before": "spokenBefore", "Where They Spoke": "speakingWhere",
    "Why Speak": "whySpeak", "Photo URL": "photoUrl", "Anything Else": "anythingElse",
    "Consent": "consent", "Status": "status"
  };
  return body[fields[header]] ?? "";
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
