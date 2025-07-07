const Review = require("../models/Review");
const User = require("../models/User");
const faker = require("@faker-js/faker").fakerEN_US;
const mongoose = require("mongoose");

require("dotenv").config();


const postiveReviewScript = [
    "This was the best movie ever! 😍",
    "10/10 would watch again!",
    "A masterpiece.",
    "Movie of the year ⭐️⭐️⭐️⭐️⭐️",
]


const negativeReviewScript = [
    "Wake me up when it's over...it is? Thank goodness.",
    "A very disapointing ending 🥱",
    "Hated it!",
    "I want the last hour and 45 minutes of my life back 😤"
]


const testUserPassword = faker.internet.password();

const generateReviews = (options = {}) => {
    const isPositive = faker.datatype.boolean();
    return {
        rating: faker.number.float({ min: 1, max: 5, multipleOf: 0.5 }),
        pov: isPositive ? faker.helpers.arrayElement(postiveReviewScript) : faker.helpers.arrayElement(negativeReviewScript),
        movie: options.movie || new mongoose.Types.ObjectId(), // Placeholder for movie ID 
        tmdbId: options.tmdbId || faker.number.int({ min: 1000, max: 99999 }), // Example TMDB ID
        createdBy: options.createdBy,
    }
}


const seed_db = async () => {
    let testUser = null;
    try {
        const mongoURL = process.env.MONGO_URI_TEST;
        await mongoose.connect(mongoURL);
        await Review.deleteMany({}); // deletes all review records
        await User.deleteMany({}); // and all the users
        testUser = await User.create(
            {

                name: faker.internet.username(),
                email: faker.internet.email(),
                password: testUserPassword
            }
        );
        // put 20 review entries in the database
        // for (let i = 0; i < 20; i++) {
        //     const reviewData = generateReviews({ createdBy: testUser._id });
        //     await Review.create(reviewData);
        //     console.log(`Review created: ${i + 1}`);
        //     console.log("Database seed is successful.");
        // }

        const reviewsData = [];
        for (let i = 0; i < 20; i++) {
            reviewsData.push(generateReviews({ createdBy: testUser._id }));
        }
        await Review.insertMany(reviewsData);
        console.log(`All ${reviewsData.length} reviews created.`);
        console.log("Seeded the database successfully.")
    } catch (e) {
        console.log("database error");
        console.log(e.message);
        throw e;
    }
    // } finally {
    //     await mongoose.disconnect();
    //     console.log("Database disconnected.");
    // }
    return testUser;
}

// seed_db();

module.exports = { testUserPassword, seed_db };

if (require.main === module) {
    seed_db()
        .then(() => {
            console.log("Seed successful");
            process.exit(0);
        })
        .catch((error) => {
            console.log("Seeding failed. ", error);
            process.exit(1);
        })
}

