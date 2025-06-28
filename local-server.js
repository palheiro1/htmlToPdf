import http from 'http';
import url from 'url';
import handler from './api/generate-pdf.js';

const PORT = process.env.PORT || 3000;

// Create a simple HTTP server that mimics Vercel's API routing
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // Handle CORS for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Route to the PDF generation API
  if (parsedUrl.pathname === '/api/generate-pdf') {
    // Parse JSON body for POST requests
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          req.body = JSON.parse(body);
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON in request body' }));
          return;
        }
        
        // Call the Vercel handler
        await handler(req, res);
      });
    } else {
      await handler(req, res);
    }
  } else if (parsedUrl.pathname === '/') {
    // Simple test page
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>PDF Service - Local Test</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .test-form { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
          textarea { width: 100%; height: 200px; }
          button { background: #0070f3; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
          button:hover { background: #0051a2; }
        </style>
      </head>
      <body>
        <h1>PDF Generation Service - Local Test</h1>
        <p>Service is running locally on port ${PORT}</p>
        
        <div class="test-form">
          <h3>Test PDF Generation</h3>
          <textarea id="htmlContent" placeholder="Enter HTML content here...">
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #333; }
    .highlight { background-color: yellow; }
  </style>
</head>
<body>
  <h1>Sample PDF Document</h1>
  <p>This is a <span class="highlight">test document</span> to verify PDF generation.</p>
  <ul>
    <li>Feature 1: HTML to PDF conversion</li>
    <li>Feature 2: CSS styling support</li>
    <li>Feature 3: Modern Puppeteer integration</li>
  </ul>
  <p>Generated on: ${new Date().toISOString()}</p>
</body>
</html>
          </textarea>
          <br><br>
          <button onclick="generatePDF()">Generate PDF</button>
        </div>
        
        <script>
          async function generatePDF() {
            const html = document.getElementById('htmlContent').value;
            
            try {
              const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  html: html,
                  options: {
                    format: 'A4',
                    printBackground: true,
                    filename: 'test-local.pdf'
                  }
                })
              });
              
              if (!response.ok) {
                throw new Error('Failed to generate PDF');
              }
              
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'test-local.pdf';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
              
              alert('PDF generated and downloaded successfully!');
            } catch (error) {
              alert('Error: ' + error.message);
            }
          }
        </script>
      </body>
      </html>
    `);
  } else {
    // 404 for other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Local PDF service running on http://localhost:${PORT}`);
  console.log(`📄 Test page: http://localhost:${PORT}`);
  console.log(`🔧 API endpoint: http://localhost:${PORT}/api/generate-pdf`);
});
