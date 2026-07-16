import pool from '../db.js';

export async function getAllOrders(req, res) {
  try {
    const [rows] = await pool.execute(`
      SELECT o.*, u.name AS customer_name, u.email AS customer_email,
             oi.id AS item_id, oi.product_id, oi.selected_size, oi.quantity, oi.price_at_purchase,
             p.name AS product_name, pi.image_url AS primary_image
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      ORDER BY o.created_at DESC
    `);

    // Group rows by order ID
    const ordersMap = {};
    rows.forEach(row => {
      if (!ordersMap[row.id]) {
        ordersMap[row.id] = {
          id: row.id,
          customer_name: row.customer_name,
          customer_email: row.customer_email,
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
    console.error('Admin fetch orders error:', error);
    res.status(500).json({ message: 'Server error fetching all orders' });
  }
}

export async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { order_status } = req.body;

  if (!order_status) {
    return res.status(400).json({ message: 'Order status is required' });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE orders SET order_status = ? WHERE id = ?',
      [order_status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
}

export async function getStats(req, res) {
  try {
    // 1. Total Sales / Revenue
    const [salesRow] = await pool.execute("SELECT SUM(total_amount) AS total_sales FROM orders");
    const totalSales = Number(salesRow[0].total_sales || 0);

    // 2. Total Orders count
    const [ordersRow] = await pool.execute("SELECT COUNT(*) AS total_orders FROM orders");
    const totalOrders = Number(ordersRow[0].total_orders || 0);

    // 3. Total Customers count (customers only, exclude admin)
    const [customersRow] = await pool.execute("SELECT COUNT(*) AS total_customers FROM users WHERE role = 'customer'");
    const totalCustomers = Number(customersRow[0].total_customers || 0);

    // 4. Total Products count
    const [productsRow] = await pool.execute("SELECT COUNT(*) AS total_products FROM products");
    const totalProducts = Number(productsRow[0].total_products || 0);

    // 5. Category distribution / sales by category
    const [categorySales] = await pool.execute(`
      SELECT c.name AS category_name, COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) AS sales
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY c.name
    `);

    res.json({
      metrics: {
        totalSales,
        totalOrders,
        totalCustomers,
        totalProducts
      },
      categorySales
    });
  } catch (error) {
    console.error('Admin fetch stats error:', error);
    res.status(500).json({ message: 'Server error fetching store analytics' });
  }
}

// User Management
export async function getAllUsers(req, res) {
  try {
    const [rows] = await pool.execute('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('GetAllUsers error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
}

export async function toggleUserRole(req, res) {
  const { id } = req.params;
  try {
    const [userRows] = await pool.execute('SELECT role FROM users WHERE id = ?', [id]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const currentRole = userRows[0].role;
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';

    await pool.execute('UPDATE users SET role = ? WHERE id = ?', [newRole, id]);
    res.json({ message: `User role toggled to ${newRole} successfully`, role: newRole });
  } catch (error) {
    console.error('ToggleUserRole error:', error);
    res.status(500).json({ message: 'Server error updating user role' });
  }
}

export async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('DeleteUser error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
}

// Contact Inquiries
export async function submitInquiry(req, res) {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required' });
  }
  try {
    await pool.execute(
      'INSERT INTO contact_inquiries (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject || null, message]
    );
    res.status(201).json({ message: 'Inquiry submitted successfully' });
  } catch (error) {
    console.error('SubmitInquiry error:', error);
    res.status(500).json({ message: 'Server error submitting inquiry' });
  }
}

export async function getAllInquiries(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM contact_inquiries ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('GetAllInquiries error:', error);
    res.status(500).json({ message: 'Server error fetching contact inquiries' });
  }
}

export async function deleteInquiry(req, res) {
  const { id } = req.params;
  try {
    const [result] = await pool.execute('DELETE FROM contact_inquiries WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('DeleteInquiry error:', error);
    res.status(500).json({ message: 'Server error deleting inquiry' });
  }
}

// Promo Codes
export async function getAllPromoCodes(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM promo_codes ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('GetAllPromoCodes error:', error);
    res.status(500).json({ message: 'Server error fetching promo codes' });
  }
}

export async function createPromoCode(req, res) {
  const { code, discount_percent } = req.body;
  if (!code || !discount_percent) {
    return res.status(400).json({ message: 'Promo code and discount percentage are required' });
  }
  try {
    const cleanCode = code.trim().toUpperCase();
    await pool.execute(
      'INSERT INTO promo_codes (code, discount_percent, is_active) VALUES (?, ?, 1)',
      [cleanCode, discount_percent]
    );
    res.status(201).json({ message: 'Promo code created successfully' });
  } catch (error) {
    console.error('CreatePromoCode error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Promo code already exists' });
    }
    res.status(500).json({ message: 'Server error creating promo code' });
  }
}

export async function togglePromoCodeStatus(req, res) {
  const { id } = req.params;
  try {
    const [promoRows] = await pool.execute('SELECT is_active FROM promo_codes WHERE id = ?', [id]);
    if (promoRows.length === 0) {
      return res.status(404).json({ message: 'Promo code not found' });
    }
    const currentStatus = promoRows[0].is_active;
    const newStatus = currentStatus === 1 ? 0 : 1;

    await pool.execute('UPDATE promo_codes SET is_active = ? WHERE id = ?', [newStatus, id]);
    res.json({ message: 'Promo code status updated successfully', is_active: newStatus });
  } catch (error) {
    console.error('TogglePromoCodeStatus error:', error);
    res.status(500).json({ message: 'Server error toggling promo code status' });
  }
}

export async function deletePromoCode(req, res) {
  const { id } = req.params;
  try {
    const [result] = await pool.execute('DELETE FROM promo_codes WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Promo code not found' });
    }
    res.json({ message: 'Promo code deleted successfully' });
  } catch (error) {
    console.error('DeletePromoCode error:', error);
    res.status(500).json({ message: 'Server error deleting promo code' });
  }
}

export async function validatePromoCode(req, res) {
  const { code } = req.params;
  if (!code) {
    return res.status(400).json({ message: 'Promo code is required' });
  }
  try {
    const searchCode = code.trim().toUpperCase();
    const [rows] = await pool.execute(
      'SELECT discount_percent, is_active FROM promo_codes WHERE code = ?',
      [searchCode]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Invalid promo code' });
    }
    const promo = rows[0];
    if (promo.is_active !== 1) {
      return res.status(400).json({ message: 'This promo code is no longer active' });
    }

    res.json({ 
      valid: true, 
      code: searchCode, 
      discount_percent: promo.discount_percent 
    });
  } catch (error) {
    console.error('ValidatePromoCode error:', error);
    res.status(500).json({ message: 'Server error validating promo code' });
  }
}

