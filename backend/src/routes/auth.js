const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Email already exists
 */
router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email required'),
    body('phone').isMobilePhone().withMessage('Valid phone required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, phone, password } = req.body;
      const user = await User.create({ name, email, phone, password });
      const token = signToken(user._id);
      res.status(201).json({ token, user: user.toSafeObject() });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const token = signToken(user._id);
      res.json({ token, user: user.toSafeObject() });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Unauthorized
 */
router.get('/me', auth, (req, res) => {
  res.json(req.user.toSafeObject());
});

module.exports = router;
