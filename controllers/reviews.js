const Review = require('../models/Review');
const Movie = require('../models/Movie');
const { StatusCodes } = require('http-status-codes');
const { NotFoundError, BadRequestError, CustomAPIError } = require('../errors');



const getAllReviews = async (req, res) => {
    const reviews = await Review.find({ createdBy: req.user.userId }).sort('createdAt');
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
}

const getReview = async (req, res) => {
    const {
        user: { userId },
        params: { id: reviewId }
    } = req;

    const review = await Review.findOne({
        _id: reviewId,
        createdBy: userId
    });
    if (!review) {
        throw new NotFoundError(`No review was found with the id ${reviewId}`);
    }
    res.status(StatusCodes.OK).json({ review });

}

const createReview = async (req, res) => {
    req.body.createdBy = req.user.id;
    const review = await Review.create(req.body);
    res.status(StatusCodes.CREATED).json({ review });

}

const updateReview = async (req, res) => {

    const {
        body: { text, rating },
        user: { userId },
        params: { id: reviewId }
    } = req;

    if (text === '') {
        throw new BadRequestError("The text field cannot be empty.");
    }

    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
        throw new BadRequestError("The rating must be a number between 0 and 5.")
    }

    const review = await Review.findByIdAndUpdate(
        { _id: reviewId, createdBy: userId },
        { text, rating },
        { new: true, runValidators: true });
    if (!review) {
        throw new NotFoundError(`No review was found with the id ${reviewId}`);
    }
    res.status(StatusCodes.OK).json({ review });


}

const deleteReview = async (req, res) => {

    const {
        user: { userId },
        params: { id: reviewId }
    } = req;

    const review = await Review.findByIdAndDelete({
        _id: reviewId,
        createdBy: userId
    });

    if (!review) {
        throw new NotFoundError(`No review was found with the id ${reviewId}`);
    }
    res.status(StatusCodes.OK).send();

}

module.exports = {
    getAllReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview,
}