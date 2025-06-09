import express from 'express';
import 'dotenv/config';
import mongoose from 'mongoose';
import authRoutes from './src/router/authRoutes.js';
import bookRoutes from './src/router/bookRoutes.js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, ()=> {
            console.log('Server is running on port', PORT);
            console.log("Connected to MongoDB");
        });
    })
    .catch(console.error);