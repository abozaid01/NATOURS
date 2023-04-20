const express = require('express');
const {
    getAllTours,
    aliasTopTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    getTourStat,
    getMonthlyPlan,
} = require('../controllers/tourController');

const router = express.Router();

//executed when a specific parameter[_id] is present in a route URL
router.param('_id', (req, res, next, val) => {
    //console.log(`Tour id is: ${val}`);
    next();
});

router
    .route('/top-5-tours')
    .get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStat);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/').get(getAllTours).post(createTour);

router
    .route('/:_id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

module.exports = router;
