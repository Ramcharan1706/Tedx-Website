function notFound(req, res, next) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found.' });
  }
  return next();
}

function errorHandler(err, _req, res, _next) {
  console.error('[server:error]', err);

  if (res.headersSent) return;
  res.status(err.statusCode || 500).json({
    message: err.expose ? err.message : 'Internal server error.'
  });
}

module.exports = { notFound, errorHandler };
