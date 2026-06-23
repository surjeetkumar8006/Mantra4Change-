const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb+srv://SURJEETKUMAR:VtOZsbxmH6vKZlmn@cluster0.ji8qiof.mongodb.net/bookmark-app';
        await mongoose.connect(uri);
        console.log('MongoDB Connected to bookmark-app');
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
