const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// Rate limit: max 10 inquiries per 15 minutes per IP
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many inquiries. Please try again later.' },
});

/**
 * @swagger
 * /api/inquiries:
 *   post:
 *     summary: Send an inquiry to a property owner
 *     tags: [Inquiries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [propertyId, message]
 *             properties:
 *               propertyId: { type: string }
 *               message: { type: string }
 *     responses:
 *       201:
 *         description: Inquiry sent
 *       409:
 *         description: Duplicate inquiry
 */
router.post(
  '/',
  auth,
  inquiryLimiter,
  [
    body('propertyId').notEmpty().withMessage('Property ID required'),
    body('message').trim().isLength({ min: 5, max: 1000 }).withMessage('Message must be 5-1000 characters'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { propertyId, message } = req.body;

      const property = await Property.findById(propertyId);
      if (!property) return res.status(404).json({ message: 'Property not found' });

      // Prevent owner from inquiring their own property
      if (property.owner.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot inquire about your own property' });
      }

      const inquiry = await Inquiry.create({
        property: propertyId,
        fromUser: req.user._id,
        message,
      });

      // Increment inquiry count on property
      await Property.findByIdAndUpdate(propertyId, { $inc: { inquiryCount: 1 } });

      res.status(201).json({ id: inquiry._id, message: 'Inquiry sent successfully' });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ message: 'You have already sent an inquiry for this property' });
      }
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/inquiries:
 *   get:
 *     summary: Get inquiries received on my properties
 *     tags: [Inquiries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of received inquiries
 */
router.get('/', auth, async (req, res, next) => {
  try {
    // Get all properties owned by user
    const myProperties = await Property.find({ owner: req.user._id }).select('_id title').lean();
    const propertyIds = myProperties.map((p) => p._id);

    const inquiries = await Inquiry.find({ property: { $in: propertyIds } })
      .populate('fromUser', 'name phone email')
      .populate('property', 'title')
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      inquiries.map((i) => ({
        id: i._id,
        propertyId: i.property?._id,
        propertyTitle: i.property?.title,
        fromUserName: i.fromUser?.name,
        fromUserPhone: i.fromUser?.phone,
        fromUserEmail: i.fromUser?.email,
        message: i.message,
        createdAt: i.createdAt,
      }))
    );
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/inquiries/sent:
 *   get:
 *     summary: Get inquiries sent by current user
 *     tags: [Inquiries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sent inquiries
 */
router.get('/sent', auth, async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({ fromUser: req.user._id })
      .populate('property', 'title city')
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      inquiries.map((i) => ({
        id: i._id,
        propertyId: i.property?._id,
        propertyTitle: i.property?.title,
        message: i.message,
        createdAt: i.createdAt,
      }))
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
