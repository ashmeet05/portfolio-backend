require('dotenv').config({ quiet: true });

// Stop early with a clear message if required settings are missing.
const missing = ['MONGO_URI', 'JWT_SECRET'].filter(k => !process.env[k]);
if (missing.length) {
  console.error(`Missing required setting(s) in .env: ${missing.join(', ')}. See .env.example.`);
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.warn('Warning: JWT_SECRET is short. Use at least 32 random characters.');
}
if (!process.env.ADMIN_EMAILS) {
  console.warn('Warning: ADMIN_EMAILS is not set, so nobody can add/edit/delete content. See .env.example.');
}

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
