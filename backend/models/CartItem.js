import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  selected_size: { type: String, required: true },
  quantity: { type: Number, default: 1 }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

cartItemSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const CartItem = mongoose.models.CartItem || mongoose.model('CartItem', cartItemSchema);
export default CartItem;
