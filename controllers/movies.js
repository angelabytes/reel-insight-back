const Movie = require('../models/Movie');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');
const { saveMovieToDB } = require('../services/tmdbService');

const getAllMovies = async (req, res) => {
    const movies = await Movie.find({});
    res.status(StatusCodes.OK).json({ movies, count: movies.length });
}

const getMovie = async (req, res) => {
    const { id: movieId } = req.params;

    const movie = await Movie.findById(movieId);

    if (!movie) {
        throw new NotFoundError(`No movie was found with the id ${movieId}`);
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

    if (Object.keys(updates).length === 0) {
        throw new BadRequestError("Only average rating and number of reviews can be updated");
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