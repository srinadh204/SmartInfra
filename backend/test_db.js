require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing connection to:', process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('SUCCESS: MongoDB connected to Atlas');
    process.exit(0);
  })
  .catch(err => {
    console.error('FAILURE: Could not connect to MongoDB');
    console.error(err);
    process.exit(1);
  });

setTimeout(() => {
  console.log('TIMEOUT: Connection attempt took too long (30s)');
  process.exit(1);
}, 30000);
