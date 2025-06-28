# 📄 Puppeteer PDF Microservice

A simple HTTP microservice that receives raw HTML (with optional CSS) and returns a PDF rendered using Puppeteer. Designed for easy deployment on Vercel.

---

## 🚀 Features
- Accepts POST requests with HTML content
- Returns a production-quality PDF
- Headless Chromium (via Puppeteer) for full HTML/CSS support
- Ready for integration with Supabase Edge Functions or any backend

---

## 🧱 Project Structure
```
pdf-service/
├── api/
│   └── generate-pdf.js
├── package.json
├── vercel.json
├── .vercel/
├── .gitignore
└── README.md
```

---

## ⚙️ Usage

### 1. Deploy to Vercel
```
npx vercel login
npx vercel link
npx vercel deploy --prod
```

### 2. Generate a PDF
Send a POST request to your deployed endpoint:
```
curl -X POST https://your-vercel-url/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"html": "<html><body><h1>Hello PDF</h1></body></html>"}' --output test.pdf
```

---

## 🔒 Security (Optional)
- Add API key checks in the handler for production use
- Restrict CORS as needed

---

## 📦 Improvements
- Accept external CSS or URLs
- Add PDF config options (landscape, margins, etc.)
- Upload PDFs directly to storage (S3, Supabase, etc.)

---

## 💡 Notes
- Vercel serverless functions require `chrome-aws-lambda` and `puppeteer-core` for headless Chromium
- For public endpoints, ensure Vercel project protection is disabled
- Alternatives: Railway, Render, Fly.io for more control

---

## 🏁 License
MIT
