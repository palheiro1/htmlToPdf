import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';

// Disable graphics mode for better serverless compatibility
chromium.setGraphicsMode = false;

// Utility function to handle both Vercel and Node.js HTTP responses
function sendResponse(res, statusCode, data, headers = {}) {
  // Check if data is a Buffer first (before setting headers)
  const isBuffer = Buffer.isBuffer(data);
  
  // Set headers
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  // Handle Vercel-style response (has status method)
  if (typeof res.status === 'function') {
    if (isBuffer) {
      return res.status(statusCode).end(data);
    }
    return res.status(statusCode).json(data);
  }
  
  // Handle Node.js native response
  if (isBuffer) {
    res.writeHead(statusCode, headers);
    return res.end(data);
  }
  
  res.writeHead(statusCode, { ...headers, 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return sendResponse(res, 200, '');
  }

  if (req.method !== 'POST') {
    return sendResponse(res, 405, { error: 'Method Not Allowed' });
  }

  let browser = null;
  
  try {
    const { html, options = {} } = req.body;

    if (!html) {
      return sendResponse(res, 400, { error: 'Missing HTML content' });
    }

    console.log('Starting PDF generation...');
    console.log('Environment - VERCEL:', process.env.VERCEL, 'VERCEL_ENV:', process.env.VERCEL_ENV);

    // Use simplified, conservative browser configuration for maximum compatibility
    // For -min package, use external chromium pack from GitHub releases
    const chromiumPackUrl = 'https://github.com/sparticuz/chromium/releases/download/v119.0.0/chromium-v119.0.0-pack.tar';
    
    const browserOptions = {
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(chromiumPackUrl),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    };

    console.log('Browser configuration:', {
      argsCount: browserOptions.args?.length,
      hasExecutablePath: !!browserOptions.executablePath,
      headless: browserOptions.headless
    });

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

    // Wait for any remaining async operations using setTimeout instead of waitForTimeout
    await new Promise(resolve => setTimeout(resolve, 1000));

    // PDF generation options
    const pdfOptions = {
      format: options.format || 'A4',
      printBackground: options.printBackground !== false,
      margin: options.margin || {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      preferCSSPageSize: false,
      ...options
    };

    console.log('Generating PDF with options:', pdfOptions);

    // Generate PDF
    const pdfBuffer = await page.pdf(pdfOptions);
    
    console.log('PDF generated successfully, size:', pdfBuffer.length);
    console.log('PDF buffer type:', typeof pdfBuffer);
    console.log('Is Buffer:', Buffer.isBuffer(pdfBuffer));
    console.log('First 4 bytes:', pdfBuffer.slice(0, 4));

    await browser.close();
    browser = null;

    // Verify the PDF buffer is valid
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Generated PDF is empty');
    }

    // Send the PDF buffer with proper headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    
    if (options.download !== false) {
      res.setHeader('Content-Disposition', `attachment; filename="${options.filename || 'document.pdf'}"`);
    }

    // Handle different response types
    if (typeof res.status === 'function') {
      // Vercel environment
      return res.status(200).end(pdfBuffer);
    } else {
      // Node.js native HTTP
      res.writeHead(200);
      return res.end(pdfBuffer);
    }

  } catch (error) {
    console.error('PDF generation error:', error);
    console.error('Error stack:', error.stack);
    
    // Ensure browser is closed on error
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    
    // Provide more detailed error information
    const errorDetails = {
      error: 'Failed to generate PDF',
      details: error.message,
      isVercel: !!(process.env.VERCEL || process.env.VERCEL_ENV),
      nodeVersion: process.version,
    };
    
    if (process.env.NODE_ENV === 'development') {
      errorDetails.stack = error.stack;
    }
    
    return sendResponse(res, 500, errorDetails);
  }
}