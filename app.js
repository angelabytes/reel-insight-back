const express = require("express");
require("dotenv").config();
require("express-async-errors");

const app = express();

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
const url = process.env.MONGO_URI;

//Session setup
const store = new MongoDBStore({
    uri: url,
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
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: { secure: false, sameSite: "lax", maxAge: 1000 * 60 * 60 * 48 }, //set to expire after 2 days
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
    protected_operations: ["PATCH", "POST", "PUT", "DELETE"],
    development_mode: csrf_develeopment_mode,
};
const csrf_middleware = csrf(csrf_options); //initialize and return middleware
app.use(csrf_middleware);

app.use(storeLocals);
app.get("/api/v1/csrf-token", (req, res) => {
    res.status(200).json({ csrfToken: res.locals.csrf });
})


app.use("/api/v1/sessions", sessionRouter);
app.use("/api/v1/movies", movieRouter);
app.use("/api/v1/reviews", reviewRouter);


app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5001;

const start = async () => {
    try {
        await require("./db/connect")(process.env.MONGO_URI);
        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();
