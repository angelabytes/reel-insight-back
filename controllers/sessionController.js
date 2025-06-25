const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require('../errors');


const registerDo = async (req, res) => {
    const { email, name, password, passwordToConfirm } = req.body;
    if (password !== passwordToConfirm) {

        throw new BadRequestError("The passwords do not match.");
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
        res.status(StatusCodes.OK).json({ msg: "Logged out successfully!" });
    })
};


module.exports = {
    registerDo,
    logOut,
};