export function notFoundHandler(req, res) {
  res.status(404).json({
    message: 'Route not found'
  });
}

export function errorHandler(error, req, res, next) {
  const status = error.status || 500;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    message: error.message || 'Internal server error',
    details: error.details || null
  });
}
