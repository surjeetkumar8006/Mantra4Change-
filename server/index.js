require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

const SchoolResponse = require('./models/SchoolResponse');
const GrantFinance = require('./models/GrantFinance');
const GrantPerformance = require('./models/GrantPerformance');
const MediaEvidence = require('./models/MediaEvidence');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to DB
connectDB();

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
