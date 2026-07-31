const router = require('express').Router();
const { body } = require('express-validator');
const Property = require('../models/Property');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const propertyValidation = [
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('type').isIn(['apartment', 'house', 'villa', 'commercial', 'plot', 'pg']).withMessage('Invalid property type'),
  body('status').isIn(['for_sale', 'for_rent']).withMessage('Invalid status'),
  body('price').isFloat({ min: 1 }).withMessage('Price must be greater than 0'),
  body('city').trim().isLength({ min: 2 }).withMessage('City is required'),
  body('locality').trim().isLength({ min: 2 }).withMessage('Locality is required'),
  body('address').isLength({ min: 5 }).withMessage('Address is required'),
  body('area').isFloat({ min: 1 }).withMessage('Area must be greater than 0'),
];

const formatProperty = (p, userId) => ({
  id: p._id,
  title: p.title,
  description: p.description,
  type: p.type,
  status: p.status,
  price: p.price,
  city: p.city,
  locality: p.locality,
  address: p.address,
  bedrooms: p.bedrooms,
  bathrooms: p.bathrooms,
  area: p.area,
  images: p.images,
  amenities: p.amenities,
  isFurnished: p.isFurnished,
  parkingAvailable: p.parkingAvailable,
  ownerUserId: p.owner?._id || p.owner,
  ownerName: p.owner?.name,
  inquiryCount: p.inquiryCount,
  createdAt: p.createdAt,
});

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: List properties with search, filter, sort, pagination
 *     tags: [Properties]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [apartment, house, villa, commercial, plot, pg] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [for_sale, for_rent] }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: bedrooms
 *         schema: { type: number }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [newest, price_asc, price_desc, area_desc] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12 }
 *     responses:
 *       200:
 *         description: Paginated property list
 */
router.get('/', async (req, res, next) => {
  try {
    const { city, type, status, minPrice, maxPrice, bedrooms, sortBy, page = 1, limit = 12 } = req.query;

    const filter = {};
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (bedrooms) filter.bedrooms = { $gte: Number(bedrooms) };

    const sortMap = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      area_desc: { area: -1 },
    };
    const sort = sortMap[sortBy] || { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [properties, total] = await Promise.all([
      Property.find(filter).sort(sort).skip(skip).limit(limitNum).populate('owner', 'name').lean(),
      Property.countDocuments(filter),
    ]);

    res.json({
      properties: properties.map((p) => formatProperty(p)),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/properties/featured:
 *   get:
 *     summary: Get featured properties (latest 8)
 *     tags: [Properties]
 *     security: []
 *     responses:
 *       200:
 *         description: Featured properties
 */
router.get('/featured', async (req, res, next) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 8));
    const properties = await Property.find()
      .sort({ inquiryCount: -1, createdAt: -1 })
      .limit(limit)
      .populate('owner', 'name')
      .lean();
    res.json(properties.map(formatProperty));
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/properties/my-listings:
 *   get:
 *     summary: Get current user's property listings
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's listings
 */
router.get('/my-listings', auth, async (req, res, next) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .populate('owner', 'name')
      .lean();
    res.json(properties.map(formatProperty));
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get property by ID
 *     tags: [Properties]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Property details
 *       404:
 *         description: Not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name phone').lean();
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(formatProperty(property));
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/properties/{id}/similar:
 *   get:
 *     summary: Get similar properties
 *     tags: [Properties]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Similar properties
 */
router.get('/:id/similar', async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).lean();
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Similarity: same city + same type + same status, price within 30% range
    const priceRange = property.price * 0.3;
    const similar = await Property.find({
      _id: { $ne: property._id },
      city: property.city,
      type: property.type,
      status: property.status,
      price: { $gte: property.price - priceRange, $lte: property.price + priceRange },
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('owner', 'name')
      .lean();

    // Fallback: if less than 4, fill with same city + same status
    if (similar.length < 4) {
      const existingIds = [property._id, ...similar.map((p) => p._id)];
      const fallback = await Property.find({
        _id: { $nin: existingIds },
        city: property.city,
        status: property.status,
      })
        .sort({ createdAt: -1 })
        .limit(4 - similar.length)
        .populate('owner', 'name')
        .lean();
      similar.push(...fallback);
    }

    res.json(similar.map(formatProperty));
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create a new property listing
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Property created
 */
router.post('/', auth, propertyValidation, validate, async (req, res, next) => {
  try {
    const property = await Property.create({ ...req.body, owner: req.user._id });
    await property.populate('owner', 'name');
    res.status(201).json(formatProperty(property.toObject()));
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Update a property listing (owner only)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Property updated
 *       403:
 *         description: Forbidden
 */
router.put('/:id', auth, propertyValidation, validate, async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this property' });
    }

    const { owner, inquiryCount, ...updates } = req.body;
    Object.assign(property, updates);
    await property.save();
    await property.populate('owner', 'name');
    res.json(formatProperty(property.toObject()));
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Delete a property listing (owner only)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Property deleted
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }
    property.isDeleted = true;
    property.deletedAt = new Date();
    await property.save();
    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
