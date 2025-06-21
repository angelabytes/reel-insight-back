const Movie = require('../models/Movie');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

const getAllMovies = async (req, res) => {
    const movies = await Movie.find({ createdBy: req.user.userId }).sort('createdAt');
    res.status(StatusCodes.OK).json({ movies, count: movies.length });
}

const getMovie = async (req, res) => {
    const {
        user: { userId },
        params: { id: movieId }
    } = req;

    const movie = await Movie.findOne({
        _id: movieId,
        createdBy: userId
    });
    if (!movie) {
        throw new NotFoundError(`No movie was found with the id ${movieId}`);
    }
    res.status(StatusCodes.OK).json({ movie });
}

const createMovie = async (req, res) => {
    req.body.createdBy = req.user.userId;
    const movie = await Movie.create(req.body);
    res.status(StatusCodes.CREATED).json({ movie });
}

const updateMovie = async (req, res) => {
    const {
        body: { title, director, year, plot },
        user: { userId },
        params: { id: movieId }
    } = req;

    if (title === '' || director === '' || year === '' || year === 0 || plot === '') {
        throw new BadRequestError("The title, director, year and plot field cannot be empty.");
    }

    const movie = await Movie.findByIdAndUpdate(
        { _id: movieId, createdBy: userId },
        req.body,
        { new: true, runValidators: true });
    if (!movie) {
        throw new NotFoundError(`No movie was found with the id ${movieId}`);
    }
    res.status(StatusCodes.OK).json({ movie });
}

const deleteMovie = async (req, res) => {
    const {
        user: { userId },
        params: { id: movieId }
    } = req;

    //findByIdAndRemove() did not delete the item, so changed to findByIdAndDelete()
    const movie = await Movie.findByIdAndDelete({
        _id: movieId,
        createdBy: userId 
    });

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