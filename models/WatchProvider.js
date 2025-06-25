const mongoose = require('mongoose');

const WatchProviderSchema = new mongoose.Schema({
    providerId: { type: Number, required: true },
    providerName: { type: String },
    // movieId: { type: Number, required: true, unique: true },
    logo_path: { type: String },
    display_priority: { type: Number },
    pricing: { type: String, enum: ['flatrate', 'rent', 'buy'] },
    country: { type: String },

});

module.exports = WatchProviderSchema;