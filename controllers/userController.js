const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const factory = require('./handlerFactory');
const AppError = require('../utilities/AppError');
const catchAsync = require('../utilities/catchAsync');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null,`user-${req.user._id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
  // const { user } = req;
  // res.status(200).json({
  //   data: {
  //     user,
  //   },
  // });
};

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

  const body = {
    name,
    email,
  };

  if (req.file) body.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(currentUser._id, body, {
    new: true,
    runValidators: true,
  });

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

exports.getUsers = factory.getAll(User);
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User);
exports.getUser = factory.getOne(User);

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
