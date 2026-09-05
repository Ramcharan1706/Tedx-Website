const path = require('node:path');
const http = require('node:http');
const express = require('express');
require('dotenv').config();

const EVENT = require('./src/config/event');
const { connectDatabase, disconnectDatabase, getDatabaseStatus } = require('./src/config/database');
const { securityHeaders, apiLimiter } = require('./src/middleware/security');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const PORT = Number.parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const STATIC_DIR = __dirname;
// Site files live at the repository root so GitHub Pages can serve them from `main:/`.
// Everything below is server-side only and must never be exposed by express.static.
const PRIVATE_PATHS = /^\/(?:src|scripts|node_modules|tedxKprit2025)(?:\/|$)|^\/(?:server\.js|package(?:-lock)?\.json)$/i;
const isProduction = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
app.use(securityHeaders);
app.use(express.json({ limit: '50kb', strict: true }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));

app.use('/api', apiLimiter);

app.get('/api/health', (_req, res) => {
  const database = getDatabaseStatus();
  const healthy = database !== 'disconnected' || !process.env.MONGODB_URI;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    event: EVENT.title,
    theme: EVENT.theme,
    database,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/speakers', require('./src/routes/speakers'));
app.use('/api/tickets', require('./src/routes/tickets'));
app.use('/api/contact', require('./src/routes/contact'));
app.use('/api/interests', require('./src/routes/interests'));
app.use('/api/partners', require('./src/routes/partners'));
app.use('/api/events', require('./src/routes/events'));
app.use('/api', notFound);

app.use((req, res, next) => {
  if (PRIVATE_PATHS.test(req.path)) return res.status(404).type('txt').send('Not found');
  return next();
});

app.use(express.static(STATIC_DIR, {
  extensions: ['html'],
  etag: true,
  index: 'index.html',
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
      return;
    }
    if (isProduction) res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
  }
}));

app.get('*', (_req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

app.use(errorHandler);

async function start() {
  try {
    if (process.env.MONGODB_URI) {
      try {
        await connectDatabase(process.env.MONGODB_URI);
        console.log('[db] connected');
      } catch (error) {
        console.error('[db] unavailable:', error.message);
        if (isProduction) throw error;
      }
    } else {
      console.log('[db] MONGODB_URI not set; running in static/API demo mode');
    }

    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(PORT, HOST, resolve);
    });

    console.log(`[server] ${EVENT.title} listening on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  } catch (error) {
    console.error('[server] failed to start:', error);
    await disconnectDatabase();
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`[server] ${signal} received; shutting down`);
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10_000).unref();
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

if (require.main === module) start();

module.exports = { app, server, start };
