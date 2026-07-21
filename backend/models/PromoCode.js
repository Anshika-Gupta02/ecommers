import mongoose from 'mongoose';

const promoCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discount_percent: { type: Number, required: true },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

promoCodeSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const PromoCode = mongoose.models.PromoCode || mongoose.model('PromoCode', promoCodeSchema);
export default PromoCode;
