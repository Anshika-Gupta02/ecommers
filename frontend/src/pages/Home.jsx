import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { API_URL } from '../context/AuthContext';
import { Heart, Compass, ShieldCheck } from 'lucide-react';

export default function Home({ setPage, setSelectedProductId }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch a subset of products for the homepage
  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch(`${API_URL}/products`);
        if (res.ok) {
          const data = await res.json();
          // Slice first 3 products to showcase on home
          setFeaturedProducts(data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching homepage products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <div className="home-page animate-fade">
      {/* Editorial Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content container">
          <span className="hero-subtitle">Anshika's Store</span>
          <h1 className="hero-title">Botanical Home Luxury</h1>
          <p className="hero-description">
            Explore our curated collections of premium bedsheets, pillow covers, and cozy throw blankets. Crafted from organic Egyptian cotton and French linen with hand-illustrated floral designs.
          </p>
          <button className="btn-primary hero-btn" onClick={() => setPage('catalog')}>
            Explore Collection
          </button>
        </div>
      </section>

      {/* Categories Banner Section */}
      <section className="categories-preview container">
        <div className="section-header text-center">
          <span className="section-subtitle">Curated edits</span>
          <h2 className="section-title">Shop by Category</h2>
          <div className="botanical-divider">
            <span className="botanical-line"></span>
            <span className="botanical-line"></span>
          </div>
        </div>

        <div className="categories-grid">
          {/* Category Bedsheets */}
          <div className="category-banner-card" onClick={() => setPage('catalog')}>
            <img src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600" alt="Bedsheets" />
            <div className="category-card-overlay">
              <h3>Bedsheets</h3>
              <span className="category-card-link">Explore sheets</span>
            </div>
          </div>

          {/* Category Pillow Covers */}
          <div className="category-banner-card" onClick={() => setPage('catalog')}>
            <img src="https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=600" alt="Pillow Covers" />
            <div className="category-card-overlay">
              <h3>Pillow Covers</h3>
              <span className="category-card-link">Explore pillows</span>
            </div>
          </div>

          {/* Category Blankets & Throws */}
          <div className="category-banner-card" onClick={() => setPage('catalog')}>
            <img src="https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&q=80&w=600" alt="Blankets & Throws" />
            <div className="category-card-overlay">
              <h3>Blankets & Throws</h3>
              <span className="category-card-link">Explore throws</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainable / Craftsmanship Story Section */}
      <section className="story-section" id="our-story">
        <div className="container story-flex">
          <div className="story-image-col">
            <img src="https://images.unsplash.com/photo-1590736969955-71cb94801750?auto=format&fit=crop&q=80&w=600" alt="Artisan hand embroidering fabric" className="story-img" />
          </div>
          <div className="story-text-col">
            <span className="section-subtitle">Our Heritage</span>
            <h2 className="story-title">Crafted by Hand, Inspired by Nature</h2>
            <p className="story-description-text">
              Anshika's Store is a celebration of master craftsmanship and cozy home comfort. We collaborate closely with local weavers and embroidery artisans, combining traditional hand-embroidery and weaving techniques with premium organic Egyptian cotton and French flax linen.
            </p>
            <p className="story-description-text">
              Each floral pattern is hand-illustrated, turning sheets and pillow covers into beautiful canvases that bring the serenity of nature into your bedroom.
            </p>
            
            <div className="philosophy-icons">
              <div className="philosophy-item">
                <Heart size={24} className="phi-icon" />
                <h5>Artisanal Empowerment</h5>
              </div>
              <div className="philosophy-item">
                <Compass size={24} className="phi-icon" />
                <h5>Artisanal Heritage</h5>
              </div>
              <div className="philosophy-item">
                <ShieldCheck size={24} className="phi-icon" />
                <h5>Conscious Design</h5>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="featured-showcase container">
        <div className="section-header text-center">
          <span className="section-subtitle">Exquisite details</span>
          <h2 className="section-title">Featured Pieces</h2>
          <div className="botanical-divider">
            <span className="botanical-line"></span>
            <span className="botanical-line"></span>
          </div>
        </div>

        {loading ? (
          <div className="flex-center loading-container">
            <span className="loading-spinner"></span>
          </div>
        ) : (
          <div className="featured-grid">
            {featuredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => {
                  setSelectedProductId(product.id);
                  setPage('product');
                }} 
              />
            ))}
          </div>
        )}
      </section>

      <style>{`
        .home-page {
          padding-bottom: 5rem;
        }

        /* Hero CSS */
        .hero-section {
          height: 100vh;
          position: relative;
          background-image: url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1600');
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          color: var(--color-white);
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(61, 74, 62, 0.4);
        }

        .hero-content {
          position: relative;
          z-index: 10;
          max-width: 650px;
        }

        .hero-subtitle {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          margin-bottom: 1rem;
          display: block;
        }

        .hero-title {
          font-size: 4rem;
          font-family: var(--font-serif);
          color: var(--color-bg);
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }

        .hero-description {
          font-size: 1.05rem;
          line-height: 1.8;
          margin-bottom: 2.5rem;
          opacity: 0.95;
        }

        .hero-btn {
          border-color: var(--color-bg) !important;
          background-color: var(--color-bg) !important;
          color: var(--color-primary) !important;
        }

        .hero-btn:hover {
          background-color: transparent !important;
          color: var(--color-bg) !important;
        }

        /* General Section Header */
        .section-header {
          margin-top: 6rem;
          margin-bottom: 3rem;
        }

        .text-center {
          text-align: center;
        }

        .section-subtitle {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--color-muted);
          margin-bottom: 0.5rem;
          display: block;
        }

        .section-title {
          font-size: 2.2rem;
          font-weight: 400;
        }

        /* Categories Preview */
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .category-banner-card {
          position: relative;
          aspect-ratio: 4/5;
          overflow: hidden;
          cursor: pointer;
        }

        .category-banner-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1.2s ease;
        }

        .category-card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(61, 74, 62, 0.6) 0%, rgba(61, 74, 62, 0) 60%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 2.5rem;
          color: var(--color-white);
        }

        .category-card-overlay h3 {
          color: var(--color-bg);
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
        }

        .category-card-link {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          border-bottom: 1px solid var(--color-bg);
          padding-bottom: 2px;
          align-self: flex-start;
        }

        .category-banner-card:hover img {
          transform: scale(1.05);
        }

        /* Story Section */
        .story-section {
          background-color: var(--color-bg-alt);
          padding: 7rem 0;
          margin-top: 7rem;
        }

        .story-flex {
          display: flex;
          align-items: center;
          gap: 5rem;
        }

        .story-image-col, .story-text-col {
          flex: 1;
        }

        .story-img {
          width: 100%;
          aspect-ratio: 4/5;
          object-fit: cover;
          box-shadow: var(--shadow-medium);
        }

        .story-title {
          font-size: 2.5rem;
          margin-top: 0.5rem;
          margin-bottom: 1.8rem;
          line-height: 1.2;
        }

        .story-description-text {
          font-size: 0.98rem;
          color: var(--color-secondary);
          margin-bottom: 1.5rem;
          line-height: 1.7;
        }

        .philosophy-icons {
          display: flex;
          gap: 2rem;
          margin-top: 2.5rem;
        }

        .philosophy-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          background-color: var(--color-bg);
          padding: 1.2rem;
          border: 1px solid var(--color-border-light);
        }

        .phi-icon {
          color: var(--color-accent);
          margin-bottom: 0.8rem;
        }

        .philosophy-item h5 {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
        }

        /* Featured Grid */
        .featured-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2.5rem;
        }

        .loading-container {
          min-height: 200px;
        }

        .loading-spinner {
          width: 35px;
          height: 35px;
          border: 2px solid var(--color-border);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 900px) {
          .hero-title {
            font-size: 3rem;
          }
          .categories-grid {
            grid-template-columns: 1fr;
          }
          .story-flex {
            flex-direction: column;
            gap: 3rem;
          }
          .philosophy-icons {
            flex-direction: column;
            gap: 1rem;
          }
          .featured-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
