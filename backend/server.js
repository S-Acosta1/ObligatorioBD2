const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/api/info' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(
      JSON.stringify({
        message: 'Backend file for World Football Cup 2026 is running.',
      })
    );
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route not found' }));
});

server.listen(PORT, () => {
  console.log(`World Football Cup 2026 backend listening on port ${PORT}`);
});
