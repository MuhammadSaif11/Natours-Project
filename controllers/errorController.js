const AppError = require('../utilities/AppError');

const handleJsonWebTokenError = () =>
  new AppError('Invalid token! Please log in again', 401);

const handleTokenExpiredError = () =>
  new AppError('Token expired! Please log in again', 401);

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 404);
};

const handleDuplicateFieldsErrorDB = (err) => {
  const { name } = err.keyValue;
  const message = `Duplicate field value: ${name}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  let { message } = err;
  message = message.slice(24);
  return new AppError(`Invalid Input Data: ${message}`, 400);
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

module.exports = (err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.name = err.name;
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError')
      error = handleJsonWebTokenError(error);
    if (error.name === 'TokenExpiredError')
      error = handleTokenExpiredError(error);
    if (error.code === 11000) error = handleDuplicateFieldsErrorDB(error);
    sendErrorProd(error, res);
  } else if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }
};
