import { google } from "googleapis";

export default async function handler(req, res) {

if (req.method !== "POST") {
return res.status(405).json({ error: "Method not allowed" });
}

try {

const { name, email, amount } = req.body;

const auth = new google.auth.JWT(
process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
null,
process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
["https://www.googleapis.com/auth/spreadsheets"]
);

const sheets = google.sheets({ version: "v4", auth });

await sheets.spreadsheets.values.append({
spreadsheetId: "TON_SHEET_ID",
range: "Sheet1!A:E",
valueInputOption: "USER_ENTERED",
requestBody: {
values: [[
new Date().toLocaleString(),
name,
email,
amount,
"Payé Stripe"
]]
}
});

res.status(200).json({ success: true });

} catch (error) {

console.log(error);

res.status(500).json({ error: "Erreur serveur" });

}

}