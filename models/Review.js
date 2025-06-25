const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    text: {
        type: String,
        maxlength: 10000,
        required: [true, 'Please enter your review'],
    },
    movie: {
        type: mongoose.Types.ObjectId,
        ref: "Movie",
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
        validate: {
            validator: function (rating) {
                return rating !== null && rating % 0.5 === 0;
            },
            message: "The rating has to be between 0 and 5, with increments of 0.5",
        }
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user'],
    },
}, { timestamps: true }
)
module.exports = mongoose.model('Review', ReviewSchema);
