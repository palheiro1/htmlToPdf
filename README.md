# HTML to PDF Microservice

A high-performance HTML to PDF conversion microservice built with Node.js, Express, and Puppeteer. Deployed on Render.com with Docker for reliability and scalability.

## 🚀 Features

- **High-Quality PDF Generation**: Uses Puppeteer with Chromium for accurate rendering
- **RESTful API**: Simple POST endpoint for PDF generation  
- **Flexible Options**: Support for various PDF formats, margins, backgrounds, and more
- **Docker Deployment**: Containerized for consistent deployment across environments
- **Health Monitoring**: Built-in health check endpoint
- **Production Ready**: Optimized for Render.com cloud deployment

## 📋 API Reference

### Generate PDF

**Endpoint:** `POST /api/generate-pdf`

**Request Body:**
```json
{
  "html": "<html><body><h1>Hello World</h1></body></html>",
  "options": {
    "format": "A4",
    "printBackground": true,
    "margin": {
      "top": "20px",
      "right": "20px", 
      "bottom": "20px",
      "left": "20px"
    },
    "filename": "document.pdf"
  }
}
```

**Response:** PDF file (application/pdf)

### Health Check

**Endpoint:** `GET /health`

Returns service status and metadata.

## 🛠️ Local Development

### Prerequisites

- Node.js 18+
- Docker (optional)

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

The service will be available at `http://localhost:3000`

### Testing

Test the API with curl:

```bash
curl -X POST http://localhost:3000/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><body><h1>Test PDF</h1></body></html>",
    "options": {"format": "A4", "printBackground": true}
  }' \
  --output test.pdf
```

## 🐳 Docker Deployment

### Build locally:

```bash
docker build -t html-to-pdf .
docker run -p 3000:3000 html-to-pdf
```

### Deploy to Render.com:

1. Push your code to GitHub
2. Connect your GitHub repository to Render
3. Render will automatically detect the `render.yaml` configuration
4. Deploy with Docker environment

## 🌐 Production Deployment

This service is optimized for deployment on Render.com with Docker for maximum compatibility and performance.

### Render.com Setup:

1. Fork/clone this repository
2. Create a new Web Service on Render.com
3. Connect your GitHub repository
4. Render will automatically detect the Docker configuration
5. Deploy!

Your service will be available at: `https://your-service-name.onrender.com`

## 📊 Performance

- **Startup Time**: ~3-5 seconds in Docker
- **PDF Generation**: ~1-3 seconds per document  
- **Memory Usage**: ~150-300MB per instance
- **Concurrent Requests**: Supports multiple concurrent PDF generations

## 🔒 Security

- Non-root user execution in Docker
- Input validation and sanitization
- CORS enabled for cross-origin requests
- Request size limits (10MB)

## 📝 License

MIT License
