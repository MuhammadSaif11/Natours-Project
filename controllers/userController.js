const fs = require('fs');

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`),
);

exports.createUser = (req, res) => {
  const newId = users[users.length - 1] + 1;
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const user = { id: newId, ...req.body };
  users.push(user);
  fs.writeFile(
    `${__dirname}/../dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      if (err)
        res
          .status(500)
          .json({ status: 'failed', message: 'internal server error' });
      res.status(201).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: {
          user,
        },
      });
    },
  );
};

exports.getUsers = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: {
      users,
    },
  });
};

exports.getUser = (req, res) => {
  const id = req.params.userId;
  const user = users.find((u) => u._id === id);
  res.status(200).json({
    status: 'successss',
    requestedAt: req.requestTime,
    data: {
      user,
    },
  });
};

exports.checkId = (req, res, next, id) => {
  const user = users.find((u) => u._id === id);
  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid Id',
    });
  }
  next();
};
