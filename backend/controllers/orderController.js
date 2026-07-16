import pool from '../db.js';

export async function createOrder(req, res) {
  const userId = req.user.id;
  const { shipping_address, promo_code, shipping_method } = req.body;

  if (!shipping_address) {
    return res.status(400).json({ message: 'Shipping address is required' });
  }

  // Get database connection for transaction
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get cart items with prices
    const [cartItems] = await connection.execute(`
      SELECT ci.*, p.price 
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `, [userId]);

    if (cartItems.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'Cannot place order. Your cart is empty' });
    }

    // 2. Calculate base total and validate promo code
    const baseTotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    let discount = 0;

    if (promo_code) {
      const [promoRows] = await connection.execute(
        'SELECT discount_percent, is_active FROM promo_codes WHERE code = ?',
        [promo_code.trim().toUpperCase()]
      );
      if (promoRows.length > 0 && promoRows[0].is_active === 1) {
        discount = baseTotal * (promoRows[0].discount_percent / 100);
      }
    }

    const isFreeShippingAvailable = baseTotal >= 300;
    const shipping = shipping_method === 'express'
      ? (isFreeShippingAvailable ? 15.00 : 35.00)
      : (isFreeShippingAvailable ? 0.00 : 15.00);

    const totalAmount = baseTotal - discount + shipping;

    // 3. Create the order
    const [orderResult] = await connection.execute(`
      INSERT INTO orders (user_id, total_amount, shipping_address, payment_status, order_status)
      VALUES (?, ?, ?, 'Paid', 'Processing')
    `, [userId, totalAmount, shipping_address]);

    const orderId = orderResult.insertId;

    // 4. Insert items into order_items
    for (let item of cartItems) {
      await connection.execute(`
        INSERT INTO order_items (order_id, product_id, selected_size, quantity, price_at_purchase)
        VALUES (?, ?, ?, ?, ?)
      `, [orderId, item.product_id, item.selected_size, item.quantity, item.price]);
    }

    // 5. Clear user's cart
    await connection.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    // Commit transaction
    await connection.commit();
    connection.release();

    res.status(201).json({
      message: 'Order created successfully',
      orderId,
      totalAmount
    });

  } catch (error) {
    // Rollback transaction on failure
    await connection.rollback();
    connection.release();
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
}

export async function getOrders(req, res) {
  const userId = req.user.id;

  try {
    const [rows] = await pool.execute(`
      SELECT o.*, 
             oi.id AS item_id, oi.product_id, oi.selected_size, oi.quantity, oi.price_at_purchase,
             p.name AS product_name, pi.image_url AS primary_image
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [userId]);

    // Group rows by order ID
    const ordersMap = {};
    rows.forEach(row => {
      if (!ordersMap[row.id]) {
        ordersMap[row.id] = {
          id: row.id,
          total_amount: row.total_amount,
          shipping_address: row.shipping_address,
          payment_status: row.payment_status,
          order_status: row.order_status,
          created_at: row.created_at,
          items: []
        };
      }

      if (row.item_id) {
        ordersMap[row.id].items.push({
          id: row.item_id,
          product_id: row.product_id,
          product_name: row.product_name,
          selected_size: row.selected_size,
          quantity: row.quantity,
          price_at_purchase: row.price_at_purchase,
          primary_image: row.primary_image
        });
      }
    });

    res.json(Object.values(ordersMap));
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
}
