const express = require("express");
const passport = require("passport");
const router = express.Router();
const { StatusCodes } = require("http-status-codes");
const { UnauthenticatedError } = require("../errors");

const { registerDo, logOut } = require("../controllers/sessionController");

router.route("/login").post((req, res, next) => {
    passport.authenticate("local", (error, user, info) => {
        if (error) {
            console.error("Passport authentication error:", error);
            return next(error);
        }
        if (!user) {
            throw new UnauthenticatedError(
                info.message || "Unable to authenticate user."
            );
        }
        req.logIn(user, (error) => {
            if (error) {
                console.error("Error logging in user: ", error);
                return next(error);
            }
            res.status(StatusCodes.OK).json({
                msg: "Login successful",
                user: {
                    userId: user._id,
                    name: user.name,
                    email: user.email,
                },
            });
        });
    })(req, res, next);
});

router.route("/register").post(registerDo);
router.route("/logout").post(logOut);

module.exports = router;
