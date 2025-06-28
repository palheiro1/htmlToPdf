# 📄 HTML to PDF Microservice

A simple HTTP microservice that receives raw HTML (with optional CSS) and returns a PDF rendered using Puppeteer. Designed for easy deployment on Vercel.

---

## 🚀 Features
- Accepts POST requests with HTML content
- Returns a production-quality PDF
- Headless Chromium (via Puppeteer) for full HTML/CSS support
- Ready for integration with Supabase Edge Functions or any backend
- CORS enabled for web applications

---

## 🧱 Project Structure
```
htmlToPdf/
├── api/
│   ├── generate-pdf.js
│   └── test.js
├── package.json
├── vercel.json
├── .gitignore
└── README.md
```

---

## ⚙️ Usage

### Generate a PDF
Send a POST request to the deployed endpoint:
```bash
curl -X POST https://html-to-pdf-theta.vercel.app/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"html": "<html><body><h1>Hello PDF</h1></body></html>"}' \
  --output test.pdf
```

### With Options
```bash
curl -X POST https://html-to-pdf-theta.vercel.app/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><head><style>body{font-family:Arial;padding:20px;}</style></head><body><h1>Test PDF</h1></body></html>",
    "options": {
      "format": "A4",
      "filename": "document.pdf",
      "margin": {"top": "20px", "bottom": "20px"}
    }
  }' \
  --output test.pdf
```

---

## 🔧 API Reference

### POST `/api/generate-pdf`

**Request Body:**
```json
{
  "html": "<html>...</html>",
  "options": {
    "format": "A4",
    "filename": "document.pdf",
    "printBackground": true,
    "margin": {
      "top": "20px",
      "right": "20px",
      "bottom": "20px",
      "left": "20px"
    }
  }
}
```

**Response:** PDF binary data

---

## 🔒 Security (Optional)
- Add API key checks in the handler for production use
- Restrict CORS as needed for your domain

---

## 🏁 License
MIT
