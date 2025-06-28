# 📄 Puppeteer PDF Microservice Plan (Vercel Deployment)

## 🎯 Goal
Build a self-hosted HTTP microservice that receives raw HTML (with optional CSS) and returns a PDF rendered using Puppeteer. This service will be called from a Supabase Edge Function.

---

## ✅ Why Puppeteer + Vercel

- **Puppeteer** allows full HTML + CSS rendering with precise formatting.
- **Vercel** supports headless Chromium out of the box in serverless functions.
- **Zero cost** with generous free tier.
- **Better than Netlify** for this specific use case.

---

## 🧱 Project Structure

```
pdf-service/
├── api/
│   └── generate-pdf.js
├── package.json
├── .vercel/
└── vercel.json (optional)
```

---

## ⚙️ Step-by-Step Setup

### 1. Initialize Project
```bash
npx create-vercel-app pdf-service
cd pdf-service
npm install puppeteer
```

### 2. Create API Function
File: `api/generate-pdf.js`

```js
import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { html } = req.body;
  if (!html) return res.status(400).send('Missing HTML content');

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new'
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
  res.send(pdf);
}
```

### 3. Deploy to Vercel
```bash
vercel login
vercel deploy --prod
```
After deploy, you'll receive a URL like:
```
https://pdf-service-youruser.vercel.app/api/generate-pdf
```

---

## 🧪 Testing

- Use `curl`, Postman, or Insomnia:
```bash
curl -X POST https://your-url/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"html": "<html><body><h1>Hello PDF</h1></body></html>"}' --output test.pdf
```

---

## 🔒 Optional Security

- Require `Authorization` header with API key
- Add CORS restrictions to only allow your domain

Example snippet:
```js
if (req.headers.authorization !== `Bearer ${process.env.API_KEY}`) {
  return res.status(401).send('Unauthorized');
}
```

---

## 📡 Supabase Edge Function Integration

```ts
const pdfResponse = await fetch("https://your-url/api/generate-pdf", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ html: renderedHtml })
});
const pdfBuffer = new Uint8Array(await pdfResponse.arrayBuffer());
```

---

## 📦 Optional Improvements (Future)

- Accept external CSS via URL or inline
- Render from URL instead of HTML string
- Add PDF config options (landscape, margins)
- Cache templates locally
- Upload directly to storage (S3/Supabase) from inside API

---

## 💡 Notes

- Puppeteer requires Chromium — Vercel has support out of the box.
- Avoid Netlify unless you're using external headless browser services.
- Railway, Fly.io, Render are viable alternatives if you need full container control.

---

## 🏁 Ready to deploy
Once this microservice is deployed and working, you can fully replace your `generateEnhancedSimplePDF()` logic with a POST to this endpoint and get production-quality PDFs from Supabase Edge Functions.

