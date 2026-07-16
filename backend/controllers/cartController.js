import pool from '../db.js';

export async function getCart(req, res) {
  const userId = req.user.id;

  try {
    const [cartItems] = await pool.execute(`
      SELECT ci.*, p.name, p.price, pi.image_url AS primary_image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      WHERE ci.user_id = ?
    `, [userId]);

    res.json(cartItems);
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
    // Check if the item already exists in the cart with the same size
    const [existingItems] = await pool.execute(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND selected_size = ?',
      [userId, product_id, selected_size]
    );

    if (existingItems.length > 0) {
      // Update quantity
      const newQuantity = existingItems[0].quantity + Number(quantity);
      await pool.execute(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, existingItems[0].id]
      );
      res.json({ message: 'Cart item quantity updated', itemId: existingItems[0].id });
    } else {
      // Insert new item
      const [result] = await pool.execute(
        'INSERT INTO cart_items (user_id, product_id, selected_size, quantity) VALUES (?, ?, ?, ?)',
        [userId, product_id, selected_size, quantity]
      );
      res.status(201).json({ message: 'Item added to cart', itemId: result.insertId });
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
    // Verify item ownership
    const [items] = await pool.execute('SELECT id FROM cart_items WHERE id = ? AND user_id = ?', [id, userId]);
    if (items.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await pool.execute('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, id]);
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
    // Verify item ownership
    const [items] = await pool.execute('SELECT id FROM cart_items WHERE id = ? AND user_id = ?', [id, userId]);
    if (items.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await pool.execute('DELETE FROM cart_items WHERE id = ?', [id]);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error removing item from cart' });
  }
}
