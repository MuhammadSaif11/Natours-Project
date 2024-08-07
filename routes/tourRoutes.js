const express = require('express');
const tourController = require('../controllers/tourController');
const router = express.Router();

router.route('/').get(tourController.getTours).post(tourController.createTour);
router.route('/:tourId').get(tourController.getTour);

module.exports = router;
