import React, { useEffect, useState } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { useCurrency } from '../context/CurrencyContext';
import { ShoppingBag, MapPin, User, Calendar, DollarSign, Award } from 'lucide-react';

export default function Profile({ setPage }) {
  const { user, token, logout, isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect guest to auth page if they hit this page somehow
  useEffect(() => {
    if (!isAuthenticated) {
      setPage('auth');
    }
  }, [isAuthenticated]);

  // Fetch Order History
  useEffect(() => {
    async function loadOrders() {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [token]);

  const handleLogoutClick = async () => {
    const result = await Swal.fire({
      title: 'Log Out?',
      text: "Are you sure you want to log out of your account?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3D4A3E',
      cancelButtonColor: '#7F8C8D',
      confirmButtonText: 'Yes, log out'
    });

    if (result.isConfirmed) {
      logout();
      setPage('home');
      Swal.fire({
        title: 'Logged Out',
        text: 'You have successfully logged out.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!user) return null;

  return (
    <div className="profile-page container animate-fade">
      {/* Profile Banner */}
      <header className="profile-header">
        <div className="profile-badge-row">
          <div className="profile-avatar flex-center">
            <User size={30} className="avatar-icon" />
          </div>
          <div className="profile-welcome">
            <span className="welcome-pre">My Account</span>
            <h1 className="profile-name">{user.name}</h1>
            <span className="profile-email">{user.email}</span>
          </div>
        </div>

        <button className="btn-secondary logout-profile-btn" onClick={handleLogoutClick}>
          Log Out
        </button>
      </header>

      <div className="profile-layout-grid">
        {/* Left Side: Profile info details */}
        <aside className="profile-sidebar">
          <div className="sidebar-card">
            <h3 className="card-title-sm">Account Details</h3>
            <ul className="details-list">
              <li>
                <User size={16} className="details-icon" />
                <div>
                  <span className="detail-label">Name</span>
                  <span className="detail-val">{user.name}</span>
                </div>
              </li>
              <li>
                <Award size={16} className="details-icon" />
                <div>
                  <span className="detail-label">Member Role</span>
                  <span className="detail-val text-capitalize">{user.role}</span>
                </div>
              </li>
              <li>
                <Calendar size={16} className="details-icon" />
                <div>
                  <span className="detail-label">Joined On</span>
                  <span className="detail-val">{formatDate(user.created_at || new Date())}</span>
                </div>
              </li>
            </ul>
          </div>
        </aside>

        {/* Right Side: Order history list */}
        <main className="profile-orders-section">
          <h2 className="orders-heading"><ShoppingBag size={20} /> Order History</h2>
          
          <div className="profile-divider"></div>

          {loading ? (
            <div className="flex-center orders-loading">
              <span className="loading-spinner"></span>
            </div>
          ) : orders.length === 0 ? (
            <div className="no-orders-box text-center">
              <p>You haven't placed any orders yet.</p>
              <button className="btn-primary" onClick={() => setPage('catalog')}>Shop Our Collection</button>
            </div>
          ) : (
            <div className="orders-list-col">
              {orders.map((order) => (
                <div className="order-history-card" key={order.id}>
                  {/* Order meta block */}
                  <div className="order-meta-header">
                    <div className="meta-left">
                      <span className="meta-id">Order ID: #{order.id}</span>
                      <span className="meta-date">Placed: {formatDate(order.created_at)}</span>
                    </div>

                    <div className="meta-right">
                      <span className={`status-badge payment-${order.payment_status?.toLowerCase()}`}>
                        Payment: {order.payment_status}
                      </span>
                      <span className={`status-badge status-${order.order_status?.toLowerCase()}`}>
                        Status: {order.order_status}
                      </span>
                    </div>
                  </div>

                  {/* Order items details */}
                  <div className="order-card-body">
                    <div className="order-items-grid">
                      {order.items.map((item) => (
                        <div className="order-item-detail-row" key={item.id}>
                          <img 
                            src={item.primary_image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=150'} 
                            alt={item.product_name} 
                            className="order-item-thumbnail" 
                          />
                          <div className="order-item-text">
                            <h4 className="order-item-name">{item.product_name}</h4>
                            <span className="order-item-specs">
                              Size: {item.selected_size} &bull; Qty: {item.quantity}
                            </span>
                          </div>
                          <span className="order-item-price-val">
                            {formatPrice(Number(item.price_at_purchase) * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order summary footer */}
                    <div className="order-card-footer">
                      <div className="shipping-address-box">
                        <MapPin size={15} className="address-icon" />
                        <div>
                          <span className="address-label">Shipped To</span>
                          <p className="address-text">{order.shipping_address}</p>
                        </div>
                      </div>

                      <div className="order-total-block">
                        <span className="total-label">Total Charged</span>
                        <span className="total-val-sum">{formatPrice(order.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <style>{`
        .profile-page {
          padding-top: 130px;
          padding-bottom: 7rem;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: var(--color-white);
          border: 1px solid var(--color-border-light);
          padding: 2.5rem 3rem;
          margin-bottom: 3.5rem;
          box-shadow: var(--shadow-subtle);
        }

        .profile-badge-row {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .profile-avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background-color: var(--color-bg-alt);
          color: var(--color-primary);
        }

        .welcome-pre {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--color-muted);
          display: block;
        }

        .profile-name {
          font-size: 2rem;
          line-height: 1.1;
        }

        .profile-email {
          font-size: 0.9rem;
          color: var(--color-muted);
        }

        .logout-profile-btn {
          font-size: 0.8rem;
          padding: 0.7rem 1.8rem;
        }

        /* Profile Layout */
        .profile-layout-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 4rem;
        }

        .profile-sidebar {
          display: flex;
          flex-direction: column;
        }

        .sidebar-card {
          background-color: var(--color-white);
          border: 1px solid var(--color-border-light);
          padding: 2rem;
          box-shadow: var(--shadow-subtle);
        }

        .card-title-sm {
          font-family: var(--font-sans);
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--color-primary);
          margin-bottom: 1.8rem;
          border-bottom: 1px solid var(--color-border-light);
          padding-bottom: 0.8rem;
        }

        .details-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .details-list li {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          font-size: 0.9rem;
        }

        .details-icon {
          color: var(--color-accent);
          margin-top: 0.15rem;
        }

        .detail-label {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-muted);
        }

        .detail-val {
          font-weight: 500;
          color: var(--color-secondary);
        }

        .text-capitalize {
          text-transform: capitalize;
        }

        /* Right panel order history styling */
        .profile-orders-section {
          flex: 1;
        }

        .orders-heading {
          font-size: 1.6rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .profile-divider {
          height: 1px;
          background-color: var(--color-border);
          margin: 1.5rem 0 2.5rem;
        }

        .orders-loading {
          min-height: 250px;
        }

        .no-orders-box {
          background-color: var(--color-white);
          border: 1px solid var(--color-border-light);
          padding: 4rem 2rem;
          color: var(--color-muted);
          box-shadow: var(--shadow-subtle);
        }

        .no-orders-box p {
          margin-bottom: 1.5rem;
        }

        .orders-list-col {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .order-history-card {
          background-color: var(--color-white);
          border: 1px solid var(--color-border-light);
          box-shadow: var(--shadow-subtle);
        }

        .order-meta-header {
          background-color: var(--color-bg-alt);
          padding: 1.2rem 2rem;
          border-bottom: 1px solid var(--color-border-light);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.85rem;
        }

        .meta-left {
          display: flex;
          gap: 2rem;
        }

        .meta-id {
          font-weight: 600;
          color: var(--color-primary);
        }

        .meta-date {
          color: var(--color-muted);
        }

        .meta-right {
          display: flex;
          gap: 1rem;
        }

        .status-badge {
          padding: 0.2rem 0.8rem;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-badge.payment-paid {
          background-color: rgba(95, 122, 97, 0.1);
          color: var(--color-success);
        }

        .status-badge.status-processing {
          background-color: rgba(197, 168, 128, 0.15);
          color: var(--color-accent-hover);
        }

        .order-card-body {
          padding: 2rem;
        }

        .order-items-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .order-item-detail-row {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          padding-bottom: 1.2rem;
          border-bottom: 1px solid rgba(61, 74, 62, 0.05);
        }

        .order-item-detail-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .order-item-thumbnail {
          width: 50px;
          height: 67px;
          object-fit: cover;
          background-color: var(--color-bg-alt);
        }

        .order-item-text {
          flex: 1;
        }

        .order-item-name {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--color-primary);
          margin-bottom: 0.15rem;
        }

        .order-item-specs {
          font-size: 0.75rem;
          color: var(--color-muted);
        }

        .order-item-price-val {
          font-size: 0.95rem;
          font-weight: 500;
        }

        .order-card-footer {
          border-top: 1px solid var(--color-border-light);
          padding-top: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .shipping-address-box {
          display: flex;
          gap: 0.8rem;
          max-width: 400px;
          font-size: 0.85rem;
        }

        .address-icon {
          color: var(--color-muted);
          margin-top: 0.15rem;
        }

        .address-label {
          display: block;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-muted);
        }

        .address-text {
          line-height: 1.4;
          color: var(--color-secondary);
        }

        .order-total-block {
          text-align: right;
        }

        .total-label {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-muted);
        }

        .total-val-sum {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--color-primary);
        }

        @media (max-width: 900px) {
          .profile-layout-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .profile-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
            padding: 2rem;
          }
          .logout-profile-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
