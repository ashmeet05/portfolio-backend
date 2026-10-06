const mongoose = require('mongoose');

// Some home networks can't resolve mongodb+srv:// addresses, so public DNS
// servers are used by default. Set DNS_SERVERS=system in .env to turn this off,
// or give your own list, e.g. DNS_SERVERS=8.8.8.8,1.1.1.1
const dnsServers = process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1';
if (dnsServers !== 'system') {
  require('dns').setServers(dnsServers.split(',').map(s => s.trim()));
}

// Treat user input in queries as plain values, never as database operators
// (blocks "NoSQL injection" like { "email": { "$ne": null } }).
mongoose.set('sanitizeFilter', true);
mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
