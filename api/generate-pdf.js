import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let browser = null;

  try {
    const { html, options = {} } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'Missing HTML content' });
    }

    // Launch browser with improved configuration
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    
    // Set content and wait for it to load properly
    await page.setContent(html, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000 
    });

    // Add small delay to ensure everything is rendered
    await page.waitForTimeout(500);

    // PDF generation options with better defaults
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
      ...options
    };

    // Generate PDF buffer
    const pdfBuffer = await page.pdf(pdfOptions);
    
    await browser.close();
    browser = null;

    // Validate PDF buffer
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Generated PDF buffer is empty');
    }

    console.log(`PDF generated successfully. Size: ${pdfBuffer.length} bytes`);

    // Set proper response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    
    if (options.download !== false) {
      res.setHeader('Content-Disposition', `attachment; filename="${options.filename || 'document.pdf'}"`);
    }

    // Send PDF buffer properly
    return res.end(pdfBuffer);

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

    return res.status(500).json({ 
      error: 'Failed to generate PDF', 
      details: error.message 
    });
  }
}