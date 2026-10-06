const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { isAdmin } = require('../middleware/auth');

const isText = (v) => typeof v === 'string' && v.trim().length > 0;

const publicUser = (user) => ({
  id: user._id,
  firstname: user.firstname,
  lastname: user.lastname,
  email: user.email,
  isAdmin: isAdmin(user)
});

const makeToken = (user) =>
  jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '24h'
  });

exports.signup = async (req, res, next) => {
  try {
    const { firstname, lastname, email, password } = req.body || {};

    if (![firstname, lastname, email, password].every(isText)) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ firstname, lastname, email, password });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token: makeToken(user),
      user: publicUser(user)
    });
  } catch (err) { next(err); }
};

exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const fail = () => res.status(401).json({ success: false, message: 'Invalid email or password.' });

    if (!isText(email) || !isText(password)) return fail();

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) return fail();

    res.json({
      success: true,
      message: 'Signed in successfully.',
      token: makeToken(user),
      user: publicUser(user)
    });
  } catch (err) { next(err); }
};
