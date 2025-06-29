import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'PDF Generator',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'PDF Generation Microservice',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      generatePdf: 'POST /api/generate-pdf'
    },
    documentation: 'Send POST request to /api/generate-pdf with { html: "...", options: {...} }'
  });
});

// PDF generation endpoint
app.post('/api/generate-pdf', async (req, res) => {
  let browser = null;

  try {
    const { html, options = {} } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'Missing HTML content' });
    }

    console.log('Starting PDF generation...');
    console.log('Request from:', req.ip);

    // Configure browser options for different environments
    let browserOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      defaultViewport: {
        width: 1920,
        height: 1080
      }
    };

    // Use system Chrome on Render.com
    if (process.env.RENDER || process.env.PUPPETEER_EXECUTABLE_PATH) {
      browserOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable';
      console.log('Using system Chrome for Render.com:', browserOptions.executablePath);
    } else {
      console.log('Using bundled Chromium for local development');
    }

    // Launch browser
    browser = await puppeteer.launch(browserOptions);

    console.log('Browser launched successfully');

    const page = await browser.newPage();
    
    // Set content with proper wait conditions
    await page.setContent(html, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000 
    });

    console.log('Content loaded successfully');

    // Wait for any dynamic content using setTimeout instead of waitForTimeout
    await new Promise(resolve => setTimeout(resolve, 1000));

    // PDF generation options with sensible defaults
    const pdfOptions = {
      format: options.format || 'A4',
      printBackground: options.printBackground !== false,
      margin: options.margin || {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      ...options
    };

    console.log('Generating PDF with options:', JSON.stringify(pdfOptions, null, 2));

    // Generate PDF
    const pdfBuffer = await page.pdf(pdfOptions);
    
    await browser.close();
    browser = null;

    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    // Verify the PDF buffer is valid
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Generated PDF is empty');
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    
    if (options.download !== false) {
      res.setHeader('Content-Disposition', `attachment; filename="${options.filename || 'document.pdf'}"`);
    }

    // Send PDF buffer
    res.end(pdfBuffer);

  } catch (error) {
    console.error('PDF generation error:', error);
    
    // Ensure browser is closed on error
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }

    res.status(500).json({ 
      error: 'Failed to generate PDF', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PDF Generation service running on port ${PORT}`);
  console.log(`📄 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API endpoint: http://localhost:${PORT}/api/generate-pdf`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
