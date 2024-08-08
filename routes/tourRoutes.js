const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

router.param('tourId', tourController.checkId);
router
  .route('/')
  .get(tourController.getTours)
  .post(tourController.checkBody, tourController.createTour);
router.route('/:tourId').get(tourController.getTour);

module.exports = router;
