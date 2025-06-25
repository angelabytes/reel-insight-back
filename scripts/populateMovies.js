require('dotenv').config();
const connectDB = require('../db/connect');
const { saveMovieToDB, getPopularMovies } = require("../services/tmdbService");

const populate = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        console.log("Database connect for movie populate");
        const totalNumOfPages = 5;
        let allMovieIds = []

        const popMovieIds = await getPopularMovies(5);

        for (let page = 0; page < totalNumOfPages; page++) {
            const moviesIds = await getPopularMovies(page);
            allMovieIds = allMovieIds.concat(moviesIds);
        }

        if (allMovieIds.length === 0) {
            console.log("Could not get movies from TMDB. Please check API key or network connection ");
            process.exit(0);
        }

        console.log(`Attempting to save ${popMovieIds.length} popular movies `);

        for (const id of allMovieIds) {
            await saveMovieToDB(id);
        }
        console.log("Successfully save and stored movies.");
        process.exit(0);

    } catch (error) {
        console.error("Error occured while trying to populate movies: ", error);
        process.exit(1);
    }
}

populate();