const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

http.createServer((req, res) => {
    // Extract base path to bypass query params (like cache-busting timestamp)
    let filePath = '.' + req.url.split('?')[0];
    if (filePath === './' || filePath === './index.html') {
        filePath = './index.html';
    }

    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.svg':
            contentType = 'image/svg+xml';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
        case '.jpeg':
            contentType = 'image/jpeg';
            break;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 File Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*' 
            });
            res.end(content, 'utf-8');
        }
    });
}).listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🎵 PSS PLAYER LOCAL SERVER ACTIVE 🎵`);
    console.log(`👉 Open: http://localhost:${PORT}`);
    console.log(`==================================================\n`);
});
