const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/AppError');
const sendEmail = require('../utilities/email');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    photo: req.body.photo ? req.body.photo : undefined,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
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

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to access this resource', 403),
      );
    }
    return next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new AppError('please provide a email', 400));

  const user = await User.findOne({ email });

  if (!user) return next(new AppError('User not found with this email', 404));

  const resetPasswordToken = user.createResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetPasswordToken}`;

  const message = `Forgot your password? click on the below url to change your password.
  \n${resetUrl}
  \nIf you did not ask for this request please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'forgot password link (valid for 10 mins)',
      text: message
    });

    res.status(200).json({
      status: 'success',
      message: 'forgot password link sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500,
    );
  }
});
