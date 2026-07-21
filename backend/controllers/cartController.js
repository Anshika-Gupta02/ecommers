import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

export async function getCart(req, res) {
  const userId = req.user.id;

  try {
    const cartItems = await CartItem.find({ user: userId }).populate('product');

    const formattedCart = cartItems.map(item => {
      const p = item.product;
      const primaryImg = p && p.images && p.images.length > 0
        ? (p.images.find(i => i.is_primary)?.image_url || p.images[0].image_url)
        : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600';

      return {
        id: item._id.toString(),
        user_id: item.user.toString(),
        product_id: p ? p._id.toString() : null,
        name: p ? p.name : 'Product Unavailable',
        price: p ? p.price : 0,
        selected_size: item.selected_size,
        quantity: item.quantity,
        primary_image: primaryImg
      };
    });

    res.json(formattedCart);
  } catch (error) {
    console.error('Fetch cart error:', error);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
}

export async function addToCart(req, res) {
  const userId = req.user.id;
  const { product_id, selected_size, quantity = 1 } = req.body;

  if (!product_id || !selected_size) {
    return res.status(400).json({ message: 'Product ID and size are required' });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(product_id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check existing item
    let existingItem = await CartItem.findOne({
      user: userId,
      product: product_id,
      selected_size
    });

    if (existingItem) {
      existingItem.quantity += Number(quantity);
      await existingItem.save();
      res.json({ message: 'Cart item quantity updated', itemId: existingItem._id.toString() });
    } else {
      const cartItem = new CartItem({
        user: userId,
        product: product_id,
        selected_size,
        quantity: Number(quantity)
      });
      await cartItem.save();
      res.status(201).json({ message: 'Item added to cart', itemId: cartItem._id.toString() });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
}

export async function updateCartItemQuantity(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ message: 'Valid quantity is required' });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    const item = await CartItem.findOneAndUpdate(
      { _id: id, user: userId },
      { quantity: Number(quantity) },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Cart item updated' });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ message: 'Server error updating cart item' });
  }
}

export async function removeFromCart(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    const item = await CartItem.findOneAndDelete({ _id: id, user: userId });
    if (!item) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error removing item from cart' });
  }
}
