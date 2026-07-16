import React from 'react';
import { useCurrency } from '../context/CurrencyContext';

export default function ProductCard({ product, onClick }) {
  const { formatPrice } = useCurrency();
  // Use fallbacks for images if they are missing
  const primaryImg = product.primary_image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600';
  
  // Try to find a secondary image or reuse the primary one
  const secondaryImg = product.images && product.images.length > 1
    ? product.images.find(img => !img.is_primary)?.image_url || primaryImg
    : primaryImg;

  return (
    <div className="product-card" onClick={onClick}>
      <div className="product-image-container">
        <img src={primaryImg} alt={product.name} className="product-img-primary" loading="lazy" />
        <img src={secondaryImg} alt={`${product.name} hover view`} className="product-img-secondary" loading="lazy" />
        
        {/* Quick View Hover overlay */}
        <div className="product-card-overlay">
          <span className="quick-view-text">Explore Piece</span>
        </div>
      </div>

      <div className="product-card-info">
        <span className="product-card-category">{product.category_name}</span>
        <h4 className="product-card-title">{product.name}</h4>
        <span className="product-card-price">{formatPrice(product.price)}</span>
      </div>

      <style>{`
        .product-card {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          background-color: transparent;
          transition: var(--transition-smooth);
        }

        .product-image-container {
          position: relative;
          width: 100%;
          padding-top: 135%; /* Tall portrait style (typical for luxury apparel) */
          overflow: hidden;
          background-color: var(--color-bg-alt);
        }

        .product-image-container img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.8s ease;
        }

        .product-img-secondary {
          opacity: 0;
        }

        .product-card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(61, 74, 62, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: var(--transition-smooth);
        }

        .quick-view-text {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--color-primary);
          background-color: var(--color-bg);
          padding: 0.8rem 1.5rem;
          border: 1px solid var(--color-border);
          transform: translateY(10px);
          transition: var(--transition-smooth);
        }

        /* Hover actions */
        .product-card:hover .product-img-primary {
          opacity: 0;
          transform: scale(1.03);
        }

        .product-card:hover .product-img-secondary {
          opacity: 1;
          transform: scale(1.03);
        }

        .product-card:hover .product-card-overlay {
          opacity: 1;
        }

        .product-card:hover .quick-view-text {
          transform: translateY(0);
        }

        .product-card-info {
          padding: 1.2rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .product-card-category {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--color-muted);
          margin-bottom: 0.4rem;
        }

        .product-card-title {
          font-size: 1.05rem;
          font-weight: 400;
          color: var(--color-primary);
          margin-bottom: 0.4rem;
          transition: var(--transition-fast);
        }

        .product-card:hover .product-card-title {
          color: var(--color-accent-hover);
        }

        .product-card-price {
          font-family: var(--font-sans);
          font-size: 0.95rem;
          color: var(--color-secondary);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
