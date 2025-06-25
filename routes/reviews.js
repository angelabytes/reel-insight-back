const express = require("express");
const router = express.Router();

const {
    getAllReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview,
} = require("../controllers/reviews");

const authenticateUser = require("../middleware/auth");

router
    .route("/")
    .post(authenticateUser, createReview)
    .get(authenticateUser, getAllReviews);
router
    .route("/:id")
    .get(authenticateUser, getReview)
    .delete(authenticateUser, deleteReview)
    .patch(authenticateUser, updateReview);

module.exports = router;
