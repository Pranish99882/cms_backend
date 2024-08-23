import mongoose from 'mongoose';

export const connectMongoDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/uba');
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
