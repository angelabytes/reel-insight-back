const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    movieId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    overview: String,
    release_date: Date,
    poster_path: String,
    watch_providers: []
}, { timestamps: true }
)
module.exports = mongoose.model('Movie', MovieSchema);
