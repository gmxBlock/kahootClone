const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_BASE_URL || 'http://165.22.18.156:3000',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug'
    })
  );
};