const { UnauthenticatedError } = require("../errors");

const authMiddleware = (req, res, next) => {
    if (!req.user) {
        throw new UnauthenticatedError('Unauthorized: You must be logged in to access this resource.');
    }
    next();
};

// module.exports = authMiddleware;
// const authMiddleware = (req, res, next) => {
//     console.log('--- Inside authMiddleware ---');
//     console.log('req.user:', req.user); // Log the entire req.user object
//     console.log('req.user.id (if exists):', req.user ? req.user.id : 'N/A'); // Check .id property
//     console.log('req.user._id (if exists):', req.user ? req.user._id : 'N/A'); // Check ._id property

//     if (!req.user) {
//         console.log('authMiddleware: req.user is falsy, throwing UnauthenticatedError');
//         throw new UnauthenticatedError('Unauthorized: You must be logged in to access this resource.');
//     }
//     console.log('authMiddleware: req.user is truthy, proceeding to next middleware/route handler.');
//     next();
// };

module.exports = authMiddleware;