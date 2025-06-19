// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/finnhub',
    createProxyMiddleware({
      target: 'https://finnhub.io/api/v1',
      changeOrigin: true,
      pathRewrite: { '^/finnhub': '' }
    })
  );
};
