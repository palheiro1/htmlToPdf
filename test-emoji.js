#!/usr/bin/env node

const testEmojiPDF = async () => {
  const url = process.argv[2] || 'http://localhost:3000';
  
  const htmlWithEmojis = `
    <html>
    <head>
      <title>Emoji Test</title>
      <style>
        body {
          font-family: 'Noto Color Emoji', 'Noto Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', Arial, sans-serif;
          font-size: 16px;
          line-height: 1.6;
          margin: 40px;
        }
        .emoji-section {
          margin: 20px 0;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        .large-emoji {
          font-size: 2em;
        }
      </style>
    </head>
    <body>
      <h1>🎯 Emoji Support Test</h1>
      
      <div class="emoji-section">
        <h2>Basic Emojis</h2>
        <p>😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇</p>
        <p>🎉 🎊 🎁 🎈 🎂 🎯 🎭 🎪 🎨 🎸</p>
      </div>
      
      <div class="emoji-section">
        <h2>Technical Emojis</h2>
        <p>⚡ 🔧 🔨 ⚙️ 🖥️ 💻 📱 🖨️ ⌨️ 🖱️</p>
        <p>✅ ❌ ⚠️ 🔄 📊 📈 📉 💾 📁 📂</p>
      </div>
      
      <div class="emoji-section">
        <h2>Large Emojis</h2>
        <div class="large-emoji">
          🚀 🐳 ✨ 🎯 🏆 💯 🔥 ⭐ 🌟 🎨
        </div>
      </div>
      
      <div class="emoji-section">
        <h2>Status Report</h2>
        <p>✅ PDF Generation: Working</p>
        <p>✅ Docker Deployment: Success</p>
        <p>✅ Production Ready: True</p>
        <p>🎯 Emoji Support: Testing...</p>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch(`${url}/api/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ html: htmlWithEmojis })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error:', error);
      return;
    }

    const buffer = await response.arrayBuffer();
    const fs = await import('fs');
    fs.writeFileSync('emoji-test.pdf', Buffer.from(buffer));
    
    console.log('✅ Emoji test PDF generated: emoji-test.pdf');
    console.log(`📊 Size: ${buffer.byteLength} bytes`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testEmojiPDF();
