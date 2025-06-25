const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require('../errors');


const registerDo = async (req, res) => {
    const { email, name, password, confirmPassword } = req.body;

    if (!email || !name || !password || !confirmPassword) {

        throw new BadRequestError("Please provide email, name, password, and password confirmation.");
    }

    if (password !== confirmPassword) {
        throw new BadRequestError("The passwords do not match.");
    }


    const existingUser = await User.findOne({ email });
    if (existingUser) {
        if (existingUser.email === email) {
            throw new BadRequestError('Email already registered.');
        }

    }

    const user = await User.create({ email, name, password });
    res.status(StatusCodes.CREATED).json({
        msg: 'Successfully registered',
        user: {
            userId: user._id,
            name: user.name,
            email: user.email,
        }
    })
};

const logOut = (req, res, next) => {

    req.logout((error) => {
        if (error) {
            console.error("Error occured while trying to logoff", error);
            return next(error);
        }

        req.session.destroy((error) => {
            if (error) {
                console.error("Error destroying session: ", error);
                return next(error)
            }
            res.clearCookie("connect.sid");
            res.status(StatusCodes.OK).json({ msg: "Logged out successfully!" });
        })

    })
};

const checkAuthStatus = (req, res) => {
    if (req.isAuthenticated() && req.user) {
        res.status(StatusCodes.OK).json({
            isLoggedIn: true,
            user: {
                name: req.user.name,
            },
        })
    } else {
        res.status(StatusCodes.OK).json({ isLoggedIn: false, msg: "Not authenticated" });
    }
}


module.exports = {
    registerDo,
    logOut,
    checkAuthStatus
};