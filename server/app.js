const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const bodyParser = require('body-parser');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
// Middleware
app.use(morgan('dev'));          // HTTP request logger
app.use(helmet());               // Helps secure your app by setting various HTTP headers
app.use(cors());                 // Enables CORS
app.use(compression());         // Compresses response bodies
app.use(bodyParser.json());      // Parses incoming request bodies


// Connect to Database
connectDB();

app.use(express.json()); 

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/signup',authRoutes)
// Use other routes similarly

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
