import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import jsonwebtoken from "jsonwebtoken";
import routes from "./routes/index.js";
import cors from 'cors';
import helmet from "helmet";
import { rateLimit } from 'express-rate-limit'

const initializeApp = () => {
    dotenv.config();

    const app = express();

    app.use(cors())

    // Helmet setup
    app.use(helmet());

    // Rate limiting setup
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: "Too many requests from this IP, please try again after an hour",
    })

    app.use(limiter)

    // Mongoose connection
    mongoose.Promise = global.Promise;
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('MongoDB connection established successfully'))
        .catch(err => console.error('MongoDB connection error:', err));

    // Middleware setup
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    // JWT setup
    app.use((req, res, next) => {
        if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            jsonwebtoken.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET, (err, decode) => {
                if(err) req.user = undefined;
                req.user = decode;
                next()
            });
        } else {
            req.user = undefined;
            next();
        }
    })

    // Set up routes
    routes(app);
    return app;
};

// Initialize the application
const app = initializeApp();
export default app;
