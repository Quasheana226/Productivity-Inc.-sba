
const mongoose = require('mongoose');

// Load environment variables  needed here because this file
// runs before server.js finishes loading everything
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI);

// Get a reference to the connection object so we can listen to events
const db = mongoose.connection;

// Log errors to the console if the connection fails
db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Log success when connected
db.once('open', () => {
  console.log('MongoDB connected successfully.');
});

// Export the connection so server.js can require it
// Requiring this file is enough to trigger the connection —
// you don't need to call any function on the export
module.exports = db;