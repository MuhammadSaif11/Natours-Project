const express = require('express');
const path = require('path');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const globalHandler = require('./controllers/errorController');
const AppError = require('./utilities/AppError');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const santizer = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookie = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const app = express();

// ************ MIDDEWARES ******************

// Implement Cors
app.use(cors());
// for specific url
// app.use(
//   cors({
//     origin: 'some url',
//   }),
// );

app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// app.use((req, res, next) => {
//   res.setHeader(
//     'Content-Security-Policy',
//     "script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/axios/1.7.5/axios.min.js",
//   );
//   next();
// });

//serving static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookie());

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

app.use(compression());

//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

//limit requests form same ip address
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this api! Please try again in an hour',
});
app.use('/api', limiter);

app.use('/', viewRouter);
//routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalHandler);

module.exports = app;
