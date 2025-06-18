const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Always use HTTP for the backend since it doesn't support HTTPS
  const target = 'http://165.22.18.156:3000';
  
  console.log('Setting up proxy to:', target);
  
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
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying ${req.method} ${req.url} to ${target}${req.url}`);
      }
    })
  );
};