// index.js
const express = require('express');
const app = express();
const cors= require('cors');
app.use(cors());

const PORT = process.env.PORT||5000; // You can change this to your desired port

// Middleware to parse JSON requests
app.use(express.json());


// database
const connectDB=require('./config/db');

//connect database    
connectDB();

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Goods-Exchange Express API!');
});

app.use('/api/signup',require('./routes/api/signup'));
app.use('/api/login',require('./routes/api/login'));
app.use('/api/verify_token',require('./middlewares/verify_token'));
app.use('/api/verify',require('./routes/api/verify'));
app.use('/api/product',require('./routes/api/product'));












// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
