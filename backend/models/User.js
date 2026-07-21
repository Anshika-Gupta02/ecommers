import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
