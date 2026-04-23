const CRM_ENDPOINT = 'https://rashim.telhai.ac.il/Portals/api/M3Api/Data?requestId=1';
const CAMPAIGN_ID  = '14';
const SOURCE_ID    = '13';
const DEFAULT_DEPT = '61';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Invalid JSON' }),
    };
  }

  const { fullName, phone, email, department } = parsed;

  if (!fullName || !phone || !email) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'שדות חסרים: שם מלא, טלפון ומייל הם שדות חובה' }),
    };
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
    return {
      statusCode: 503,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'לא ניתן להגיע ל-CRM' }),
    };
  }

  const resultText = await crmResponse.text();

  if (!crmResponse.ok) {
    console.error('CRM returned error:', crmResponse.status, resultText);
    return {
      statusCode: 502,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'שגיאה ממערכת מכלול', detail: resultText }),
    };
  }

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({ success: true }),
  };
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin':  process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type':                 'application/json',
  };
}
