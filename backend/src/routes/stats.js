const router = require('express').Router();
const Property = require('../models/Property');

/**
 * @swagger
 * /api/stats/overview:
 *   get:
 *     summary: Get platform statistics
 *     tags: [Stats]
 *     security: []
 *     responses:
 *       200:
 *         description: Platform stats
 */
router.get('/overview', async (req, res, next) => {
  try {
    const [totalProperties, forSaleCount, forRentCount, cityCount] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ status: 'for_sale' }),
      Property.countDocuments({ status: 'for_rent' }),
      Property.distinct('city').then((cities) => cities.length),
    ]);

    res.json({ totalProperties, forSaleCount, forRentCount, totalCities: cityCount });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/stats/top-cities:
 *   get:
 *     summary: Get top cities by property count
 *     tags: [Stats]
 *     security: []
 *     responses:
 *       200:
 *         description: Top cities
 */
router.get('/top-cities', async (req, res, next) => {
  try {
    const cities = await Property.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      { $project: { _id: 0, city: '$_id', count: 1 } },
    ]);
    res.json(cities);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
