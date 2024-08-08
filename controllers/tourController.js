const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);

exports.getTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  const id = req.params.tourId * 1;
  const tour = tours.find((t) => t.id === id);
  res.status(200).json({
    status: '200',
    requestedAt: req.requestTime,
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const tour = {id: newId, ...req.body};
  tours.push(tour);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    () => {
      res.status(201).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: {
          tour,
        },
      });
    },
  );
};

exports.checkId = (req, res, next, id) => {
  const tour = tours.find((t) => t.id === id * 1);
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid Id',
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  const { name, price } = req.body;
  if (!name || !price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid Body',
    });
  }
  next();
};
