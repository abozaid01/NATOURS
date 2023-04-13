const {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
} = require('../controllers/tourController');

const express = require('express');
const router = express.Router();

router.route('/').get(getAllTours).post(createTour);

router
    .route('/:_id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

module.exports = router;
