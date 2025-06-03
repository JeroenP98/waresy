import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import routes from './routes/assetRoutes.js';


const app = express();
const PORT = 3000;

// Mongoose connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27017/waresy').then(() => {
    console.log('MongoDB connection established successfully');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// bodyParser setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routes(app);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));