const mongoose = require("mongoose");
const WatchProviderSchema = require("./WatchProvider");

const MovieSchema = new mongoose.Schema({
    adult: { type: Boolean, default: false },
    backdrop_path: String,
    genre_ids: [Number],
    tmdbId: { type: Number, required: true, unique: true },
    overview: String,
    popularity: Number,
    poster_path: String,
    release_date: Date,
    title: { type: String, required: true },
    video: { type: Boolean },
    watch_providers: [WatchProviderSchema],
    averageRating: {
        type: Number,
        default: 0,
    },
    numberOfReviews: {
        type: Number,
        default: 0,
    },
    lastFetched: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Movie", MovieSchema);
