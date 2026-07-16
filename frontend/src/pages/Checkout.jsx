import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth, API_URL } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { useCurrency } from '../context/CurrencyContext';
import { CreditCard, Truck, CheckCircle, Lock, ShieldAlert } from 'lucide-react';

export default function Checkout({ setPage }) {
  const { cartItems, cartTotal, clearCartState, refreshCart } = useCart();
  const { user, token, isAuthenticated } = useAuth();
  const { formatPrice, selectedCurrency } = useCurrency();
  
  // Checkout flow states
  const [loading, setLoading] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [completedOrderDetails, setCompletedOrderDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Promo code states
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, discount_percent }
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Shipping Form Fields
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');

  // Card Payment Form Fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Shipping Method & Note States
  const [shippingMethod, setShippingMethod] = useState('standard'); // standard, express
  const [orderNotes, setOrderNotes] = useState('');

  // Payment Method States
  const [paymentMethod, setPaymentMethod] = useState('card'); // card, upi, paypal, cod
  const [upiId, setUpiId] = useState('');

  const handleCardNumberChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, ''); // Digits only
    const formatted = rawVal.match(/.{1,4}/g)?.join(' ') || '';
    setCardNumber(formatted.substring(0, 19));
  };

  const handleExpiryChange = (e) => {
    let rawVal = e.target.value.replace(/\D/g, '');
    if (rawVal.length > 2) {
      rawVal = `${rawVal.substring(0, 2)}/${rawVal.substring(2, 4)}`;
    }
    setCardExpiry(rawVal.substring(0, 5));
  };

  const handleCvvChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setCardCvv(rawVal.substring(0, 4));
  };

  const cardBrand = (() => {
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5')) return 'Mastercard';
    if (clean.startsWith('3')) return 'Amex';
    if (clean.startsWith('6')) return 'Discover';
    return null;
  })();

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName || !address || !city || !zipCode) {
      setErrorMessage('Please fill out all shipping details.');
      return;
    }

    if (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCvv)) {
      setErrorMessage('Please fill out all card payment details.');
      return;
    }

    if (paymentMethod === 'upi' && !upiId) {
      setErrorMessage('Please enter your UPI ID.');
      return;
    }

    setLoading(true);
    try {
      const fullShippingString = `${fullName}, ${address}, ${city}, ${zipCode}, ${country}`;
      
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          shipping_address: `${fullShippingString} | Payment: ${paymentMethod.toUpperCase()}${paymentMethod === 'upi' ? ` (${upiId})` : ''} ${orderNotes ? `| Notes: ${orderNotes}` : ''}`,
          promo_code: appliedPromo ? appliedPromo.code : null,
          shipping_method: shippingMethod
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      // Success
      setCompletedOrderDetails({
        orderId: data.orderId,
        total: data.totalAmount,
        address: fullShippingString
      });
      setOrderCompleted(true);
      clearCartState();
      await refreshCart(); // Refresh DB cart in context
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred while placing your order.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToShop = () => {
    setPage('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. If not authenticated, prompt login
  if (!isAuthenticated) {
    return (
      <div className="checkout-page container animate-fade flex-center">
        <div className="checkout-auth-prompt text-center">
          <Lock size={32} className="auth-lock-icon" />
          <h2>Secure Checkout</h2>
          <p>Please register or sign in to complete your transaction and secure your order details.</p>
          <button className="btn-primary" onClick={() => setPage('auth')}>Sign In to Continue</button>
        </div>
      </div>
    );
  }

  // 2. If Cart is Empty and not completed order, prompt shopping
  if (cartItems.length === 0 && !orderCompleted) {
    return (
      <div className="checkout-page container animate-fade flex-center">
        <div className="checkout-auth-prompt text-center">
          <h2>Your bag is empty</h2>
          <p>You must add some beautiful bedsheets or pillow covers before checking out.</p>
          <button className="btn-primary" onClick={handleBackToShop}>Shop Collection</button>
        </div>
      </div>
    );
  }

  // 3. Order Completed Success View
  if (orderCompleted && completedOrderDetails) {
    return (
      <div className="checkout-page container animate-fade flex-center">
        <div className="order-success-card text-center animate-fade">
          <CheckCircle size={55} className="success-icon" />
          <h1 className="success-title">Order Confirmed</h1>
          <p className="success-order-id">Order ID: #{completedOrderDetails.orderId}</p>
          <p className="success-message">
            Thank you for your purchase. We are preparing your order. An email confirmation has been sent with details.
          </p>
          
          <div className="success-summary-box">
            <div className="summary-row">
              <span>Total Charged:</span>
              <strong>{formatPrice(completedOrderDetails.total)}</strong>
            </div>
            <div className="summary-row flex-column">
              <span>Shipping to:</span>
              <p className="summary-address">{completedOrderDetails.address}</p>
            </div>
          </div>

          <button className="btn-primary success-btn" onClick={handleBackToShop}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const isFreeShippingAvailable = cartTotal >= 300;
  const shippingCost = shippingMethod === 'standard' 
    ? (isFreeShippingAvailable ? 0.00 : 15.00) 
    : (isFreeShippingAvailable ? 15.00 : 35.00);

  const discountAmount = appliedPromo ? (cartTotal * (appliedPromo.discount_percent / 100)) : 0;
  const grandTotal = cartTotal - discountAmount + shippingCost;

  const handleApplyPromo = async () => {
    if (!promoInput) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch(`${API_URL}/admin/validate-promo/${promoInput.toUpperCase()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        setPromoError(data.message || 'Invalid promo code');
        Swal.fire({
          title: 'Invalid Coupon',
          text: data.message || 'The promo code entered is invalid or expired.',
          icon: 'error',
          confirmButtonColor: '#3D4A3E',
          timer: 2500
        });
      } else {
        setAppliedPromo({
          code: data.code,
          discount_percent: data.discount_percent
        });
        setPromoError('');
        Swal.fire({
          title: 'Coupon Applied!',
          text: `"${data.code}" successfully applied. You get ${data.discount_percent}% off!`,
          icon: 'success',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }
    } catch (err) {
      console.error('Promo validation error:', err);
      setPromoError('Error checking coupon. Try again.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError('');
  };

  return (
    <div className="checkout-page container animate-fade">
      <header className="checkout-page-header">
        <h1 className="checkout-page-title">Secure Checkout</h1>
      </header>

      {errorMessage && (
        <div className="auth-error-banner animate-fade-only">
          <ShieldAlert size={16} /> <span>{errorMessage}</span>
        </div>
      )}

      <div className="checkout-grid">
        {/* Left Form Panel */}
        <div className="checkout-form-panel">
          <form onSubmit={handlePlaceOrder}>
            {/* Shipping Address */}
            <div className="checkout-section">
              <h3 className="section-title-sm"><Truck size={18} /> Shipping Information</h3>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Calle de las Flores" 
                  required 
                />
              </div>

              <div className="checkout-fields-row">
                <div className="form-group flex-1">
                  <label className="form-label">City</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Cartagena" 
                    required 
                  />
                </div>
                <div className="form-group width-100">
                  <label className="form-label">ZIP / Postal Code</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="130001" 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <input 
                  type="text"
                  className="form-input" 
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. United States, India, United Kingdom" 
                  required 
                />
              </div>
            </div>

            {/* Shipping Options Selector */}
            <div className="checkout-section" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              <h3 className="section-title-sm"><Truck size={18} /> Shipping Options</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', padding: '0.8rem', border: '1px solid var(--color-border)', backgroundColor: shippingMethod === 'standard' ? 'var(--color-bg-alt)' : 'transparent', borderRadius: '4px', transition: 'background-color 0.2s ease' }}>
                  <input 
                    type="radio" 
                    name="shipping_method" 
                    value="standard" 
                    checked={shippingMethod === 'standard'} 
                    onChange={() => setShippingMethod('standard')} 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div>
                      <strong>Standard Delivery</strong>
                      <p style={{ fontSize: '0.8rem', color: '#666', margin: '0.2rem 0 0' }}>Takes 5-7 business days</p>
                    </div>
                    <span style={{ fontWeight: 600 }}>{isFreeShippingAvailable ? 'FREE' : formatPrice(15)}</span>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', padding: '0.8rem', border: '1px solid var(--color-border)', backgroundColor: shippingMethod === 'express' ? 'var(--color-bg-alt)' : 'transparent', borderRadius: '4px', transition: 'background-color 0.2s ease' }}>
                  <input 
                    type="radio" 
                    name="shipping_method" 
                    value="express" 
                    checked={shippingMethod === 'express'} 
                    onChange={() => setShippingMethod('express')} 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div>
                      <strong>Express Courier</strong>
                      <p style={{ fontSize: '0.8rem', color: '#666', margin: '0.2rem 0 0' }}>Takes 2-3 business days</p>
                    </div>
                    <span style={{ fontWeight: 600 }}>{isFreeShippingAvailable ? formatPrice(15) : formatPrice(35)}</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Payment Information */}
            <div className="checkout-section">
              <h3 className="section-title-sm"><CreditCard size={18} /> Select Payment Method</h3>
              
              {/* Payment Tab Buttons */}
              <div style={{ display: 'flex', gap: '0.6rem', margin: '1rem 0 1.5rem', flexWrap: 'wrap' }}>
                {['card', 'upi', 'paypal', 'cod'].map((method) => (
                  <button 
                    key={method}
                    type="button" 
                    className={`btn-secondary ${paymentMethod === method ? 'active' : ''}`}
                    onClick={() => setPaymentMethod(method)}
                    style={{ 
                      flex: 1, 
                      minWidth: '75px', 
                      padding: '0.5rem 0.2rem', 
                      border: paymentMethod === method ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)', 
                      backgroundColor: paymentMethod === method ? 'var(--color-bg-alt)' : 'transparent', 
                      fontSize: '0.8rem', 
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {/* Dynamic Forms */}
              {paymentMethod === 'card' && (
                <div className="animate-fade-only">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Card Details</label>
                    {cardBrand && (
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-accent)', border: '1px solid var(--color-accent)', padding: '0.1rem 0.4rem', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {cardBrand}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4000 1234 5678 9010" 
                      maxLength="19"
                      required 
                    />
                  </div>

                  <div className="checkout-fields-row">
                    <div className="form-group flex-1">
                      <label className="form-label">Expiry Date</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY" 
                        maxLength="5"
                        required 
                      />
                    </div>
                    <div className="form-group width-100">
                      <label className="form-label">CVV</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        value={cardCvv}
                        onChange={handleCvvChange}
                        placeholder="•••" 
                        maxLength="4"
                        required 
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="animate-fade-only" style={{ padding: '1rem', border: '1px dashed var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-bg-alt)' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">UPI ID / VPA *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. anshika@upi" 
                      required 
                    />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '0.6rem', lineHeight: '1.4' }}>
                    A collect request will be sent to your registered UPI address to complete the purchase.
                  </p>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="animate-fade-only" style={{ padding: '1.2rem', border: '1px solid var(--color-border)', borderRadius: '4px', textAlign: 'center', backgroundColor: '#FFFDF9' }}>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-primary)', marginBottom: '1.2rem', lineHeight: '1.5' }}>
                    Pay securely using your PayPal account balance, linked card, or bank account.
                  </p>
                  <div style={{ backgroundColor: '#FFC439', color: '#111', padding: '0.75rem', fontWeight: 'bold', borderRadius: '4px', display: 'inline-block', width: '100%', maxWidth: '240px', cursor: 'default', fontSize: '0.88rem' }}>
                    PayPal Checkout
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="animate-fade-only" style={{ padding: '1rem', border: '1px solid rgba(197, 168, 128, 0.3)', borderRadius: '4px', backgroundColor: '#FCFBF7', color: 'var(--color-primary)' }}>
                  <strong>Cash on Delivery (COD) Selected</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '0.4rem', lineHeight: '1.5', margin: '0.4rem 0 0' }}>
                    Pay in cash when our delivery partner reaches your shipping address. Please make sure someone is available to receive and pay for the order.
                  </p>
                </div>
              )}

              {/* Order Notes text area */}
              <div className="form-group" style={{ marginTop: '1.5rem', marginBottom: 0 }}>
                <label className="form-label">Order Notes (Optional)</label>
                <textarea
                  className="form-input"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Notes about delivery, packaging, or custom size requests..."
                  rows="3"
                  style={{ resize: 'vertical', minHeight: '60px', fontFamily: 'inherit', marginBottom: 0 }}
                ></textarea>
              </div>
            </div>

            <button type="submit" className="btn-primary checkout-submit-btn" disabled={loading}>
              {loading ? 'Processing Transaction...' : `Pay & Place Order • ${formatPrice(grandTotal)}`}
            </button>
          </form>
        </div>

        {/* Right Summary Panel */}
        <div className="checkout-summary-panel">
          <h3 className="summary-heading">Order Summary</h3>
          <div className="summary-items-list">
            {cartItems.map((item) => (
              <div className="summary-item-row" key={item.id}>
                <img src={item.primary_image} alt={item.name} className="summary-item-img" />
                <div className="summary-item-info">
                  <h4 className="summary-item-name">{item.name}</h4>
                  <span className="summary-item-size">Size: {item.selected_size} &bull; Qty: {item.quantity}</span>
                </div>
                <span className="summary-item-price">{formatPrice(Number(item.price) * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Promo Code Entry */}
          <div className="promo-code-box" style={{ margin: '1.5rem 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.2rem' }}>
            <label className="form-label" style={{ marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>Promo Code</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="form-input" 
                value={promoInput} 
                onChange={(e) => setPromoInput(e.target.value)} 
                placeholder="e.g. WELCOME20"
                disabled={appliedPromo !== null}
                style={{ textTransform: 'uppercase', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
              />
              {appliedPromo ? (
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={handleRemovePromo}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                >
                  Remove
                </button>
              ) : (
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={handleApplyPromo}
                  disabled={!promoInput || promoLoading}
                  style={{ padding: '0.4rem 1.2rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                >
                  {promoLoading ? '...' : 'Apply'}
                </button>
              )}
            </div>
            {promoError && <p style={{ color: '#D9534F', fontSize: '0.75rem', marginTop: '0.4rem' }}>{promoError}</p>}
            {appliedPromo && (
              <p style={{ color: '#3D4A3E', fontSize: '0.78rem', marginTop: '0.4rem', fontWeight: 600 }}>
                ✓ Code {appliedPromo.code} applied! ({appliedPromo.discount_percent}% Off)
              </p>
            )}
          </div>

          <div className="summary-totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            {appliedPromo && (
              <div className="total-row" style={{ color: '#D9534F' }}>
                <span>Discount ({appliedPromo.code})</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="total-row">
              <span>Standard Shipping</span>
              <span>{formatPrice(shippingCost)}</span>
            </div>
            <div className="total-row grand-total-row">
              <span>Total ({selectedCurrency})</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .checkout-page {
          padding-top: 130px;
          padding-bottom: 7rem;
        }

        .checkout-page-header {
          margin-bottom: 3.5rem;
          text-align: center;
        }

        .checkout-page-title {
          font-size: 2.5rem;
          font-weight: 500;
        }

        .checkout-auth-prompt {
          max-width: 450px;
          background: var(--color-white);
          border: 1px solid var(--color-border);
          padding: 3rem;
          box-shadow: var(--shadow-medium);
          margin: 3rem auto;
        }

        .auth-lock-icon {
          color: var(--color-accent);
          margin-bottom: 1.5rem;
        }

        .checkout-auth-prompt h2 {
          font-size: 1.8rem;
          margin-bottom: 1rem;
        }

        .checkout-auth-prompt p {
          font-size: 0.92rem;
          color: var(--color-muted);
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        /* Order Success layout */
        .order-success-card {
          max-width: 500px;
          background: var(--color-white);
          border: 1px solid var(--color-border);
          padding: 4rem 3rem;
          box-shadow: var(--shadow-medium);
          margin: 3rem auto;
        }

        .success-icon {
          color: var(--color-success);
          margin-bottom: 1.5rem;
        }

        .success-title {
          font-size: 2.2rem;
          margin-bottom: 0.5rem;
        }

        .success-order-id {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--color-accent-hover);
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .success-message {
          font-size: 0.95rem;
          color: var(--color-muted);
          line-height: 1.6;
          margin-bottom: 2.5rem;
        }

        .success-summary-box {
          background-color: var(--color-bg-alt);
          padding: 1.5rem;
          border: 1px solid var(--color-border-light);
          margin-bottom: 2.5rem;
          text-align: left;
          font-size: 0.9rem;
        }

        .success-summary-box .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .success-summary-box .summary-row:last-child {
          margin-bottom: 0;
          border-top: 1px solid rgba(61, 74, 62, 0.08);
          padding-top: 1rem;
        }

        .flex-column {
          flex-direction: column;
        }

        .summary-address {
          margin-top: 0.3rem;
          color: var(--color-muted);
          line-height: 1.5;
        }

        .success-btn {
          width: 100%;
        }

        /* Checkout Grid Layout */
        .checkout-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 4rem;
        }

        .checkout-section {
          background-color: var(--color-white);
          border: 1px solid var(--color-border-light);
          padding: 2.5rem;
          margin-bottom: 2rem;
          box-shadow: var(--shadow-subtle);
        }

        .section-title-sm {
          font-family: var(--font-sans);
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--color-primary);
          margin-bottom: 1.8rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          border-bottom: 1px solid var(--color-border-light);
          padding-bottom: 0.8rem;
        }

        .checkout-fields-row {
          display: flex;
          gap: 1.5rem;
        }

        .flex-1 {
          flex: 1;
        }

        .width-100 {
          width: 130px;
        }

        .checkout-submit-btn {
          width: 100%;
          padding: 1.1rem;
        }

        /* Right Summary Panel */
        .checkout-summary-panel {
          border: 1px solid var(--color-border);
          padding: 2.5rem;
          background-color: var(--color-white);
          height: fit-content;
          box-shadow: var(--shadow-subtle);
        }

        .summary-heading {
          font-size: 1.4rem;
          font-weight: 500;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 1rem;
        }

        .summary-items-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
          max-height: 350px;
          overflow-y: auto;
        }

        .summary-item-row {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }

        .summary-item-img {
          width: 60px;
          height: 80px;
          object-fit: cover;
          background-color: var(--color-bg-alt);
        }

        .summary-item-info {
          flex: 1;
        }

        .summary-item-name {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--color-primary);
          margin-bottom: 0.15rem;
        }

        .summary-item-size {
          font-size: 0.75rem;
          color: var(--color-muted);
        }

        .summary-item-price {
          font-size: 0.95rem;
          font-weight: 500;
        }

        .summary-totals {
          border-top: 1px solid var(--color-border);
          padding-top: 1.8rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--color-muted);
        }

        .grand-total-row {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--color-primary);
          margin-top: 0.5rem;
          border-top: 1px solid var(--color-border-light);
          padding-top: 1rem;
        }

        @media (max-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .checkout-summary-panel {
            order: -1;
          }
        }
      `}</style>
    </div>
  );
}
