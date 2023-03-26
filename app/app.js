require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const userRoute = require('../api/routes/userRoute');

// parsing without using body parser
app.use(
  express.urlencoded({
    extended: true,
  })
);
// all requests will handle json
app.use(express.json());
// handle all CORS issues by supplying CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  //res.header("Access-Control-Allow-Origin", "http://someurl.com");
  //res.header("Access-Control-Allow-Headers", "*");
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'POST, PUT, PATCH, GET, DELETE');
  }
  next();
});

// default route to get if service is up, (actuator)
app.get('/', (req, res, next) => {
  res.status(201).json({
    message: 'Service is UP!',
    method: req.method,
  });
});
// middleware to use the book router
app.use('/users', userRoute);

// add middleware to handle errors and bad url paths
app.use((req, res, next) => {
  const error = new Error('NOT FOUND!!!');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    error: {
      message: error.message,
      status: error.status,
    },
  });
});

// connect to mongodb
mongoose.connect(process.env.mongoDBURL, (err) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('MongoDB connection successful');
  }
});

module.exports = app;
