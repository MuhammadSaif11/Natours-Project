const catchAsync = require('../utilities/catchAsync');
const ApiFeatures = require('../utilities/ApiFeatures');
const AppError = require('../utilities/AppError');

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model, keyName) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (keyName && req.params.id) filter = { [keyName]: req.params.id };
    const features = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .fields()
      .pagination();

    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;
    if (!doc)
      return next(
        new AppError(`No document found with an id ${req.params.id}`, 404),
      );

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
        data: doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc)
      return next(
        new AppError(`No document found with an id ${req.params.id}`, 404),
      );

    res.status(204).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc)
      return next(
        new AppError(`Can not find document with an id ${req.params.id}`, 404),
      );

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
        data: doc,
      },
    });
  });
