const Movie = require('../models/Movie');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');
const { saveMovieToDB } = require('../services/tmdbService');

const getAllMovies = async (req, res) => {
    const { sort, limit, isFeatured } = req.query;
    let queryObject = {};
    let sortOptions = {};

    // Handle isFeatured filter
    if (isFeatured === 'true') {
        queryObject.isFeatured = true;
    }

    // Build sort options
    if (sort) {
        if (sort === 'title') {
            sortOptions.title = 1; // Ascending by title
        } else if (sort === '-popularity') {
            sortOptions.popularity = -1; // Descending by popularity
        } else if (sort === '-numberOfReviews') {
            sortOptions.numberOfReviews = -1; // Descending by number of reviews
        }
        // Add more sort options as needed
    } else {
        // Default sort if none specified, e.g., by creation date or popularity
        sortOptions.createdAt = -1;
    }

    let result = Movie.find(queryObject)
        // SELECT ONLY THE FIELDS NEEDED FOR MOVIE CARDS
        .select('title poster_path tmdbId averageRating numberOfReviews genre_names release_date run_time overview') // Added overview for description
        .sort(sortOptions);

    // Handle limit
    if (limit) {
        const parsedLimit = parseInt(limit, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
            result = result.limit(parsedLimit);
        }
    }

    const movies = await result;
    res.status(StatusCodes.OK).json({ movies, count: movies.length });
}

const getMovie = async (req, res) => {
    const { id: tmdbId } = req.params; // Expecting tmdbId from the URL

    // Try to find the movie by tmdbId
    const movie = await Movie.findOne({ tmdbId: parseInt(tmdbId, 10) }); // findOne returns all fields by default

    if (!movie) {
        throw new NotFoundError(`No movie was found with the TMDb ID ${tmdbId}`);
    }
    res.status(StatusCodes.OK).json({ movie });
}

const createMovie = async (req, res) => {
    const { tmdbId } = req.body;

    if (!tmdbId) {
        throw new BadRequestError('An id for the movie is need.');
    }

    const numericId = parseInt(tmdbId, 10);
    if (isNaN(numericId)) {
        throw new BadRequestError(`Invalid movie id: ${tmdbId} was provided. Must be a number.`);
    }

    const movie = await saveMovieToDB(numericId);

    if (!movie) {
        throw new BadRequestError(`Could not add movie with id: ${tmdbId}`);
    }

    res.status(StatusCodes.CREATED).json({ movie });
}

const updateMovie = async (req, res) => {
    const {
        body,
        params: { id: movieId }
    } = req;

    const updates = {};

    if (body.averageRating !== undefined) {
        if (typeof body.averageRating !== 'number' || body.averageRating < 0 || body.averageRating > 5) {
            throw new BadRequestError("The average rating must be 0 and 5");
        }
        updates.averageRating = body.averageRating;
    }

    if (body.numberOfReviews !== undefined) {
        if (typeof body.numberOfReviews !== 'number' || body.numberOfReviews < 0) {
            throw new BadRequestError("The number of reviews shouldn't be negative.");
        }
        updates.numberOfReviews = body.numberOfReviews;
    }

    // Allow updating isFeatured flag
    if (body.isFeatured !== undefined) {
        if (typeof body.isFeatured !== 'boolean') {
            throw new BadRequestError("isFeatured must be a boolean value.");
        }
        updates.isFeatured = body.isFeatured;
    }

    if (Object.keys(updates).length === 0) {
        throw new BadRequestError("No valid fields provided for update. Only averageRating, numberOfReviews, and isFeatured can be updated.");
    }

    const movie = await Movie.findByIdAndUpdate(
        movieId,
        updates,
        { new: true, runValidators: true });

    if (!movie) {
        throw new NotFoundError(`No movie was found with the id ${movieId}`);
    }
    res.status(StatusCodes.OK).json({ movie });
}

const deleteMovie = async (req, res) => {
    const {
        params: { id: movieId }
    } = req;

    const movie = await Movie.findByIdAndDelete(movieId);

    if (!movie) {
        throw new NotFoundError(`No movie was found with the id ${movieId}`);
    }
    res.status(StatusCodes.OK).send();
}

module.exports = {
    getAllMovies,
    getMovie,
    createMovie,
    updateMovie,
    deleteMovie,
}