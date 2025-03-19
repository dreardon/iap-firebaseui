const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const port = process.env.PORT || 8080;

const FIREBASEUI_URL = process.env.FIREBASEUI_URL

app.use(express.static(path.join(__dirname, 'dist')));

const firebaseProxyOptions = {
  target: FIREBASEUI_URL,
  changeOrigin: true,
  logger: console,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log('Forwarding to FirebaseUI. Rewritten URL:', proxyReq.path);
  },
  onError: (err, req, res) => {
      console.error('FirebaseUI proxy error:', err);
      res.status(500).send('FirebaseUI Proxy Error');
  }
};

const firebaseProxyMiddleware = createProxyMiddleware(firebaseProxyOptions);

app.use('/__/auth', firebaseProxyMiddleware);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
  console.log(`FirebaseUI URL at: ${FIREBASEUI_URL}`);
});