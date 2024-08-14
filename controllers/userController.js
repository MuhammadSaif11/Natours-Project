const User = require('../models/userModel');
const fs = require('fs');
const AppError = require('../utilities/AppError');
const catchAsync = require('../utilities/catchAsync');

// const users = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/users.json`),
// );

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for updating password. Please try /updatePassword',
        400,
      ),
    );
  }

  const currentUser = req.user;
  const { name, email } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    currentUser._id,
    { name, email },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).send({
    status: 'success',
    requestedAt: req.requestTime,
    data: null,
  });
});

exports.getUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: {
      users,
    },
  });
});

// exports.getUser = (req, res) => {
//   const id = req.params.userId;
//   const user = users.find((u) => u._id === id);
//   res.status(200).json({
//     status: 'successss',
//     requestedAt: req.requestTime,
//     data: {
//       user,
//     },
//   });
// };

// exports.checkId = (req, res, next, id) => {
//   const user = users.find((u) => u._id === id);
//   if (!user) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid Id',
//     });
//   }
//   next();
// };
