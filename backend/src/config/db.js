 const mongoose = require('mongoose');
 const { MONGO_URI } = require('./env');

 const connectDB = async () => {
   if (!MONGO_URI) {
     throw new Error('MONGO_URI is not defined in environment variables');
   }

   try {
     await mongoose.connect(MONGO_URI);
     // Connection successful
   } catch (error) {
     // Rethrow so the caller can decide how to handle it
     throw error;
   }
 };

 module.exports = { connectDB };
