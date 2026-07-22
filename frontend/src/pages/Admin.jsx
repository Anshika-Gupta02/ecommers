import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { 
  TrendingUp, ShoppingBag, Users, Layers, 
  Plus, Edit, Trash2, X, RefreshCw,
  Mail, Tag, ShieldAlert, ToggleLeft, ToggleRight, UserCog, Settings
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function Admin({ setPage }) {
  const { token, user, isAuthenticated } = useAuth();

  const resolveImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const backendBase = API_URL.replace('/api', '');
    return `${backendBase}${url}`;
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Active Admin Sub-tab
  const [activeTab, setActiveTab] = useState('stats');

  // API Data States
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [inquiriesList, setInquiriesList] = useState([]);
  const [promoList, setPromoList] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Store Settings States
  const { settings, updateSettings } = useSettings();
  const [settingsStoreName, setSettingsStoreName] = useState('');
  const [settingsLogoUrl, setSettingsLogoUrl] = useState('');
  const [settingsTagline, setSettingsTagline] = useState('');
  const [settingsContactEmail, setSettingsContactEmail] = useState('');
  const [settingsPhone, setSettingsPhone] = useState('');
  const [settingsAddress, setSettingsAddress] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (settings) {
      setSettingsStoreName(settings.store_name || "ANSHIKA'S STORE");
      setSettingsLogoUrl(settings.logo_url || '');
      setSettingsTagline(settings.tagline || 'Luxury Linens & Home Comfort');
      setSettingsContactEmail(settings.contact_email || 'support@anshikastore.com');
      setSettingsPhone(settings.phone || '+1 (800) 555-0199');
      setSettingsAddress(settings.address || '742 Botanical Way, Suite 400, New York, NY 10013');
    }
  }, [settings]);

  const handleSaveStoreSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateSettings({
        store_name: settingsStoreName,
        logo_url: settingsLogoUrl,
        tagline: settingsTagline,
        contact_email: settingsContactEmail,
        phone: settingsPhone,
        address: settingsAddress
      }, token);

      Swal.fire({
        title: 'Branding Updated!',
        text: 'Store Name, Logo, and Details have been updated live across the entire storefront.',
        icon: 'success',
        confirmButtonColor: '#3D4A3E'
      });
    } catch (err) {
      console.error('Save settings error:', err);
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to update store settings.',
        icon: 'error',
        confirmButtonColor: '#3D4A3E'
      });
    } finally {
      setSavingSettings(false);
    }
  };

  // Promo code states
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('');
  const [promoFormError, setPromoFormError] = useState('');

  // Form states (Add/Edit Product)
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null); // null means adding
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formSizes, setFormSizes] = useState(['Queen', 'King']);
  const [formDescription, setFormDescription] = useState('');
  const [formDetails, setFormDetails] = useState('');
  const [formImages, setFormImages] = useState([]); // Array of { image_url, is_primary }

  const sizeOptions = ['Twin', 'Queen', 'King', 'Standard', 'Euro', 'O/S'];

  // Security check: Redirect non-admins
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      setPage('home');
    }
  }, [isAuthenticated, user]);

  // Load Admin Data on Mount and tab switch
  useEffect(() => {
    if (token) {
      loadAdminData();
    }
  }, [token, activeTab]);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Always load categories (needed for dropdown select)
      const catRes = await fetch(`${API_URL}/categories`);
      if (!catRes.ok) {
        throw new Error(`Failed to load categories: ${catRes.status} ${catRes.statusText}`);
      }
      const catData = await catRes.json();
      setCategories(catData);

      if (activeTab === 'stats') {
        const statsRes = await fetch(`${API_URL}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!statsRes.ok) {
          throw new Error(`Failed to load admin stats: ${statsRes.status} ${statsRes.statusText}`);
        }
        const statsData = await statsRes.json();
        setStats(statsData);
      } else if (activeTab === 'products') {
        const prodRes = await fetch(`${API_URL}/products`);
        if (!prodRes.ok) {
          throw new Error(`Failed to load products: ${prodRes.status} ${prodRes.statusText}`);
        }
        const prodData = await prodRes.json();
        setProducts(prodData);
      } else if (activeTab === 'orders') {
        const ordRes = await fetch(`${API_URL}/admin/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!ordRes.ok) {
          throw new Error(`Failed to load orders: ${ordRes.status} ${ordRes.statusText}`);
        }
        const ordData = await ordRes.json();
        setOrders(ordData);
      } else if (activeTab === 'users') {
        const res = await fetch(`${API_URL}/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error(`Failed to load users: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setUsersList(data);
      } else if (activeTab === 'inquiries') {
        const res = await fetch(`${API_URL}/admin/inquiries`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error(`Failed to load inquiries: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setInquiriesList(data);
      } else if (activeTab === 'promoCodes') {
        const res = await fetch(`${API_URL}/admin/promo-codes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error(`Failed to load promo codes: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setPromoList(data);
      }
    } catch (err) {
      console.error('Error loading admin panel data:', err);
      setError(err.message || 'An unexpected error occurred while loading dashboard content.');
    } finally {
      setLoading(false);
    }
  };

  // Status fulfill selector trigger
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ order_status: newStatus })
      });
      if (res.ok) {
        loadAdminData();
        Swal.fire({
          title: 'Order Updated!',
          text: `Order status successfully changed to ${newStatus}.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          title: 'Update Failed',
          text: 'Could not update order status.',
          icon: 'error',
          confirmButtonColor: '#3D4A3E'
        });
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      Swal.fire({
        title: 'Error',
        text: 'An error occurred while updating order status.',
        icon: 'error',
        confirmButtonColor: '#3D4A3E'
      });
    }
  };

  // Toggle user roles
  const handleToggleRole = async (userId) => {
    const result = await Swal.fire({
      title: 'Change User Role?',
      text: "Are you sure you want to toggle this user's administrative privileges?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3D4A3E',
      cancelButtonColor: '#7F8C8D',
      confirmButtonText: 'Yes, change role'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/admin/users/${userId}/toggle-role`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          loadAdminData();
          Swal.fire({
            title: 'Role Updated!',
            text: data.message || 'User role has been successfully changed.',
            icon: 'success',
            confirmButtonColor: '#3D4A3E'
          });
        } else {
          Swal.fire({
            title: 'Failed!',
            text: 'Failed to update user role.',
            icon: 'error',
            confirmButtonColor: '#3D4A3E'
          });
        }
      } catch (err) {
        console.error('Error toggling user role:', err);
        Swal.fire({
          title: 'Error!',
          text: 'An error occurred while updating the role.',
          icon: 'error',
          confirmButtonColor: '#3D4A3E'
        });
      }
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "All user carts and orders will be cleared.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3D4A3E',
      cancelButtonColor: '#C53030',
      confirmButtonText: 'Yes, delete user'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          loadAdminData();
          Swal.fire({
            title: 'Deleted!',
            text: 'User has been successfully deleted.',
            icon: 'success',
            confirmButtonColor: '#3D4A3E'
          });
        } else {
          Swal.fire({
            title: 'Failed!',
            text: 'Failed to delete user account.',
            icon: 'error',
            confirmButtonColor: '#3D4A3E'
          });
        }
      } catch (err) {
        console.error('Error deleting user:', err);
        Swal.fire({
          title: 'Error!',
          text: 'An error occurred while deleting the user.',
          icon: 'error',
          confirmButtonColor: '#3D4A3E'
        });
      }
    }
  };

  // Delete Inquiry
  const handleDeleteInquiry = async (inqId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This message will be permanently removed.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3D4A3E',
      cancelButtonColor: '#C53030',
      confirmButtonText: 'Yes, delete message'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/admin/inquiries/${inqId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          loadAdminData();
          Swal.fire({
            title: 'Deleted!',
            text: 'Inquiry has been deleted.',
            icon: 'success',
            confirmButtonColor: '#3D4A3E'
          });
        } else {
          Swal.fire({
            title: 'Failed!',
            text: 'Failed to delete inquiry.',
            icon: 'error',
            confirmButtonColor: '#3D4A3E'
          });
        }
      } catch (err) {
        console.error('Error deleting inquiry:', err);
        Swal.fire({
          title: 'Error!',
          text: 'An error occurred.',
          icon: 'error',
          confirmButtonColor: '#3D4A3E'
        });
      }
    }
  };

  // Toggle Promo Status
  const handleTogglePromoStatus = async (promoId) => {
    try {
      const res = await fetch(`${API_URL}/admin/promo-codes/${promoId}/toggle-status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        loadAdminData();
        Swal.fire({
          title: 'Status Updated!',
          text: data.message || 'Promo coupon status changed successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          title: 'Failed!',
          text: 'Failed to update promo coupon status.',
          icon: 'error',
          confirmButtonColor: '#3D4A3E'
        });
      }
    } catch (err) {
      console.error('Error toggling promo status:', err);
      Swal.fire({
        title: 'Error!',
        text: 'An error occurred while updating coupon status.',
        icon: 'error',
        confirmButtonColor: '#3D4A3E'
      });
    }
  };

  // Delete Promo Code
  const handleDeletePromo = async (promoId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This coupon will be deleted permanently.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3D4A3E',
      cancelButtonColor: '#C53030',
      confirmButtonText: 'Yes, delete coupon'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/admin/promo-codes/${promoId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          loadAdminData();
          Swal.fire({
            title: 'Deleted!',
            text: 'Coupon has been deleted.',
            icon: 'success',
            confirmButtonColor: '#3D4A3E'
          });
        } else {
          Swal.fire({
            title: 'Failed!',
            text: 'Failed to delete coupon.',
            icon: 'error',
            confirmButtonColor: '#3D4A3E'
          });
        }
      } catch (err) {
        console.error('Error deleting promo code:', err);
        Swal.fire({
          title: 'Error!',
          text: 'An error occurred.',
          icon: 'error',
          confirmButtonColor: '#3D4A3E'
        });
      }
    }
  };

  // Create Promo Code
  const handleAddPromoCode = async (e) => {
    e.preventDefault();
    if (!newPromoCode || !newPromoDiscount) return;
    setPromoFormError('');
    try {
      const res = await fetch(`${API_URL}/admin/promo-codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: newPromoCode, discount_percent: Number(newPromoDiscount) })
      });
      const data = await res.json();
      if (!res.ok) {
        setPromoFormError(data.message || 'Error creating promo code');
      } else {
        setShowPromoModal(false);
        setNewPromoCode('');
        setNewPromoDiscount('');
        loadAdminData();
      }
    } catch (err) {
      console.error('Promo creation error:', err);
      setPromoFormError('Network error. Try again.');
    }
  };

  // Open Add Product Modal
  const openAddModal = () => {
    setEditingProductId(null);
    setFormName('');
    setFormCategory(categories[0]?.id || '');
    setFormPrice('');
    setFormSizes(['XS', 'S', 'M', 'L']);
    setFormDescription('');
    setFormDetails('');
    setFormImages([]);
    setShowProductModal(true);
  };

  // Open Edit Product Modal
  const openEditModal = async (product) => {
    setEditingProductId(product.id);
    setFormName(product.name);
    setFormCategory(product.category_id || '');
    setFormPrice(product.price);
    setFormSizes(product.size_options || []);
    setFormDescription(product.description || '');
    setFormDetails(product.details || '');
    
    // Fetch product images for list
    try {
      const res = await fetch(`${API_URL}/products/${product.id}`);
      if (res.ok) {
        const detailed = await res.json();
        setFormImages(detailed.images || []);
      }
    } catch (err) {
      console.error('Error loading product details for edit:', err);
    }
    
    setShowProductModal(true);
  };

  // Handle sizes check box toggle
  const handleSizeToggle = (size) => {
    if (formSizes.includes(size)) {
      setFormSizes(formSizes.filter(s => s !== size));
    } else {
      setFormSizes([...formSizes, size]);
    }
  };

  // Submit Add/Edit Product
  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (!formName || !formPrice || !formCategory) {
      Swal.fire({
        title: 'Missing Required Fields',
        text: 'Please fill out Name, Price, and Category.',
        icon: 'warning',
        confirmButtonColor: '#3D4A3E'
      });
      return;
    }

    const payload = {
      category_id: formCategory,
      name: formName,
      description: formDescription,
      price: Number(formPrice),
      size_options: formSizes,
      details: formDetails,
      images: formImages.map(img => ({
        image_url: img.image_url,
        is_primary: Boolean(img.is_primary)
      }))
    };

    try {
      const url = editingProductId ? `${API_URL}/products/${editingProductId}` : `${API_URL}/products`;
      const method = editingProductId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowProductModal(false);
        loadAdminData();
        Swal.fire({
          title: 'Success!',
          text: editingProductId ? 'Product piece successfully updated.' : 'New product piece added to catalog.',
          icon: 'success',
          confirmButtonColor: '#3D4A3E'
        });
      } else {
        const errData = await res.json();
        Swal.fire({
          title: 'Action Failed',
          text: errData.message || 'Product action failed.',
          icon: 'error',
          confirmButtonColor: '#3D4A3E'
        });
      }
    } catch (err) {
      console.error('Error submitting product form:', err);
      Swal.fire({
        title: 'Error!',
        text: 'An error occurred while saving product data.',
        icon: 'error',
        confirmButtonColor: '#3D4A3E'
      });
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This piece will be permanently removed from catalog.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3D4A3E',
      cancelButtonColor: '#C53030',
      confirmButtonText: 'Yes, delete piece'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/products/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          loadAdminData();
          Swal.fire({
            title: 'Deleted!',
            text: 'Product piece successfully deleted.',
            icon: 'success',
            confirmButtonColor: '#3D4A3E'
          });
        } else {
          Swal.fire({
            title: 'Failed!',
            text: 'Failed to delete product piece.',
            icon: 'error',
            confirmButtonColor: '#3D4A3E'
          });
        }
      } catch (err) {
        console.error('Error deleting product:', err);
        Swal.fire({
          title: 'Error!',
          text: 'An error occurred.',
          icon: 'error',
          confirmButtonColor: '#3D4A3E'
        });
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="admin-page container animate-fade">
      {/* Header */}
      <header className="admin-page-header">
        <h1 className="admin-page-title">Admin Management Panel</h1>
        <p className="admin-page-subtitle">Track sales performance and curate boutique catalog inventory</p>
        <div className="botanical-divider">
          <span className="botanical-line"></span>
          <span className="botanical-line"></span>
        </div>
      </header>

      {/* Tabs list */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <TrendingUp size={16} /> Analytics Stats
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Layers size={16} /> Curate Inventory
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingBag size={16} /> Manage Orders
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} /> Customers List
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'inquiries' ? 'active' : ''}`}
          onClick={() => setActiveTab('inquiries')}
        >
          <Mail size={16} /> Feedbacks
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'promoCodes' ? 'active' : ''}`}
          onClick={() => setActiveTab('promoCodes')}
        >
          <Tag size={16} /> Promo Coupons
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={16} /> Store Settings & Logo
        </button>
      </div>

      {loading ? (
        <div className="flex-center admin-loading-box">
          <span className="loading-spinner"></span>
        </div>
      ) : error ? (
        <div className="admin-error-box text-center" style={{ padding: '3rem 1.5rem', backgroundColor: '#FFF5F5', border: '1px solid #FEB2B2', color: '#C53030', margin: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
          <ShieldAlert size={48} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Database Loading Failure</h3>
          <p style={{ fontSize: '0.95rem' }}>{error}</p>
          <button className="btn-primary" onClick={loadAdminData} style={{ backgroundColor: '#C53030', borderColor: '#C53030', color: '#FFF' }}>
            <RefreshCw size={16} style={{ marginRight: '0.5rem' }} /> Retry Connection
          </button>
        </div>
      ) : (
        <div className="admin-content-container">
          
          {/* TAB 1: STATISTICS DASHBOARD */}
          {activeTab === 'stats' && stats && (
            <div className="stats-tab-content animate-fade-only">
              <div className="metrics-summary-grid">
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">Total Revenue</span>
                    <TrendingUp className="metric-icon" size={20} />
                  </div>
                  <h2 className="metric-value">${stats.metrics.totalSales.toFixed(2)}</h2>
                </div>
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">Sales Orders</span>
                    <ShoppingBag className="metric-icon" size={20} />
                  </div>
                  <h2 className="metric-value">{stats.metrics.totalOrders}</h2>
                </div>
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">Total Clients</span>
                    <Users className="metric-icon" size={20} />
                  </div>
                  <h2 className="metric-value">{stats.metrics.totalCustomers}</h2>
                </div>
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">Curated Items</span>
                    <Layers className="metric-icon" size={20} />
                  </div>
                  <h2 className="metric-value">{stats.metrics.totalProducts}</h2>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="analytics-card-row">
                <div className="category-sales-card">
                  <h3 className="card-heading-sm">Sales by Category</h3>
                  <div className="category-progress-list">
                    {stats.categorySales.map((cat, idx) => {
                      const total = stats.categorySales.reduce((acc, c) => acc + Number(c.sales), 0) || 1;
                      const percentage = (Number(cat.sales) / total) * 100;
                      return (
                        <div className="category-progress-row" key={idx}>
                          <div className="cat-progress-labels">
                            <span className="cat-progress-name">{cat.category_name}</span>
                            <span className="cat-progress-sales">${Number(cat.sales).toFixed(2)}</span>
                          </div>
                          <div className="progress-track-bg">
                            <div className="progress-fill-accent" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE PRODUCTS */}
          {activeTab === 'products' && (
            <div className="products-tab-content animate-fade-only">
              <div className="tab-actions-header">
                <h3>Curated Pieces ({products.length})</h3>
                <button className="btn-primary add-piece-btn" onClick={openAddModal}>
                  <Plus size={16} /> Add New Piece
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Piece Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Sizes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <img src={product.primary_image} alt={product.name} className="admin-table-thumb" />
                        </td>
                        <td className="table-item-name">{product.name}</td>
                        <td className="text-capitalize">{product.category_name}</td>
                        <td className="font-semibold">${Number(product.price).toFixed(2)}</td>
                        <td>
                          <div className="table-sizes-badge-row">
                            {product.size_options.map(sz => (
                              <span className="size-badge" key={sz}>{sz}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="table-action-buttons">
                            <button className="action-icon-btn edit-btn" onClick={() => openEditModal(product)} title="Edit">
                              <Edit size={16} />
                            </button>
                            <button className="action-icon-btn delete-btn" onClick={() => handleDeleteProduct(product.id)} title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGE ORDERS */}
          {activeTab === 'orders' && (
            <div className="orders-tab-content animate-fade-only">
              <h3>Fulfillment Center ({orders.length} Orders)</h3>
              
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Details</th>
                      <th>Date</th>
                      <th>Order Total</th>
                      <th>Fulfillment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="font-semibold">#{order.id}</td>
                        <td>
                          <div className="customer-cell">
                            <strong>{order.customer_name}</strong>
                            <span>{order.customer_email}</span>
                          </div>
                        </td>
                        <td>{formatDate(order.created_at)}</td>
                        <td className="font-semibold">${Number(order.total_amount).toFixed(2)}</td>
                        <td>
                          <select 
                            value={order.order_status} 
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`order-status-selector select-${order.order_status.toLowerCase()}`}
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: USERS MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="users-tab-content animate-fade-only">
              <h3>Registered Users & Staff ({usersList.length} Accounts)</h3>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Current Role</th>
                      <th>Registration Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(item => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td className="font-semibold">{item.name}</td>
                        <td>{item.email}</td>
                        <td>
                          <span className={`role-badge role-${item.role}`}>
                            {item.role}
                          </span>
                        </td>
                        <td>{formatDate(item.created_at)}</td>
                        <td>
                          <div className="action-btns-row">
                            <button 
                              className="btn-action edit"
                              onClick={() => handleToggleRole(item.id)}
                              title="Toggle admin/customer role"
                            >
                              <UserCog size={15} />
                            </button>
                            {item.email !== 'admin@aguabendita.com' && (
                              <button 
                                className="btn-action delete"
                                onClick={() => handleDeleteUser(item.id)}
                                title="Delete user account"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: INQUIRIES MANAGEMENT */}
          {activeTab === 'inquiries' && (
            <div className="inquiries-tab-content animate-fade-only">
              <h3>Customer Queries & Messages ({inquiriesList.length} inquiries)</h3>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Client Name</th>
                      <th>Email</th>
                      <th>Subject</th>
                      <th>Message Details</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiriesList.map(item => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td className="font-semibold">{item.name}</td>
                        <td>
                          <a href={`mailto:${item.email}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                            {item.email}
                          </a>
                        </td>
                        <td className="font-semibold">{item.subject || 'No Subject'}</td>
                        <td>
                          <div style={{ maxWidth: '350px', whiteSpace: 'normal', fontSize: '0.85rem', color: 'var(--color-text-light)', lineHeight: '1.4' }}>
                            {item.message}
                          </div>
                        </td>
                        <td>{formatDate(item.created_at)}</td>
                        <td>
                          <button 
                            className="btn-action delete"
                            onClick={() => handleDeleteInquiry(item.id)}
                            title="Delete query log"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: PROMO CODES MANAGEMENT */}
          {activeTab === 'promoCodes' && (
            <div className="promo-tab-content animate-fade-only">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3>Promo Coupons Center ({promoList.length} Codes)</h3>
                <button className="btn-primary" onClick={() => setShowPromoModal(true)}>
                  <Plus size={16} style={{ marginRight: '0.5rem' }} /> Create Coupon
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Coupon Code</th>
                      <th>Discount Rate</th>
                      <th>Coupon Status</th>
                      <th>Created Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promoList.map(item => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td className="font-semibold" style={{ letterSpacing: '0.05em' }}>{item.code}</td>
                        <td className="font-semibold">{item.discount_percent}% OFF</td>
                        <td>
                          <span className={`status-badge payment-${item.is_active === 1 ? 'paid' : 'cancelled'}`}>
                            {item.is_active === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{formatDate(item.created_at)}</td>
                        <td>
                          <div className="action-btns-row">
                            <button 
                              className="btn-action edit"
                              onClick={() => handleTogglePromoStatus(item.id)}
                              title="Toggle coupon active/inactive state"
                            >
                              {item.is_active === 1 ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            </button>
                            <button 
                              className="btn-action delete"
                              onClick={() => handleDeletePromo(item.id)}
                              title="Delete coupon code"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: STORE BRANDING & SETTINGS */}
          {activeTab === 'settings' && (
            <div className="settings-tab-content animate-fade-only">
              <div className="admin-section-header">
                <div>
                  <h2 className="admin-section-title">Store & Brand Settings</h2>
                  <p className="admin-section-subtitle">Customize dynamic company name, logo URL, tagline, and contact information across the storefront.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', marginTop: '1.5rem' }}>
                <form onSubmit={handleSaveStoreSettings} style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', padding: '2rem', boxShadow: 'var(--shadow-small)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.8rem', color: 'var(--color-primary)' }}>
                    Brand Identity & Company Details
                  </h3>

                  <div className="form-group">
                    <label className="form-label">Company / Store Name *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsStoreName}
                      onChange={(e) => setSettingsStoreName(e.target.value)}
                      placeholder="e.g. ANSHIKA'S STORE"
                      required
                    />
                    <small style={{ color: 'var(--color-muted)', fontSize: '0.78rem', marginTop: '0.3rem', display: 'block' }}>
                      This name will update dynamically across the Navbar, Footer, and page titles.
                    </small>
                  </div>

                  <div className="form-group" style={{ marginTop: '1.2rem' }}>
                    <label className="form-label">Store Logo</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          try {
                            Swal.fire({ title: 'Compressing Logo...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                            const base64Url = await compressImage(file);
                            setSettingsLogoUrl(base64Url);
                            Swal.fire({ title: 'Success!', icon: 'success', timer: 1000, showConfirmButton: false });
                          } catch (err) {
                            Swal.fire('Error', err.message, 'error');
                          }
                        }}
                        style={{ display: 'none' }}
                        id="logo-upload-input"
                      />
                      <label htmlFor="logo-upload-input" className="btn-secondary" style={{ cursor: 'pointer', padding: '0.6rem 1.2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                        Choose File
                      </label>
                      {settingsLogoUrl && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                            {settingsLogoUrl.split('/').pop()}
                          </span>
                          <button type="button" onClick={() => setSettingsLogoUrl('')} style={{ background: 'none', border: 'none', color: '#C53030', cursor: 'pointer', padding: 0 }}>
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <small style={{ color: 'var(--color-muted)', fontSize: '0.78rem', marginTop: '0.5rem', display: 'block' }}>
                      Upload store logo image (PNG, JPG, SVG, WebP).
                    </small>
                  </div>

                  <div className="form-group" style={{ marginTop: '1.2rem' }}>
                    <label className="form-label">Brand Tagline / Subtitle</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsTagline}
                      onChange={(e) => setSettingsTagline(e.target.value)}
                      placeholder="e.g. Luxury Linens & Home Comfort"
                    />
                  </div>

                  <div className="checkout-fields-row" style={{ marginTop: '1.2rem' }}>
                    <div className="form-group flex-1">
                      <label className="form-label">Support Email</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        value={settingsContactEmail}
                        onChange={(e) => setSettingsContactEmail(e.target.value)}
                        placeholder="support@anshikastore.com"
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label className="form-label">Support Phone</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={settingsPhone}
                        onChange={(e) => setSettingsPhone(e.target.value)}
                        placeholder="+1 (800) 555-0199"
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '1.2rem' }}>
                    <label className="form-label">HQ Office Address</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsAddress}
                      onChange={(e) => setSettingsAddress(e.target.value)}
                      placeholder="742 Botanical Way, Suite 400, New York, NY 10013"
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ marginTop: '1.8rem', width: '100%', padding: '0.9rem' }} disabled={savingSettings}>
                    {savingSettings ? 'Saving Settings...' : 'Save & Update Store Branding'}
                  </button>
                </form>

                {/* Live Brand Preview Card */}
                <div style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', padding: '1.8rem', height: 'fit-content', boxShadow: 'var(--shadow-small)' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.2rem', color: 'var(--color-primary)' }}>
                    Live Brand Preview
                  </h4>
                  
                  <div style={{ border: '1px dashed var(--color-border)', padding: '1.5rem', textAlign: 'center', backgroundColor: 'var(--color-bg-alt)', marginBottom: '1.2rem', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {settingsLogoUrl ? (
                      <img 
                        src={resolveImageUrl(settingsLogoUrl)} 
                        alt="Logo Preview" 
                        style={{ maxHeight: '48px', maxWidth: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-primary)' }}>
                          {settingsStoreName ? settingsStoreName.split(' ')[0] : "ANSHIKA'S"}
                        </div>
                        <div style={{ fontSize: '0.65rem', letterSpacing: '0.3em', color: 'var(--color-muted)' }}>
                          {settingsStoreName && settingsStoreName.split(' ').length > 1 ? settingsStoreName.split(' ').slice(1).join(' ') : "STORE"}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)', lineHeight: '1.6' }}>
                    <p style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.95rem', marginBottom: '0.2rem' }}>{settingsStoreName || "Store Name"}</p>
                    <p style={{ fontStyle: 'italic', marginBottom: '0.8rem' }}>{settingsTagline || "Tagline"}</p>
                    <p style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}><span>📧</span> {settingsContactEmail || "N/A"}</p>
                    <p style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.2rem' }}><span>📞</span> {settingsPhone || "N/A"}</p>
                    <p style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start', marginTop: '0.2rem' }}><span>📍</span> {settingsAddress || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* PRODUCT CREATION/EDIT MODAL */}
      {showProductModal && (
        <div className="modal-overlay animate-fade-only" onClick={() => setShowProductModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProductId ? 'Edit Curated Piece' : 'Add New Piece'}</h3>
              <button onClick={() => setShowProductModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleProductSubmit} className="modal-form-body">
              <div className="form-group">
                <label className="form-label">Piece Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Gardenia Triangle Bikini"
                  required
                />
              </div>

              <div className="checkout-fields-row">
                <div className="form-group flex-1">
                  <label className="form-label">Price (USD) *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="e.g. 290"
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">Category *</label>
                  <select 
                    className="form-input" 
                    value={formCategory}
                    onChange={(e) => setFormCategory(Number(e.target.value))}
                    required
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Sizes Available</label>
                <div className="modal-sizes-row">
                  {sizeOptions.map(sz => (
                    <label key={sz} className="size-checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={formSizes.includes(sz)}
                        onChange={() => handleSizeToggle(sz)}
                      />
                      <span>{sz}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Short Description</label>
                <textarea 
                  className="form-input modal-textarea" 
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Summarize visual aspects and fittings..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Details & Fabric Care</label>
                <textarea 
                  className="form-input modal-textarea" 
                  value={formDetails}
                  onChange={(e) => setFormDetails(e.target.value)}
                  placeholder="Fabric composition, washing guidelines..."
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Product Gallery *</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>First image will be primary</span>
                </label>

                {/* Upload Buttons */}
                <div style={{ marginTop: '0.5rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files);
                      if (files.length === 0) return;
                      try {
                        Swal.fire({ title: 'Compressing images...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                        
                        const base64Urls = [];
                        for (const file of files) {
                          const base64Url = await compressImage(file);
                          base64Urls.push(base64Url);
                        }

                        const newImages = base64Urls.map((url, idx) => ({
                          image_url: url,
                          is_primary: formImages.length === 0 && idx === 0
                        }));

                        setFormImages([...formImages, ...newImages]);
                        Swal.fire({ title: 'Success!', icon: 'success', timer: 1000, showConfirmButton: false });
                      } catch (err) {
                        Swal.fire('Error', err.message, 'error');
                      }
                    }}
                    style={{ display: 'none' }}
                    id="product-gallery-input"
                  />
                  <label htmlFor="product-gallery-input" className="btn-secondary" style={{ cursor: 'pointer', padding: '0.6rem 1.2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <Plus size={16} /> Upload Image(s)
                  </label>

                  <button
                    type="button"
                    onClick={async () => {
                      const { value: url } = await Swal.fire({
                        title: 'Add Image URL',
                        input: 'url',
                        inputLabel: 'External Image Link (e.g. Unsplash, Imgur)',
                        inputPlaceholder: 'https://images.unsplash.com/...',
                        showCancelButton: true,
                        confirmButtonColor: '#3D4A3E'
                      });
                      if (url) {
                        setFormImages([...formImages, { image_url: url, is_primary: formImages.length === 0 }]);
                      }
                    }}
                    className="btn-secondary"
                    style={{ padding: '0.6rem 1.2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                  >
                    Add URL Link
                  </button>
                </div>

                {/* Image Previews */}
                {formImages.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '1rem', marginTop: '0.5rem', backgroundColor: 'var(--color-bg-alt)', padding: '1rem', border: '1px solid var(--color-border)' }}>
                    {formImages.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', border: img.is_primary ? '2px solid var(--color-accent)' : '1px solid var(--color-border)', padding: '2px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img 
                          src={resolveImageUrl(img.image_url)} 
                          alt={`Product Preview ${idx + 1}`} 
                          style={{ width: '100%', height: '80px', objectFit: 'cover' }} 
                        />
                        
                        <button 
                          type="button" 
                          onClick={() => {
                            const filtered = formImages.filter((_, i) => i !== idx);
                            if (img.is_primary && filtered.length > 0) {
                              filtered[0].is_primary = true;
                            }
                            setFormImages(filtered);
                          }} 
                          style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#C53030', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px', padding: 0 }}
                          title="Remove image"
                        >
                          <X size={10} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = formImages.map((item, i) => ({
                              ...item,
                              is_primary: i === idx
                            }));
                            setFormImages(updated);
                          }}
                          style={{ position: 'absolute', bottom: '2px', right: '2px', backgroundColor: img.is_primary ? 'var(--color-accent)' : 'rgba(255,255,255,0.85)', color: img.is_primary ? '#fff' : 'var(--color-primary)', border: 'none', borderRadius: '2px', fontSize: '9px', padding: '2px 4px', cursor: 'pointer', fontWeight: 600 }}
                          title="Set as primary thumbnail"
                        >
                          {img.is_primary ? 'Primary' : 'Make 1st'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowProductModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMO CREATION MODAL */}
      {showPromoModal && (
        <div className="modal-overlay animate-fade-only" onClick={() => setShowPromoModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Create Discount Coupon</h3>
              <button onClick={() => setShowPromoModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddPromoCode} className="modal-form-body">
              {promoFormError && (
                <div className="auth-error-banner animate-fade-only" style={{ marginBottom: '1.2rem' }}>
                  <span>{promoFormError}</span>
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Coupon Code *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value)}
                  placeholder="e.g. WELCOME20"
                  style={{ textTransform: 'uppercase' }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Discount Percentage *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={newPromoDiscount}
                  onChange={(e) => setNewPromoDiscount(e.target.value)}
                  placeholder="e.g. 20"
                  min="1"
                  max="99"
                  required
                />
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowPromoModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-page {
          padding-top: 130px;
          padding-bottom: 7rem;
        }

        .admin-page-header {
          margin-bottom: 3rem;
          text-align: center;
        }

        .admin-page-title {
          font-size: 2.8rem;
          font-weight: 500;
        }

        .admin-page-subtitle {
          font-size: 0.95rem;
          color: var(--color-muted);
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        /* Tabs list */
        .admin-tabs {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 3.5rem;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 1rem;
        }

        .admin-tab-btn {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--color-muted);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-bottom: 1.5px solid transparent;
        }

        .admin-tab-btn:hover, .admin-tab-btn.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
        }

        .admin-loading-box {
          min-height: 350px;
        }

        /* Analytics Tab CSS */
        .metrics-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .metric-card {
          background-color: var(--color-white);
          border: 1px solid var(--color-border-light);
          padding: 1.8rem 2rem;
          box-shadow: var(--shadow-subtle);
          display: flex;
          flex-direction: column;
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .metric-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-muted);
          font-weight: 600;
        }

        .metric-icon {
          color: var(--color-accent);
        }

        .metric-value {
          font-size: 1.8rem;
          font-family: var(--font-sans);
          font-weight: 600;
          color: var(--color-primary);
        }

        .analytics-card-row {
          display: grid;
          grid-template-columns: 1fr;
          margin-bottom: 3rem;
        }

        .category-sales-card {
          background-color: var(--color-white);
          border: 1px solid var(--color-border-light);
          padding: 2.2rem;
          box-shadow: var(--shadow-subtle);
        }

        .card-heading-sm {
          font-size: 1.15rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--color-border-light);
          padding-bottom: 0.8rem;
        }

        .category-progress-list {
          display: flex;
          flex-direction: column;
          gap: 1.8rem;
        }

        .category-progress-row {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .cat-progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }

        .cat-progress-name {
          font-weight: 500;
          color: var(--color-primary);
        }

        .cat-progress-sales {
          font-weight: 600;
        }

        .progress-track-bg {
          height: 6px;
          background-color: var(--color-bg-alt);
          width: 100%;
        }

        .progress-fill-accent {
          height: 100%;
          background-color: var(--color-accent);
          transition: width 1s ease-out;
        }

        /* Curate inventory headers */
        .tab-actions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .add-piece-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          padding: 0.7rem 1.5rem;
        }

        /* Admin Table Styles */
        .admin-table-container {
          background-color: var(--color-white);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-subtle);
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .admin-table th, .admin-table td {
          padding: 1.2rem 2rem;
          border-bottom: 1px solid var(--color-border-light);
          font-size: 0.92rem;
        }

        .admin-table th {
          font-family: var(--font-sans);
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-muted);
          font-weight: 600;
          background-color: var(--color-bg-alt);
        }

        .admin-table tbody tr:hover {
          background-color: rgba(61, 74, 62, 0.01);
        }

        .admin-table-thumb {
          width: 42px;
          height: 56px;
          object-fit: cover;
          background-color: var(--color-bg-alt);
        }

        .table-item-name {
          font-weight: 500;
          color: var(--color-primary);
        }

        .font-semibold {
          font-weight: 600;
        }

        .table-sizes-badge-row {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .size-badge {
          background-color: var(--color-bg-alt);
          color: var(--color-primary);
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }

        .table-action-buttons {
          display: flex;
          gap: 0.8rem;
        }

        .action-btns-row {
          display: flex;
          gap: 0.8rem;
          align-items: center;
        }

        .action-icon-btn {
          padding: 0.4rem;
          color: var(--color-muted);
          transition: var(--transition-fast);
        }

        .action-icon-btn.edit-btn:hover {
          color: var(--color-accent);
        }

        .action-icon-btn.delete-btn:hover {
          color: var(--color-error);
        }

        /* Order fulfillment custom selectors */
        .customer-cell {
          display: flex;
          flex-direction: column;
          font-size: 0.88rem;
        }
        .customer-cell span {
          font-size: 0.78rem;
          color: var(--color-muted);
        }

        .order-status-selector {
          padding: 0.4rem 1rem;
          border: 1px solid var(--color-border);
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background-color: transparent;
          cursor: pointer;
        }

        .order-status-selector.select-processing {
          color: var(--color-accent-hover);
          border-color: var(--color-accent-hover);
        }
        .order-status-selector.select-shipped {
          color: var(--color-primary);
          border-color: var(--color-primary);
        }
        .order-status-selector.select-delivered {
          color: var(--color-success);
          border-color: var(--color-success);
        }
        .order-status-selector.select-cancelled {
          color: var(--color-error);
          border-color: var(--color-error);
        }

        /* Modal Overlay Panel CSS */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(61, 74, 62, 0.4);
          backdrop-filter: blur(4px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .modal-panel {
          width: 100%;
          max-width: 580px;
          background-color: var(--color-bg);
          box-shadow: var(--shadow-medium);
          max-height: 90vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 1.8rem 2rem;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-form-body {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .modal-sizes-row {
          display: flex;
          gap: 1.2rem;
          flex-wrap: wrap;
        }

        .size-checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .modal-textarea {
          resize: vertical;
          min-height: 70px;
        }

        .textarea-links {
          min-height: 90px;
          font-family: monospace;
          font-size: 0.8rem;
        }

        .modal-footer-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1rem;
          border-top: 1px solid var(--color-border-light);
          padding-top: 1.5rem;
        }

        @media (max-width: 900px) {
          .metrics-summary-grid {
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
          }
        }

        @media (max-width: 600px) {
          .metrics-summary-grid {
            grid-template-columns: 1fr;
          }
          .admin-tabs {
            flex-direction: column;
            gap: 0.5rem;
            align-items: center;
          }
          .admin-tab-btn {
            width: 100%;
            justify-content: center;
          }
          .modal-overlay {
            padding: 0.75rem;
          }
          .modal-form-body {
            padding: 1.25rem;
            gap: 1rem;
          }
          .modal-header {
            padding: 1.2rem 1.25rem;
          }
          .admin-page-title {
            font-size: 1.8rem;
          }
        }

        .role-badge {
          font-size: 0.72rem;
          padding: 0.25rem 0.6rem;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        .role-admin {
          background-color: #3D4A3E;
          color: #FCFBF7;
        }
        .role-customer {
          background-color: #FCFBF7;
          color: #3D4A3E;
          border: 1px solid rgba(61, 74, 62, 0.15);
        }
      `}</style>
    </div>
  );
}
