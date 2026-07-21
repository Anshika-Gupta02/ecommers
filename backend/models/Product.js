import mongoose from 'mongoose';

const productImageSchema = new mongoose.Schema({
  image_url: { type: String, required: true },
  is_primary: { type: Boolean, default: false }
});

const productSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  size_options: { type: [String], default: ["XS", "S", "M", "L"] },
  details: { type: String },
  images: [productImageSchema],
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

productSchema.virtual('primary_image').get(function() {
  if (this.images && this.images.length > 0) {
    const primary = this.images.find(img => img.is_primary);
    return primary ? primary.image_url : this.images[0].image_url;
  }
  return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600';
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
