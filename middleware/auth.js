const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Emails allowed to change portfolio content and manage users.
// Set ADMIN_EMAILS in .env, e.g. ADMIN_EMAILS=you@example.com
const adminEmails = () =>
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

const isAdmin = (user) => !!user && adminEmails().includes(user.email);

// Requires a valid login token. Puts the current user on req.user.
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: 'Please sign in first.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    // Check the account still exists, and use its current email.
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Account no longer exists.' });
    }
    req.user = { id: user._id.toString(), email: user.email, isAdmin: isAdmin(user) };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session. Please sign in again.' });
  }
}

// Only admins (ADMIN_EMAILS) may continue.
function requireAdmin(req, res, next) {
  if (req.user && req.user.isAdmin) return next();
  return res.status(403).json({ success: false, message: 'You do not have permission to do this.' });
}

module.exports = requireAuth;
module.exports.requireAuth = requireAuth;
module.exports.requireAdmin = requireAdmin;
module.exports.isAdmin = isAdmin;
