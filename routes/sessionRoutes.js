const express = require("express");
const passport = require("passport");
const router = express.Router();
const { StatusCodes } = require("http-status-codes");
const { UnauthenticatedError } = require("../errors");
const csrf = require("host-csrf");


const { registerDo, logOut } = require("../controllers/sessionController");
const csrf_options = {
    secret: process.env.SESSION_SECRET,
    protected_operations: ["PATCH", "POST", "PUT", "DELETE"],
    development_mode: process.env.NODE_ENV !== "production",
}

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


router.route("/register")
    .get((req, res, next) => {

        req.session.views = (req.session.views || 0) + 1;

        req.session.save((err) => {
            if (err) {
                console.error("Error saving session in /register GET: ", err);
                return next(err);
            }

            res.render("register", {
                _csrf: req.csrfToken,
                errors: req.body.errors || [],
                info: req.info || [],
                user: req.body.user || {}
            });
        });
    })
    .post(registerDo);

router.route("/logout").post(logOut);

module.exports = router;
