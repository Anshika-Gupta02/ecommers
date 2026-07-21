import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema({
  store_name: { type: String, required: true, default: "Anshika's Store" },
  logo_url: { type: String, default: "" },
  tagline: { type: String, default: "Luxury Linens & Home Comfort" },
  contact_email: { type: String, default: "support@anshikastore.com" },
  phone: { type: String, default: "+1 (800) 555-0199" },
  address: { type: String, default: "742 Botanical Way, Suite 400, New York, NY 10013" },
  updated_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

storeSettingsSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const StoreSettings = mongoose.models.StoreSettings || mongoose.model('StoreSettings', storeSettingsSchema);
export default StoreSettings;
