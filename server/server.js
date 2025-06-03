import dotenv from 'dotenv';
import app from './index.js';

dotenv.config();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

export default server;
