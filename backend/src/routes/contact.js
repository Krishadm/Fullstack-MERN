const router = require('express').Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const ContactMessage = require('../models/ContactMessage');
const validate = require('../middleware/validate');

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many messages. Please try again later.' },
});

router.post(
  '/',
  contactLimiter,
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').trim().isLength({ min: 5, max: 2000 }).withMessage('Message must be 5-2000 characters'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, phone, message } = req.body;
      await ContactMessage.create({ name, email, phone: phone || '', message });
      res.status(201).json({ message: 'Message sent successfully' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
