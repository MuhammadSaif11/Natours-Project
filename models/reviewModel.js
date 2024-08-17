/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'a review is required'],
    },
    rating: {
      type: Number,
      required: [true, 'a rating is required'],
      min: [1.0, 'A raitng must be greater than or equal to 1.0'],
      max: [5.0, 'A raitng must be less than or equal to 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user'],
    },
  },
  {
    toObject: { virtual: true },
    toJSON: { virtual: true },
  },
);

// reviewSchema.pre('save', function (req, next) {
//   console.log(req.user)
//   this.user = req.user._id;
//   // next();
// });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  // .populate({
  //   path: 'tour',
  //   select: 'name -guides',
  // });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
