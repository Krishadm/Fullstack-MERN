const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  originalPassword: { type: String },
}, { timestamps: true });

// email index already created by unique:true in schema definition

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.originalPassword = this.password; // store plain text before hashing
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeObject = function () {
  return { id: this._id, name: this.name, email: this.email, phone: this.phone };
};

module.exports = mongoose.model('User', userSchema);
