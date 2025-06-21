require('dotenv').config();
require('express-async-errors');

//extra security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('express-sanitizer');
const rateLimiter = require('express-rate-limit');

const swaggerUi = require('swagger-ui-express');
const express = require('express');
const app = express();

//connectDB
const connectDB = require('./db/connect');
const authenticateUser = require('./middleware/authentication');

//routers
const authRouter = require('./routes/auth');
const moviesRouter = require('./routes/movies');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

const swaggerDocs = require('./swagger/movie-api.json');

app.set('trust proxy', 1);
app.use(rateLimiter({
    windowMs: 15 * 60 * 1000, //15 minutes
    max: 100, //limit each IP to 100 requests per windowMs
})
);
app.use(express.json());
app.use(helmet());
app.use(cors());

// app.use(cors({
//   origin: '*',
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   allowedHeaders: '*' // Allow all headers
// }));

app.use(xss());
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));



// routes

// app.get('/', (req, res) => {
//   res.send('<h1>Movies Review API</h1><a href="/api-docs">Documentation</a>');
// });
app.use(express.static("public"));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/movies', authenticateUser, moviesRouter);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();
