const Tour = require('../models/tourModel');
const ApiFeatures = require('../utilities/ApiFeatures');

exports.aliasTopTours = (req, res, next) => {
  req.query.sort = '-ratingsAverage,price';
  req.query.limit = 5;
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getTours = async (req, res) => {
  try {
    // //****************BUILD QUERY************* */
    // //****************FILTERING*************** */
    // const queryObj = { ...req.query };
    // const excludedFields = ['page', 'limit', 'sort', 'fields'];
    // excludedFields.forEach((field) => delete queryObj[field]);

    // //**************ADVANCE FILTERING *************** */
    // let queryString = JSON.stringify(queryObj);
    // queryString = queryString.replace(
    //   /\b(lt|gt|gte|lte)\b/g,
    //   (match) => `$${match}`,
    // );

    // let query = Tour.find(JSON.parse(queryString));

    // //**************SORTING**************** */
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort('-createdAt');
    // }

    // //************LIMITING************** */
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   query = query.select(fields);
    // } else {
    //   query = query.select('-__v');
    // }

    // //************PAGINATION************** */
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 1;
    // const skip = (page - 1) * limit;

    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const count = await Tour.countDocuments();
    //   if (skip >= count) throw Error(`Page not found: ${req.query.page}`);
    // }

    //***********************EXECUTE QUERY********************************

    console.log(req.query);
    const features = new ApiFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .fields()
      .pagination();
    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (e) {
    res.status(404).json({
      status: 'fail',
      message: e,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: '200',
      requestedAt: req.requestTime,
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid request',
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const tour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          avgPrice: { $avg: '$price' },
          avgRating: { $avg: '$ratingsAverage' },
          numRatings: { $sum: '$ratingsQuantity' },
          numTours: { $sum: 1 },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: -1 },
      },
    ]);

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: stats,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const monthlyPlan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { numTourStarts: -1 },
      },
    ]);

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: monthlyPlan,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};
