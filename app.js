const express = require('express');
const path = require('path');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const globalHandler = require('./controllers/errorController');
const AppError = require('./utilities/AppError');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const santizer = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();
// ************ MIDDEWARES ******************

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

//set security HTTP HEADERS
app.use(helmet());

//Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

//data sanitization against NOSQL query injection attacks and
app.use(santizer());

//data santization against cross site scripting (XSS) attacks
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'price',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
    ],
  }),
);

//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//limit requests form same ip address
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this api! Please try again in an hour',
});
app.use('/api', limiter);

app.get('/', (req, res) => {
  res.status(200).render('base',{
    tour: 'The Forest Hiker',
    user: 'Saif'
  });
});

//routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalHandler);

module.exports = app;
