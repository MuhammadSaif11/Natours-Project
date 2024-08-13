const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

// router.param('tourId', tourController.checkId);
router
  .route('/')
  .get(authController.protect, tourController.getTours)
  .post(tourController.createTour);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getTours);

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
