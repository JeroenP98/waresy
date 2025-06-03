import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import routes from './routes/routes.js';
import dotenv from 'dotenv';
import db from "./dbConnect.js";

const initializeApp = () => {
    dotenv.config();

    const app = express();
    const PORT = process.env.PORT || 3000;

    // Mongoose connection
    mongoose.Promise = global.Promise;
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('MongoDB connection established successfully'))
        .catch(err => console.error('MongoDB connection error:', err));

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    routes(app);

    return app;
};

const app = initializeApp();
export default app;
