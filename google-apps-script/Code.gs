/**
 * TEDx Thyna speaker application receiver.
 *
 * Create/open the destination Google Sheet, then use Extensions > Apps Script
 * and deploy this file as a Web app (Execute as Me, access Anyone).
 */
const SHEET_NAME = "Speaker Applications";
const WEBHOOK_SECRET = "CHANGE_ME_TO_A_LONG_RANDOM_SECRET";
// Optional: set a Drive folder ID. Leave blank to save photos in My Drive root.
const DRIVE_FOLDER_ID = "";

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
  var lock = LockService.getScriptLock();
  var lockAcquired = false;
  try {
    var body = JSON.parse(e.postData.contents || "{}");
    if (WEBHOOK_SECRET && WEBHOOK_SECRET !== "CHANGE_ME_TO_A_LONG_RANDOM_SECRET" && body.secret !== WEBHOOK_SECRET) {
      return jsonResponse({ ok: false, error: "Unauthorized" });
    }

    lockAcquired = lock.tryLock(5000);
    if (!lockAcquired) return jsonResponse({ ok: false, error: "Busy, please retry" });

    if (!body.photoUrl || body.photoUrl === "Photo upload unavailable") {
      body.photoUrl = savePhoto(body);
    }
    var sheet = getSheet();
    sheet.appendRow(HEADERS.map(function (header) { return valueForHeader(body, header); }));
    return jsonResponse({ ok: true, photoUrl: body.photoUrl });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: String(error) });
  } finally {
    if (lockAcquired) lock.releaseLock();
  }
}

function savePhoto(body) {
  if (!body.photoData || !body.photoName || !body.photoMimeType) return "Photo unavailable";
  var match = String(body.photoData).match(/^data:(image\/(?:jpeg|png));base64,([A-Za-z0-9+/=]+)$/);
  if (!match || match[1] !== body.photoMimeType) throw new Error("Invalid photo data");
  var bytes = Utilities.base64Decode(match[2]);
  if (!bytes.length || bytes.length > 5 * 1024 * 1024) throw new Error("Photo must be 5 MB or smaller");
  var safeName = String(body.photoName).replace(/[^a-zA-Z0-9._-]/g, "-");
  var blob = Utilities.newBlob(bytes, body.photoMimeType, safeName);
  var file = DRIVE_FOLDER_ID ? DriveApp.getFolderById(DRIVE_FOLDER_ID).createFile(blob) : DriveApp.createFile(blob);
  file.setName("TEDx Thyna - " + safeName);
  return file.getUrl();
}

function getSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function valueForHeader(body, header) {
  var fields = {
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
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
