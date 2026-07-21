import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  image_url: { type: String }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

categorySchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export default Category;
