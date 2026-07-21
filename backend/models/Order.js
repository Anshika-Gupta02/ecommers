import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  product_name: { type: String, required: true },
  selected_size: { type: String, required: true },
  quantity: { type: Number, required: true },
  price_at_purchase: { type: Number, required: true },
  primary_image: { type: String }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  total_amount: { type: Number, required: true },
  shipping_address: { type: String, required: true },
  payment_status: { type: String, default: 'Paid' },
  order_status: { type: String, default: 'Processing' },
  items: [orderItemSchema],
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

orderSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
