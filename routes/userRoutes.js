const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// router.param('userId', userController.checkId);
router.route('/').get(userController.getUsers).post(userController.createUser);
router.route('/:id').get(userController.getUser);

module.exports = router;
