const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router
  .route('/updatePassword')
  .patch(authController.protect, authController.updatePassword);
router
  .route('/updateMe')
  .patch(authController.protect, userController.updateMe);
router
  .route('/deleteMe')
  .delete(authController.protect, userController.deleteMe);
router
  .route('/me')
  .get(authController.protect, userController.getMe, userController.getUser);
router
  .route('/:id')
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUser,
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    userController.updateUser,
  )
  .get(userController.getUser);

// router.param('userId', userController.checkId);
router.route('/').get(authController.protect, userController.getUsers);
// router.route('/:id').get(userController.getUser);

module.exports = router;
