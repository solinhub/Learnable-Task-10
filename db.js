/*const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI,)

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

module.exports = db;
*/



const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1); 
    }
};

module.exports = connectDB;
