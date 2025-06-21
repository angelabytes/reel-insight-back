const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    text: {
        type: String,
        maxlength: 10000,
        required: [true, 'Please enter your review'],
    },
    movie: {type: mongoose.Types.ObjectId,
        ref: "Movie",
        required: [true, "Rating has to related to a movie"],
    },
    rating: {
    type: Number,
    required: true,
    validate: {
        validator: function (inputRating) {
            if(inputRating === null || inputRating === undefined) {
                return 'You must input a value for the rating';
            }
            const lowestRating = 1;
            const decimalRating = (inputRating * 2) /2;
            return decimalRating >= lowestRating;
        },
        message: "The rating has to be between 0 and 5",
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
