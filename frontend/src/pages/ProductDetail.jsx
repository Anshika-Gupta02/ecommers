import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { API_URL } from '../context/AuthContext';
import { ArrowLeft, Plus, Minus, Info, ShieldAlert } from 'lucide-react';

export default function ProductDetail({ productId, setPage }) {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Interactive page states
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [buttonState, setButtonState] = useState('idle'); // idle, adding, added
  const [sizeWarning, setSizeWarning] = useState(false);

  // Accordion Toggles
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products/${productId}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          // Auto select size if only one option (e.g. "O/S")
          if (data.size_options && data.size_options.length === 1) {
            setSelectedSize(data.size_options[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        setLoading(false);
      }
    }
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setSizeWarning(true);
      return;
    }

    setSizeWarning(false);
    setButtonState('adding');
    
    // Add to cart context
    await addToCart(product, selectedSize, quantity);
    
    setButtonState('added');
    setTimeout(() => {
      setButtonState('idle');
    }, 2000);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setSizeWarning(false);
  };

  if (loading) {
    return (
      <div className="flex-center detail-loading-container container">
        <span className="loading-spinner"></span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-center detail-loading-container container">
        <div className="text-center">
          <p>Unable to retrieve product details.</p>
          <button className="btn-primary" onClick={() => setPage('catalog')}>Back to Catalog</button>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images.map(img => img.image_url)
    : ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600'];

  return (
    <div className="product-detail-page container animate-fade">
      {/* Back button */}
      <button className="back-btn" onClick={() => setPage('catalog')}>
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      <div className="detail-layout">
        {/* Gallery Col */}
        <div className="detail-gallery-col">
          <div className="main-image-display">
            <img src={images[activeImageIdx]} alt={product.name} />
          </div>
          {images.length > 1 && (
            <div className="gallery-thumbnails">
              {images.map((imgUrl, idx) => (
                <div 
                  key={idx}
                  className={`thumbnail-card ${idx === activeImageIdx ? 'active' : ''}`}
                  onClick={() => setActiveImageIdx(idx)}
                >
                  <img src={imgUrl} alt={`View ${idx + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Col */}
        <div className="detail-info-col">
          <span className="info-category">{product.category_name}</span>
          <h1 className="info-title">{product.name}</h1>
          <span className="info-price">{formatPrice(product.price)}</span>
          
          <div className="info-divider"></div>
          
          <p className="info-description">{product.description}</p>

          {/* Size Selector */}
          <div className="size-selector-section">
            <div className="size-selector-header">
              <span className="selector-title">Select Size</span>
              <button className="size-guide-btn"><Info size={14} /> Size Guide</button>
            </div>

            <div className="size-options-grid">
              {product.size_options.map((size) => (
                <button
                  key={size}
                  className={`size-option-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => handleSizeSelect(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            
            {sizeWarning && (
              <span className="size-warning-label animate-fade-only">
                <ShieldAlert size={14} /> Please select a size before adding to bag.
              </span>
            )}
          </div>

          {/* Quantity and Add To Cart */}
          <div className="purchase-controls-row">
            <div className="qty-picker">
              <button 
                className="qty-picker-btn"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Minus size={14} />
              </button>
              <span className="qty-picker-val">{quantity}</span>
              <button 
                className="qty-picker-btn"
                onClick={() => setQuantity(q => q + 1)}
              >
                <Plus size={14} />
              </button>
            </div>

            <button 
              className={`btn-primary purchase-add-btn ${buttonState !== 'idle' ? 'btn-adding' : ''}`}
              onClick={handleAddToCart}
              disabled={buttonState === 'adding'}
            >
              {buttonState === 'idle' && 'Add to Bag'}
              {buttonState === 'adding' && 'Adding to Bag...'}
              {buttonState === 'added' && 'Piece Added ✓'}
            </button>
          </div>

          <div className="info-divider"></div>

          {/* Accordions */}
          <div className="info-tabs">
            <div className="tabs-header">
              <button 
                className={`tab-btn-item ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Details & Care
              </button>
              <button 
                className={`tab-btn-item ${activeTab === 'shipping' ? 'active' : ''}`}
                onClick={() => setActiveTab('shipping')}
              >
                Shipping & Returns
              </button>
            </div>

            <div className="tab-content-panel">
              {activeTab === 'details' && (
                <p className="tab-text animate-fade-only">
                  {product.details || "Crafted from dry-clean safe premium eco-polyester and lined with custom botanic illustrations. Collaboration print celebrating the floral biodiversity of Colombia."}
                </p>
              )}
              {activeTab === 'shipping' && (
                <p className="tab-text animate-fade-only">
                  We offer free worldwide express delivery on all orders over $300. Orders are processed within 1-2 business days. Returns are accepted within 14 days of delivery. Custom duty taxes might apply depending on local borders.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .product-detail-page {
          padding-top: 130px;
          padding-bottom: 7rem;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--color-muted);
          margin-bottom: 3rem;
        }

        .back-btn:hover {
          color: var(--color-primary);
        }

        .detail-loading-container {
          min-height: 500px;
        }

        /* Layout */
        .detail-layout {
          display: flex;
          gap: 5rem;
        }

        .detail-gallery-col, .detail-info-col {
          flex: 1;
        }

        .main-image-display {
          width: 100%;
          aspect-ratio: 4/5;
          overflow: hidden;
          background-color: var(--color-bg-alt);
        }

        .main-image-display img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .gallery-thumbnails {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .thumbnail-card {
          width: 75px;
          aspect-ratio: 4/5;
          overflow: hidden;
          background-color: var(--color-bg-alt);
          cursor: pointer;
          border: 1px solid transparent;
        }

        .thumbnail-card.active {
          border-color: var(--color-primary);
        }

        .thumbnail-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Info column details */
        .info-category {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: var(--color-muted);
          display: block;
          margin-bottom: 0.5rem;
        }

        .info-title {
          font-size: 2.5rem;
          line-height: 1.1;
          margin-bottom: 0.8rem;
        }

        .info-price {
          font-size: 1.3rem;
          font-family: var(--font-sans);
          font-weight: 500;
          color: var(--color-secondary);
        }

        .info-divider {
          height: 1px;
          background-color: var(--color-border);
          margin: 2rem 0;
        }

        .info-description {
          font-size: 0.98rem;
          line-height: 1.7;
          color: var(--color-secondary);
          margin-bottom: 2rem;
        }

        /* Size section */
        .size-selector-section {
          margin-bottom: 2.2rem;
        }

        .size-selector-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.8rem;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .selector-title {
          font-weight: 600;
          color: var(--color-primary);
        }

        .size-guide-btn {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: var(--color-muted);
        }

        .size-options-grid {
          display: flex;
          gap: 0.8rem;
        }

        .size-option-btn {
          width: 48px;
          height: 40px;
          border: 1px solid var(--color-border);
          font-size: 0.85rem;
          font-weight: 500;
          transition: var(--transition-fast);
        }

        .size-option-btn:hover {
          border-color: var(--color-primary);
        }

        .size-option-btn.active {
          background-color: var(--color-primary);
          color: var(--color-bg);
          border-color: var(--color-primary);
        }

        .size-warning-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--color-error);
          font-size: 0.8rem;
          margin-top: 0.8rem;
        }

        /* Purchase Picker and button */
        .purchase-controls-row {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .qty-picker {
          display: flex;
          align-items: center;
          border: 1px solid var(--color-border);
          padding: 0.4rem;
        }

        .qty-picker-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qty-picker-btn:disabled {
          opacity: 0.3;
        }

        .qty-picker-val {
          font-size: 0.95rem;
          min-width: 30px;
          text-align: center;
        }

        .purchase-add-btn {
          flex: 1;
        }

        .btn-adding {
          background-color: var(--color-accent) !important;
          border-color: var(--color-accent) !important;
          color: var(--color-white) !important;
        }

        /* Accordions/Tabs styling */
        .tabs-header {
          display: flex;
          gap: 2rem;
          border-bottom: 1px solid var(--color-border-light);
          margin-bottom: 1.2rem;
        }

        .tab-btn-item {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 0.8rem 0;
          font-weight: 500;
          color: var(--color-muted);
          border-bottom: 1.5px solid transparent;
        }

        .tab-btn-item.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
        }

        .tab-text {
          font-size: 0.88rem;
          line-height: 1.6;
          color: var(--color-muted);
        }

        @media (max-width: 900px) {
          .detail-layout {
            flex-direction: column;
            gap: 3rem;
          }
        }
      `}</style>
    </div>
  );
}
