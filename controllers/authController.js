const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/AppError');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo ? req.body.photo : undefined,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const { password, __v, ...user } = newUser.toObject();

  const token = generateToken(newUser._id);

  res.status(201).json({
    requestedAt: req.requesteTime,
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password, user.password)))
    return next(new AppError('Invalid password or email', 401));

  const token = generateToken(user._id);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requesteTime,
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401),
    );
  }

  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser)
    return next(
      new AppError('the user belonging to this token does not exist', 401),
    );

  if (currentUser.passwordChangedAfter(decoded.iat))
    return next(
      new AppError('User recently changed password! Please login again', 401),
    );

  req.user = currentUser;

  next();
});
