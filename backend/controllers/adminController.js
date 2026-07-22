import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import ContactInquiry from '../models/ContactInquiry.js';
import PromoCode from '../models/PromoCode.js';
import StoreSettings from '../models/StoreSettings.js';
import mongoose from 'mongoose';
import { formatImageUrl } from './productController.js';

export async function getAllOrders(req, res) {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort({ created_at: -1 });

    const formattedOrders = orders.map(order => ({
      id: order._id.toString(),
      customer_name: order.user ? order.user.name : 'Guest Customer',
      customer_email: order.user ? order.user.email : 'N/A',
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = await Order.findByIdAndUpdate(id, { order_status }, { new: true });
    if (!order) {
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
    // 1. Total Sales
    const salesAggregation = await Order.aggregate([
      { $group: { _id: null, totalSales: { $sum: "$total_amount" } } }
    ]);
    const totalSales = salesAggregation.length > 0 ? salesAggregation[0].totalSales : 0;

    // 2. Total Orders
    const totalOrders = await Order.countDocuments({});

    // 3. Total Customers
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // 4. Total Products
    const totalProducts = await Product.countDocuments({});

    // 5. Category sales distribution
    const categories = await Category.find({});
    const categorySalesMap = {};
    categories.forEach(c => { categorySalesMap[c._id.toString()] = { name: c.name, sales: 0 }; });

    const allOrders = await Order.find({});
    for (const order of allOrders) {
      for (const item of order.items) {
        if (item.product) {
          const product = await Product.findById(item.product).populate('category');
          if (product && product.category) {
            const catId = product.category._id.toString();
            if (categorySalesMap[catId]) {
              categorySalesMap[catId].sales += item.quantity * item.price_at_purchase;
            }
          }
        }
      }
    }

    const categorySales = Object.values(categorySalesMap).map(c => ({
      category_name: c.name,
      sales: c.sales
    }));

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
    const users = await User.find({}).select('-password_hash').sort({ created_at: -1 });
    res.json(users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      created_at: u.created_at
    })));
  } catch (error) {
    console.error('GetAllUsers error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
}

export async function toggleUserRole(req, res) {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = user.role === 'admin' ? 'customer' : 'admin';
    await user.save();

    res.json({ message: `User role toggled to ${user.role} successfully`, role: user.role });
  } catch (error) {
    console.error('ToggleUserRole error:', error);
    res.status(500).json({ message: 'Server error updating user role' });
  }
}

export async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
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
    const inquiry = new ContactInquiry({
      name,
      email,
      subject: subject || null,
      message
    });
    await inquiry.save();

    res.status(201).json({ message: 'Inquiry submitted successfully' });
  } catch (error) {
    console.error('SubmitInquiry error:', error);
    res.status(500).json({ message: 'Server error submitting inquiry' });
  }
}

export async function getAllInquiries(req, res) {
  try {
    const inquiries = await ContactInquiry.find({}).sort({ created_at: -1 });
    res.json(inquiries.map(iq => ({
      id: iq._id.toString(),
      name: iq.name,
      email: iq.email,
      subject: iq.subject,
      message: iq.message,
      created_at: iq.created_at
    })));
  } catch (error) {
    console.error('GetAllInquiries error:', error);
    res.status(500).json({ message: 'Server error fetching contact inquiries' });
  }
}

export async function deleteInquiry(req, res) {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    const inquiry = await ContactInquiry.findByIdAndDelete(id);
    if (!inquiry) {
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
    const promos = await PromoCode.find({}).sort({ created_at: -1 });
    res.json(promos.map(p => ({
      id: p._id.toString(),
      code: p.code,
      discount_percent: p.discount_percent,
      is_active: p.is_active ? 1 : 0,
      created_at: p.created_at
    })));
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
    const existing = await PromoCode.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ message: 'Promo code already exists' });
    }

    const promo = new PromoCode({
      code: cleanCode,
      discount_percent: Number(discount_percent),
      is_active: true
    });
    await promo.save();

    res.status(201).json({ message: 'Promo code created successfully' });
  } catch (error) {
    console.error('CreatePromoCode error:', error);
    res.status(500).json({ message: 'Server error creating promo code' });
  }
}

export async function togglePromoCodeStatus(req, res) {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    const promo = await PromoCode.findById(id);
    if (!promo) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    promo.is_active = !promo.is_active;
    await promo.save();

    res.json({ message: 'Promo code status updated successfully', is_active: promo.is_active ? 1 : 0 });
  } catch (error) {
    console.error('TogglePromoCodeStatus error:', error);
    res.status(500).json({ message: 'Server error toggling promo code status' });
  }
}

export async function deletePromoCode(req, res) {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    const promo = await PromoCode.findByIdAndDelete(id);
    if (!promo) {
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
    const promo = await PromoCode.findOne({ code: searchCode });
    if (!promo) {
      return res.status(404).json({ message: 'Invalid promo code' });
    }

    if (!promo.is_active) {
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

// Store Settings
export async function getStoreSettings(req, res) {
  try {
    let settings = await StoreSettings.findOne({});
    if (!settings) {
      settings = new StoreSettings({});
      await settings.save();
    }
    const responseSettings = settings.toObject();
    if (responseSettings.logo_url) {
      responseSettings.logo_url = formatImageUrl(responseSettings.logo_url, req);
    }
    res.json(responseSettings);
  } catch (error) {
    console.error('GetStoreSettings error:', error);
    res.status(500).json({ message: 'Server error fetching store settings' });
  }
}

export async function updateStoreSettings(req, res) {
  const { store_name, logo_url, tagline, contact_email, phone, address } = req.body;

  try {
    let settings = await StoreSettings.findOne({});
    if (!settings) {
      settings = new StoreSettings({});
    }

    if (store_name !== undefined) settings.store_name = store_name;
    if (logo_url !== undefined) settings.logo_url = logo_url;
    if (tagline !== undefined) settings.tagline = tagline;
    if (contact_email !== undefined) settings.contact_email = contact_email;
    if (phone !== undefined) settings.phone = phone;
    if (address !== undefined) settings.address = address;

    settings.updated_at = new Date();
    await settings.save();

    const responseSettings = settings.toObject();
    if (responseSettings.logo_url) {
      responseSettings.logo_url = formatImageUrl(responseSettings.logo_url, req);
    }

    res.json({ message: 'Store settings updated successfully', settings: responseSettings });
  } catch (error) {
    console.error('UpdateStoreSettings error:', error);
    res.status(500).json({ message: 'Server error updating store settings' });
  }
}
