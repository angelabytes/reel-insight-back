const Review = require('../models/Review');
const Movie = require('../models/Movie');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors');


const getAllReviews = async (req, res) => {
    const { movieId } = req.query;
    let queryObject = {};

    if (movieId) {
        const movie = await Movie.findOne({ tmdbId: parseInt(movieId, 10) });
        if (!movie) {
            throw new NotFoundError(`No movie found with TMDb ID: ${movieId}`);
        }
        queryObject.movie = movie._id;
    }

    const reviews = await Review.find(queryObject)
        .populate({
            path: 'createdBy',
            select: 'name',
        })
        .populate({
            path: 'movie',
            select: 'title tmdbId poster_path',
        })

        .sort('-createdAt');

    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const userReviews = async (req, res) => {
    const userId = req.user.userId;

    if (!userId) {
        throw new UnauthenticatedError('User not authenticated.');
    }

    const reviews = await Review.find({ user: userId })
        .populate({
            path: 'movie',
            select: 'title tmdbId poster_path',
        })
        .populate({
            path: 'createdBy',
            select: 'name',
        })
        .sort('-createdAt');

    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

// Create a new review
const createReview = async (req, res) => {
    const { movieId, tmdbId, rating, pov } = req.body;
    const userId = req.user.userId;

    const floatRating = parseFloat(rating);

    if (!movieId || !tmdbId || isNaN(floatRating) || pov === undefined || pov === null) {
        throw new BadRequestError('Please provide movie ID, TMDb ID, rating, and review.');
    }

    if (floatRating < 1 || floatRating > 5) {
        throw new BadRequestError('Rating must be between 1 and 5.');
    }

    // Check if user already reviewed this movie
    const alreadyReviewed = await Review.findOne({
        movie: movieId,
        createdBy: userId,
    });
    if (alreadyReviewed) {
        throw new BadRequestError('You have already reviewed this movie.');
    }

    // Find the movie by its MongoDB _id
    const movie = await Movie.findById(movieId);
    if (!movie) {
        throw new NotFoundError(`No movie found with ID: ${movieId}`);
    }

    // Create the review
    const review = await Review.create({
        movie: movieId,
        tmdbId: tmdbId,
        createdBy: userId,
        rating: floatRating,
        pov,
    });

    await updateMovieData(movie._id);

    const updateMovie = await Movie.findById(movie._id);

    res.status(StatusCodes.CREATED).json({
        review,
        newAverageRating: updateMovie.averageRating,
        newNumberOfReviews: updateMovie.numberOfReviews,
    });
};

const updateMovieData = async (movieId) => {
    const reviews = await Review.find({ movie: movieId });
    const numberOfReviews = reviews.length;
    let averageRating = 0;
    if (numberOfReviews > 0) {
        const totalRating = reviews.reduce((accumulator, review) => accumulator + review.rating, 0);
        averageRating = totalRating / numberOfReviews;
    }

    await Movie.findByIdAndUpdate(movieId, {
        numberOfReviews: numberOfReviews,
        averageRating: averageRating,
    })
}

const updateReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const { rating, pov } = req.body;
    const userId = req.user.userId;


    const floatRating = parseFloat(rating);
    if (isNaN(floatRating) || pov === undefined || pov === null) {
        throw new BadRequestError('Please provide rating and review content (pov) for the update.');
    }
    if (floatRating < 1 || floatRating > 5) {
        throw new BadRequestError('Rating must be between 1 and 5.');
    }

    const review = await Review.findOne({ _id: reviewId });

    if (!review) {
        throw new NotFoundError(`No review found with ID: ${reviewId}`);
    }

    if (review.createdBy.toString() !== userId) {
        throw new UnauthenticatedError('Not authorized to update this review. You can only update your own reviews.');
    }


    review.rating = floatRating;
    review.pov = pov;
    await review.save();


    await updateMovieData(review.movie);


    const updatedMovie = await Movie.findById(review.movie);

    res.status(StatusCodes.OK).json({
        msg: 'Review updated successfully',
        review,
        newAverageRating: updatedMovie.averageRating,
        newNumberOfReviews: updatedMovie.numberOfReviews,
    });
};


const deleteReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const userId = req.user.userId;

    const review = await Review.findOne({ _id: reviewId });

    if (!review) {
        throw new NotFoundError(`No review found with ID: ${reviewId}`);
    }


    if (review.createdBy.toString() !== userId) {
        throw new UnauthenticatedError('Not authorized to delete this review. You can only delete your own reviews.');
    }

    const movieId = review.movie;

    await review.deleteOne();

    await updateMovieData(movieId);

    const updatedMovie = await Movie.findById(movieId);

    res.status(StatusCodes.OK).json({
        msg: 'Review deleted successfully',
        newAverageRating: updatedMovie.averageRating,
        newNumberOfReviews: updatedMovie.numberOfReviews,
    });
};


module.exports = {
    getAllReviews,
    userReviews,
    createReview,
    updateReview,
    deleteReview,
};
