import React from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { X, Plus, Minus, Trash2 } from 'lucide-react';

export default function CartDrawer({ setPage }) {
  const { 
    cartItems, 
    cartOpen, 
    setCartOpen, 
    updateQuantity, 
    removeFromCart, 
    cartTotal 
  } = useCart();
  const { formatPrice } = useCurrency();

  if (!cartOpen) return null;

  const handleCheckoutClick = () => {
    setCartOpen(false);
    setPage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="cart-drawer-overlay animate-fade-only" onClick={() => setCartOpen(false)}>
      <div className="cart-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer-header">
          <h3 className="cart-drawer-title">Shopping Bag</h3>
          <button className="cart-drawer-close" onClick={() => setCartOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Cart items list */}
        <div className="cart-drawer-items">
          {cartItems.length === 0 ? (
            <div className="empty-cart-message">
              <p>Your shopping bag is empty.</p>
              <button className="btn-secondary shop-now-btn" onClick={() => { setCartOpen(false); setPage('catalog'); }}>
                Shop Collection
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div className="cart-item-row" key={item.id}>
                <img 
                  src={item.primary_image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=150'} 
                  alt={item.name} 
                  className="cart-item-img" 
                />
                
                <div className="cart-item-details">
                  <div className="cart-item-meta">
                    <h5 className="cart-item-name">{item.name}</h5>
                    <span className="cart-item-size">Size: {item.selected_size}</span>
                  </div>
                  
                  <div className="cart-item-controls">
                    <div className="qty-controls">
                      <button 
                        className="qty-btn" 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button 
                        className="qty-btn" 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="cart-item-price-col">
                  <span className="cart-item-price">{formatPrice(Number(item.price) * item.quantity)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer summary */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-row">
              <span className="subtotal-label">Subtotal</span>
              <span className="subtotal-amount">{formatPrice(cartTotal)}</span>
            </div>
            <p className="shipping-info">Shipping & taxes calculated at checkout.</p>
            <button className="btn-primary checkout-btn" onClick={handleCheckoutClick}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>

      <style>{`
        .cart-drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(61, 74, 62, 0.4);
          backdrop-filter: blur(4px);
          z-index: 200;
          display: flex;
          justify-content: flex-end;
        }

        .cart-drawer-panel {
          width: 100%;
          max-width: 440px;
          height: 100%;
          background-color: var(--color-bg);
          box-shadow: -10px 0 40px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .cart-drawer-header {
          padding: 1.8rem 2rem;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cart-drawer-title {
          font-size: 1.3rem;
          font-weight: 500;
        }

        .cart-drawer-close {
          color: var(--color-primary);
        }

        .cart-drawer-items {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .empty-cart-message {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          color: var(--color-muted);
          text-align: center;
        }

        .shop-now-btn {
          width: 100%;
        }

        .cart-item-row {
          display: flex;
          gap: 1.2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--color-border-light);
        }

        .cart-item-img {
          width: 80px;
          height: 108px;
          object-fit: cover;
          background-color: var(--color-bg-alt);
        }

        .cart-item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .cart-item-name {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--color-primary);
          margin-bottom: 0.2rem;
        }

        .cart-item-size {
          font-size: 0.75rem;
          color: var(--color-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .cart-item-controls {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }

        .qty-controls {
          display: flex;
          align-items: center;
          border: 1px solid var(--color-border);
          padding: 0.2rem;
        }

        .qty-btn {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
        }

        .qty-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .qty-val {
          font-size: 0.85rem;
          min-width: 20px;
          text-align: center;
        }

        .cart-item-remove {
          color: var(--color-muted);
        }

        .cart-item-remove:hover {
          color: var(--color-error);
        }

        .cart-item-price-col {
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          min-width: 60px;
        }

        .cart-item-price {
          font-size: 0.95rem;
          font-weight: 500;
        }

        .cart-drawer-footer {
          padding: 2rem;
          border-top: 1px solid var(--color-border);
          background-color: var(--color-bg-alt);
        }

        .cart-summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.8rem;
        }

        .subtotal-label {
          font-size: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-primary);
        }

        .subtotal-amount {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .shipping-info {
          font-size: 0.8rem;
          color: var(--color-muted);
          margin-bottom: 1.5rem;
        }

        .checkout-btn {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
