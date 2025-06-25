const express = require('express');
const router = express.Router();

const { getAllReviews, userReviews, createReview, updateReview, deleteReview } = require('../controllers/reviews');
const authMiddleWare = require('../middleware/auth');


router.route('/').get(getAllReviews).post(authMiddleWare, createReview);

router.route('/user-reviews').get(authMiddleWare, userReviews);

router.route('/:id')
    .patch(authMiddleWare, updateReview)
    .delete(authMiddleWare, deleteReview);

module.exports = router;