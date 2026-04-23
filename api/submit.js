const CRM_ENDPOINT = 'https://rashim.telhai.ac.il/Portals/api/M3Api/Data?requestId=1';
const CAMPAIGN_ID  = '14';
const SOURCE_ID    = '13';
const DEFAULT_DEPT = '61';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { fullName, phone, email, department } = req.body || {};

  if (!fullName || !phone || !email) {
    return res.status(400).json({ error: 'שדות חסרים: שם מלא, טלפון ומייל הם שדות חובה' });
  }

  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName  = nameParts.slice(1).join(' ') || '';

  const crmHeaders = new Headers();
  crmHeaders.append('user',         process.env.CRM_USER);
  crmHeaders.append('password',     process.env.CRM_PASSWORD);
  crmHeaders.append('Content-Type', 'application/json');

  const crmPayload = JSON.stringify({
    FIRSTNAME:  firstName,
    LASTNAME:   lastName,
    CELLULAR:   phone.trim(),
    EMAIL:      email.trim(),
    DEPARTMENT: department || DEFAULT_DEPT,
    CAMPAIGNID: CAMPAIGN_ID,
    SOURCEID:   SOURCE_ID,
  });

  let crmResponse;
  try {
    crmResponse = await fetch(CRM_ENDPOINT, {
      method:   'POST',
      headers:  crmHeaders,
      body:     crmPayload,
      redirect: 'follow',
    });
  } catch (networkErr) {
    console.error('Network error reaching CRM:', networkErr);
    return res.status(503).json({ error: 'לא ניתן להגיע ל-CRM' });
  }

  const resultText = await crmResponse.text();

  if (!crmResponse.ok) {
    console.error('CRM returned error:', crmResponse.status, resultText);
    return res.status(502).json({ error: 'שגיאה ממערכת מכלול', detail: resultText });
  }

  return res.status(200).json({ success: true });
}
