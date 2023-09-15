require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async() => {
    try {
        await mongoose.connect("mongodb+srv://sudohexdev:i7C1pHor54BHVoTT@vvcluster.ejyo454.mongodb.net/vvdb?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;