const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const target = process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || 'http://165.22.18.156:3000';
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
      secure: false, // Allow self-signed certificates
      logLevel: 'debug',
      pathRewrite: {
        '^/api': '/api' // Keep the /api path
      },
      onError: (err, req, res) => {
        console.log('Proxy Error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain'
        });
        res.end('Proxy Error: ' + err.message);
      }
    })
  );
};