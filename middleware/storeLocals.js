const csrf = require('host-csrf');
const storeLocals = (req, res, next) => {
    if (req.user) {
        res.locals.user = req.user;
    } else {
        res.locals.user = null;
    }

    res.locals.csrf = csrf.token(req, res);
    next();
};

module.exports = storeLocals;