const Review = require('../models/reviewModel');
const catchAsync = require('../utilities/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utilities/AppError');

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.tour) req.body.tour = req.params.id;
  next();
};

exports.getReviews = factory.getAll(Review, 'tour');
exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
