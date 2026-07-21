import Order from '../models/Order.js';
import CartItem from '../models/CartItem.js';
import PromoCode from '../models/PromoCode.js';

export async function createOrder(req, res) {
  const userId = req.user.id;
  const { shipping_address, promo_code, shipping_method } = req.body;

  if (!shipping_address) {
    return res.status(400).json({ message: 'Shipping address is required' });
  }

  try {
    // 1. Get user's cart items
    const cartItems = await CartItem.find({ user: userId }).populate('product');

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cannot place order. Your cart is empty' });
    }

    // 2. Calculate base total & validate promo code
    let baseTotal = 0;
    const orderItems = [];

    cartItems.forEach(item => {
      const p = item.product;
      const price = p ? p.price : 0;
      baseTotal += price * item.quantity;

      const primaryImg = p && p.images && p.images.length > 0
        ? (p.images.find(i => i.is_primary)?.image_url || p.images[0].image_url)
        : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600';

      orderItems.push({
        product: p ? p._id : null,
        product_name: p ? p.name : 'Unknown Product',
        selected_size: item.selected_size,
        quantity: item.quantity,
        price_at_purchase: price,
        primary_image: primaryImg
      });
    });

    let discount = 0;
    if (promo_code) {
      const cleanCode = promo_code.trim().toUpperCase();
      const promo = await PromoCode.findOne({ code: cleanCode, is_active: true });
      if (promo) {
        discount = baseTotal * (promo.discount_percent / 100);
      }
    }

    const isFreeShippingAvailable = baseTotal >= 300;
    const shipping = shipping_method === 'express'
      ? (isFreeShippingAvailable ? 15.00 : 35.00)
      : (isFreeShippingAvailable ? 0.00 : 15.00);

    const totalAmount = baseTotal - discount + shipping;

    // 3. Save order
    const order = new Order({
      user: userId,
      total_amount: totalAmount,
      shipping_address,
      payment_status: 'Paid',
      order_status: 'Processing',
      items: orderItems
    });

    await order.save();

    // 4. Clear user's cart
    await CartItem.deleteMany({ user: userId });

    res.status(201).json({
      message: 'Order created successfully',
      orderId: order._id.toString(),
      totalAmount
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
}

export async function getOrders(req, res) {
  const userId = req.user.id;

  try {
    const orders = await Order.find({ user: userId }).sort({ created_at: -1 });

    const formattedOrders = orders.map(order => ({
      id: order._id.toString(),
      total_amount: order.total_amount,
      shipping_address: order.shipping_address,
      payment_status: order.payment_status,
      order_status: order.order_status,
      created_at: order.created_at,
      items: order.items.map(item => ({
        id: item._id ? item._id.toString() : item.product?.toString(),
        product_id: item.product ? item.product.toString() : null,
        product_name: item.product_name,
        selected_size: item.selected_size,
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase,
        primary_image: item.primary_image
      }))
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
}
