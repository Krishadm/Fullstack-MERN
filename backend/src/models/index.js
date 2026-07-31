const User = require('./User');
const Property = require('./Property');
const Inquiry = require('./Inquiry');
const ContactMessage = require('./ContactMessage');

// Associations
User.hasMany(Property, { foreignKey: 'ownerId', as: 'properties' });
Property.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

User.hasMany(Inquiry, { foreignKey: 'fromUserId', as: 'sentInquiries' });
Inquiry.belongsTo(User, { foreignKey: 'fromUserId', as: 'fromUser' });

Property.hasMany(Inquiry, { foreignKey: 'propertyId', as: 'inquiries' });
Inquiry.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

module.exports = { User, Property, Inquiry, ContactMessage };
