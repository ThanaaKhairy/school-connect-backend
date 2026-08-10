const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI,{dbName: process.env.DATABASE_NAME});
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Error in MongoDB Connection : ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;