# הגדרת AWS Lambda + API Gateway

## שלב 1 - יצירת Lambda Function

1. כנס ל-[AWS Lambda Console](https://console.aws.amazon.com/lambda)
2. לחץ **Create function**
3. בחר **Author from scratch**
4. הגדרות:
   - **Function name**: `open-day-form-submit`
   - **Runtime**: `Node.js 20.x`
   - **Architecture**: `x86_64`
5. לחץ **Create function**
6. בלשונית **Code** - העלה את הקובץ `lambda/submit.mjs` (או העתק את תוכנו)
7. שנה את **Handler** ל: `submit.handler`

---

## שלב 2 - Environment Variables

Lambda → **Configuration** → **Environment variables** → **Edit** → **Add environment variable**:

| Key              | Value                                    |
|------------------|------------------------------------------|
| `CRM_USER`       | `VspiritsAPI`                            |
| `CRM_PASSWORD`   | `Vspirits13560`                          |
| `ALLOWED_ORIGIN` | `https://XXXX.cloudfront.net` (ה-domain שלך) |

לחץ **Save**.

---

## שלב 3 - יצירת API Gateway

1. כנס ל-[API Gateway Console](https://console.aws.amazon.com/apigateway)
2. לחץ **Create API** → בחר **HTTP API** (פשוט יותר, זול יותר)
3. **Add integration** → בחר **Lambda** → בחר את `open-day-form-submit`
4. **API name**: `open-day-api`
5. לחץ **Next**

### הגדרת Route
- **Method**: `POST`
- **Resource path**: `/submit`

### הגדרת CORS
בלשונית **CORS** של ה-API:

| הגדרה                    | ערך                                      |
|--------------------------|------------------------------------------|
| **Access-Control-Allow-Origin** | `https://XXXX.cloudfront.net`   |
| **Access-Control-Allow-Headers** | `Content-Type`                 |
| **Access-Control-Allow-Methods** | `POST, OPTIONS`                |

6. לחץ **Next** → **Next** → **Create**

### עדכון ב-main.js
לאחר יצירת ה-API תקבל URL בצורה:
```
https://xxxxxxxxxx.execute-api.REGION.amazonaws.com
```
החלף `REPLACE_WITH_API_GATEWAY_URL` ב-`js/main.js` ב-URL זה + `/submit`.

---

## שלב 4 - בדיקה מ-AWS Console

ב-Lambda → **Test** → צור event חדש עם:
```json
{
  "httpMethod": "POST",
  "body": "{\"firstName\":\"יום\",\"lastName\":\"פתוח\",\"phone\":\"0591234567\",\"email\":\"test@test.com\",\"department\":\"3\"}"
}
```
לחץ **Test** - צפוי לקבל `statusCode: 200`.
