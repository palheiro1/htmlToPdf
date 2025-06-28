#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3000/api/generate-pdf';

async function testPDFGeneration() {
  const testHTML = `
    <html>
    <head>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 40px; 
          line-height: 1.6; 
        }
        h1 { 
          color: #2c3e50; 
          border-bottom: 3px solid #3498db; 
          padding-bottom: 10px; 
        }
        .highlight { 
          background-color: #f39c12; 
          color: white; 
          padding: 2px 8px; 
          border-radius: 4px; 
        }
        .feature-list {
          background-color: #ecf0f1;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #bdc3c7;
          font-size: 0.9em;
          color: #7f8c8d;
        }
      </style>
    </head>
    <body>
      <h1>PDF Generation Test Report</h1>
      
      <p>This document demonstrates the <span class="highlight">HTML to PDF conversion</span> capabilities of our microservice.</p>
      
      <div class="feature-list">
        <h3>✅ Features Tested:</h3>
        <ul>
          <li><strong>Modern Dependencies:</strong> @sparticuz/chromium v131.0.0</li>
          <li><strong>Latest Puppeteer:</strong> puppeteer-core v23.11.1</li>
          <li><strong>Local Development:</strong> Node.js HTTP server</li>
          <li><strong>CSS Styling:</strong> Fonts, colors, layouts</li>
          <li><strong>Buffer Handling:</strong> Proper PDF binary output</li>
        </ul>
      </div>
      
      <h3>🔧 Technical Details:</h3>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr style="background-color: #34495e; color: white;">
          <th style="padding: 10px;">Component</th>
          <th style="padding: 10px;">Version/Status</th>
        </tr>
        <tr>
          <td style="padding: 8px;">Chromium</td>
          <td style="padding: 8px;">@sparticuz/chromium ^131.0.0</td>
        </tr>
        <tr style="background-color: #f8f9fa;">
          <td style="padding: 8px;">Puppeteer Core</td>
          <td style="padding: 8px;">^23.11.1</td>
        </tr>
        <tr>
          <td style="padding: 8px;">Node.js</td>
          <td style="padding: 8px;">${process.version}</td>
        </tr>
        <tr style="background-color: #f8f9fa;">
          <td style="padding: 8px;">API Status</td>
          <td style="padding: 8px;">✅ Working</td>
        </tr>
      </table>
      
      <div class="footer">
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Test Environment:</strong> Local Development Server</p>
      </div>
    </body>
    </html>
  `;

  const requestBody = {
    html: testHTML,
    options: {
      format: 'A4',
      printBackground: true,
      filename: 'cli-test-report.pdf',
      margin: {
        top: '30px',
        right: '30px',
        bottom: '30px',
        left: '30px'
      }
    }
  };

  try {
    console.log('🚀 Testing PDF generation via CLI...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const pdfBuffer = await response.arrayBuffer();
    const filename = 'cli-test-report.pdf';
    
    fs.writeFileSync(filename, Buffer.from(pdfBuffer));
    
    const stats = fs.statSync(filename);
    console.log(`✅ PDF generated successfully!`);
    console.log(`📁 File: ${path.resolve(filename)}`);
    console.log(`📏 Size: ${stats.size.toLocaleString()} bytes`);
    console.log(`🕒 Created: ${stats.mtime.toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error.message);
    process.exit(1);
  }
}

// Run the test
testPDFGeneration();
