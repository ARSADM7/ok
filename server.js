const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Tipos MIME comuns
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ts': 'video/mp2t',
  '.m3u8': 'application/vnd.apple.mpegurl',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
};

const server = http.createServer((req, res) => {
  // Log de requisição
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

  // Fazer parse da URL
  let parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Remover barra inicial
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Caminho do arquivo
  let filePath = path.join(__dirname, pathname);

  // Segurança: prevenir traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Acesso negado');
    return;
  }

  // Tentar ler o arquivo
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Se não encontrar, tenta index.html (para SPA)
      if (err.code === 'ENOENT' && pathname !== '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err2, data2) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Arquivo não encontrado');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(data2);
        });
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Erro interno do servidor');
      }
    } else {
      // Determinar tipo MIME
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      // Headers de cache
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(data);
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`\n╔════════════════════════════════════════════════════╗`);
  console.log(`║         🎬 POWER TV - Server Started                ║`);
  console.log(`╠════════════════════════════════════════════════════╣`);
  console.log(`║ 🌐 Servidor HTTP rodando em:                       ║`);
  console.log(`║ → http://localhost:${PORT}${' '.repeat(Math.max(0, 18 - PORT.toString().length))}║`);
  console.log(`║ → http://0.0.0.0:${PORT}${' '.repeat(Math.max(0, 22 - PORT.toString().length))}║`);
  console.log(`║                                                    ║`);
  console.log(`║ 📱 Para acessar remotamente:                       ║`);
  console.log(`║ → http://seu-ip:${PORT}${' '.repeat(Math.max(0, 24 - PORT.toString().length))}║`);
  console.log(`║                                                    ║`);
  console.log(`║ ⚠️  Pressione CTRL+C para parar o servidor         ║`);
  console.log(`╚════════════════════════════════════════════════════╝\n`);
});

// Tratamento de erros
server.on('error', (err) => {
  console.error('❌ Erro no servidor:', err);
});

process.on('SIGINT', () => {
  console.log('\n\n👋 Servidor desligando...');
  server.close(() => {
    console.log('✅ Servidor desligado');
    process.exit(0);
  });
});
