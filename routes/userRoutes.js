const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// router.param('userId', userController.checkId);
router.route('/').get(userController.getUsers);
router.route('/:id').get(userController.getUser);

module.exports = router;
