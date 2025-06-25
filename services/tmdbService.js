const axios = require('axios');
const Movie = require('../models/Movie');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';


const saveMovieToDB = async (tmdbMovieId) => {
    try {
        let movie = await Movie.findOne({ tmdbId: tmdbMovieId });
        const updatePeriod = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); //7 days ago
        if (movie && movie.lastFetched && movie.lastFetched > updatePeriod) {
            console.log(`Movie ${movie.title} (ID: ${tmdbMovieId}) found and recently updated`);
            return movie;
        }

        console.log(`Fetching movie with id: ${tmdbMovieId} from TMDB.`);

        const res = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbMovieId}`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'en-US',
                append_to_response: 'watch/providers',
            },
            headers: {
                accept: 'application/json'
            }
        });

        const tmdbMovieData = res.data;

        const allWatchProviders = [];

        if (tmdbMovieData["watch/providers"] && tmdbMovieData["watch/providers"].results) {
            const providersByCountry = tmdbMovieData["watch/providers"].results;

            for (const countryCode in providersByCountry) {
                const countryProviders = providersByCountry[countryCode];

                const providerTypes = ['flatrate', 'rent', 'buy'];
                for (const type of providerTypes) {
                    if (countryProviders[type]) {
                        for (const provider of countryProviders[type]) {
                            allWatchProviders.push({
                                providerId: provider.provider_id,
                                providerName: provider.provider_name,
                                logo_path: provider.logo_path,
                                display_priority: provider.display_priority,
                                pricing: type,
                                country: countryCode,
                            })

                        }
                    }
                }
            }
        }

        const movieData = {
            adult: tmdbMovieData.adult,
            backdrop_path: tmdbMovieData.backdrop_path,
            genre_ids: tmdbMovieData.genres ? tmdbMovieData.genres.map(genre => genre.id) : [],
            genre_names: tmdbMovieData.genres ? tmdbMovieData.genres.map(genre => genre.name) : [],
            tmdbId: tmdbMovieData.id,
            overview: tmdbMovieData.overview,
            popularity: tmdbMovieData.popularity,
            poster_path: tmdbMovieData.poster_path,
            release_date: tmdbMovieData.release_date,
            runtime: tmdbMovieData.runtime,
            title: tmdbMovieData.title,
            video: tmdbMovieData.video,
            watch_providers: allWatchProviders,
            lastFetched: Date.now(),
        }

        //Create or update movie
        if (movie) {

            movieData.averageRating = movie.averageRating;
            movieData.numberOfReviews = movie.numberOfReviews;
            movieData.isFeatured = movie.isFeatured;

            Object.assign(movie, movieData);
            await movie.save();
            console.log(`Update exsitng movie: ${movie.title}`);
        } else {
            movie = await Movie.create(movieData);
            console.log(`New movie added: ${movie.title}`)
        }
        return movie;

    } catch (error) {
        console.error(`Error in retrieving movie or saving movie with id ${tmdbMovieId}: `, error.message);
        if (error.response) {
            console.error('TMDB API error: ', error.response.data)
        }
        return null;
    }
}

const getPopularMovies = async (page = 1) => {
    try {
        const res = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
            params: {
                api_key: TMDB_API_KEY,
                page: page,
            }
        })

        return res.data.results.map(movie => movie.id);

    } catch (error) {
        console.error("Error when fetching movies from TMDB", error.message);
        return [];
    }
}

module.exports = {
    saveMovieToDB,
    getPopularMovies,
}