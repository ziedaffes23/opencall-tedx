# Send speaker applications to Google Sheets

The application endpoint now saves the application in the existing database and forwards the same submission to a Google Sheet. The browser never receives Google credentials.

## 1. Create the destination sheet

Create a Google Sheet (for example, **TEDx Thyna Speaker Applications**) in the Google account that should own the applications. No columns need to be added manually: the receiver creates a `Speaker Applications` tab and its header row on the first request.

## 2. Add the receiver

Open **Extensions → Apps Script** from that spreadsheet. Replace the default script with [`google-apps-script/Code.gs`](google-apps-script/Code.gs). Change `WEBHOOK_SECRET` from the placeholder to a long random value, for example a 32-character password. Keep that value private. The updated script saves each uploaded JPG/PNG to Google Drive and writes the Drive link in the `Photo URL` column. Optionally set `DRIVE_FOLDER_ID` to the ID of a Drive folder where photos should be stored.

Deploy it using **Deploy → New deployment → Web app** with:

| Setting | Value |
|---|---|
| Execute as | Me (the sheet owner) |
| Who has access | Anyone |

Before deploying, select **`authorizeServices`** from the function dropdown at the top of the Apps Script editor and click **Run**. This function intentionally calls both Sheets and Drive so Google displays the authorization flow. If Google shows a warning, click **Review permissions → Advanced → Go to project → Allow**. Copy the resulting web-app URL; it must look like `https://script.google.com/macros/s/.../exec`. The receiver is designed to append the application row even if Drive authorization is unavailable; in that case it marks the photo cell for follow-up instead of rejecting the application. When updating an existing deployment, use **Deploy → Manage deployments → Edit → New version → Deploy** so the new photo-saving code becomes live.

## 3. Configure Vercel

In the Vercel project settings for `opencall-tedx`, add these variables for **Production** and **Preview**:

```text
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
GOOGLE_SHEETS_WEBHOOK_SECRET=the-same-secret-used-in-Code.gs
```

Redeploy after saving the variables. Do not put either value in client-side code or commit them to Git.

## 4. Behavior and verification

Every successful form submission is sent as one new row. The receiver uses a script lock so simultaneous submissions do not collide, creates the headers automatically, and returns an error if the shared secret is invalid. The server uses a 10-second timeout and one retry. If Sheets is configured but unavailable, the form reports an error rather than falsely showing the success page; the database record may still exist and can be retried or reconciled.

To verify the receiver before a real submission, open the deployment URL in a browser. It should return JSON containing `"ok": true`. Then submit one test application and confirm that a new row appears in the `Speaker Applications` tab.

## Local tests

```bash
pnpm test
pnpm check
```
