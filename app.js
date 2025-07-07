const express = require("express");
require("dotenv").config();
require("express-async-errors");
const cors = require('cors');

const app = express();
const path = require('path');

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))

//Middleware
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("host-csrf");
const cookieParser = require("cookie-parser");
const xss = require("perfect-express-sanitizer");
const rateLimiter = require("express-rate-limit");
const passport = require("passport");


//Custom middleware
const passportInit = require("./passport/passportInit");
const storeLocals = require("./middleware/storeLocals");
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

//Routes Import
const movieRouter = require("./routes/movies");
const sessionRouter = require("./routes/sessionRoutes");
const reviewRouter = require("./routes/reviews");

//Database base url
let mongoURL = process.env.MONGO_URI;
if (process.env.NODE_ENV === "test") {
    mongoURL = process.env.MONGO_URI_TEST;
}

//Session setup
const store = new MongoDBStore({
    uri: mongoURL,
    collection: "mySessions",
});

store.on("error", function (error) {
    console.log("MongoDB session store error", error);
});

//Security and middleware
app.set("trust proxy", 1);
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000, //15 minutes
        max: 100, //limit each IP to 100 requests per windowMs
        message: "Too many requests, please try again in 15 minutes",
    })
);

app.use(
    xss.clean({
        xss: true,
        noSQL: true,
        //html: true //disable if sending raw html from reac
    })
);

app.use(express.json()); // allow parsing of json bodies from react
app.use(express.urlencoded({ extended: false })); // parsing url bodies
app.use(cookieParser(process.env.SESSION_SECRET));

const sessionParams = {
    secret: process.env.SESSION_SECRET,
    // resave: false,
    // saveUninitialized: false,
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: { secure: false, sameSite: "strict", maxAge: 1000 * 60 * 60 * 48 }, //set to expire after 2 days
};


let csrf_develeopment_mode = true;
if (app.get("env") === "production") {
    sessionParams.cookie.secure = true; //serve secure cookies
    csrf_develeopment_mode = false;
}

app.use(session(sessionParams));

//Intialize passport
passportInit();
app.use(passport.initialize());
app.use(passport.session());



//CRSF middleware
const csrf_options = {
    secret: process.env.SESSION_SECRET,
    protected_operations: ["PATCH", "POST", "PUT", "DELETE"],
    development_mode: csrf_develeopment_mode,
};



const csrf_middleware = csrf(csrf_options); //initialize and return middleware
app.use(csrf_middleware);



app.use((req, res, next) => {
    if (typeof req.csrfToken !== 'function') {
        req.csrfToken = () => '';
    }
    next();
})


app.use(storeLocals);
app.get("/api/v1/csrf-token", (req, res) => {
    res.status(200).json({ csrfToken: res.locals.csrf });
})


//set content-type to json for chai and text/html for express
app.use((req, res, next) => {
    if (req.path === "/multiply") {
        res.set("Content-Type", "application/json");
        res.set("X-CSRFToken", req.csrfToken);
    } else {
        res.set("Content-Type", "text/html");
    }
    next();
});

//used for the html rendering test
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get('/', (req, res) => {
    res.render("index", { user: null, errors: [], info: [] });
})


app.use("/api/v1/sessions", sessionRouter);
app.use("/api/v1/movies", movieRouter);
app.use("/api/v1/reviews", reviewRouter);

app.get("/multiply", (req, res) => {
    const result = req.query.first * req.query.second;
    if (result.isNaN) {
        result = "NaN";
    } else if (result == null) {
        result = "null";
    }
    res.json({ result: result });
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5001;

// const start = async () => {
//     try {
//         await require("./db/connect")(process.env.MONGO_URI);
//         app.listen(port, () =>
//             console.log(`Server is listening on port ${port}...`)
//         );
//     } catch (error) {
//         console.log(error);
//     }
// };

const start = () => {
    try {
        require("./db/connect")(mongoURL);
        return app.listen(port, () => console.log(`Server is listening on port ${port}...`));
    } catch (error) {
        console.log(error);
    }
}

start();

module.exports = { app };