const mongoose = require('mongoose');

// connect mongodb database 
const connectDb = async () => {
    try {
        const mongoInstance = await mongoose.connect(process.env.DB_URL);
        console.log('Connected to Database');

    } catch (error) {

        console.log('Database connection got failed', error);
        process.exit(1);

    }
}

module.exports = connectDb