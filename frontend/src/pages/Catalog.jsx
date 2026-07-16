import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { API_URL } from '../context/AuthContext';
import { Search, Filter, X } from 'lucide-react';

export default function Catalog({ setPage, setSelectedProductId }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for query parameters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  
  // Mobile filter sidebar toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch Categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(`${API_URL}/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch Products based on filter query params
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory) queryParams.append('category', selectedCategory);
        if (searchQuery) queryParams.append('search', searchQuery);
        if (sortOption) queryParams.append('sort', sortOption);

        const res = await fetch(`${API_URL}/products?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }

    const delayDebounce = setTimeout(() => {
      loadProducts();
    }, 300); // Debounce search query input

    return () => clearTimeout(delayDebounce);
  }, [selectedCategory, searchQuery, sortOption]);

  const handleProductClick = (id) => {
    setSelectedProductId(id);
    setPage('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setSortOption('newest');
  };

  return (
    <div className="catalog-page container animate-fade">
      {/* Editorial Header */}
      <header className="catalog-header text-center">
        <h1 className="catalog-title">Shop Collection</h1>
        <p className="catalog-subtitle">Artisanal garments inspired by tropical landscapes</p>
        <div className="botanical-divider">
          <span className="botanical-line"></span>
          <span className="botanical-line"></span>
        </div>
      </header>

      {/* Catalog Search & Toggle */}
      <div className="catalog-toolbar">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search our collection..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              <X size={15} />
            </button>
          )}
        </div>

        <button className="mobile-filter-toggle btn-secondary" onClick={() => setShowMobileFilters(true)}>
          <Filter size={16} /> Filters
        </button>

        <div className="sort-selector">
          <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)} 
            className="sort-dropdown"
          >
            <option value="newest">Sort By: Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="catalog-layout">
        {/* Sidebar Filters - Desktop */}
        <aside className="catalog-sidebar">
          <h4 className="sidebar-heading">Filter by Category</h4>
          <ul className="category-filter-list">
            <li>
              <button 
                className={`filter-btn-item ${selectedCategory === '' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('')}
              >
                All Products
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button 
                  className={`filter-btn-item ${selectedCategory === cat.name ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.name)}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>

          <div className="sidebar-divider"></div>

          {(selectedCategory || searchQuery) && (
            <button className="btn-secondary clear-all-btn" onClick={handleResetFilters}>
              Clear Filters
            </button>
          )}
        </aside>

        {/* Product Grid */}
        <main className="catalog-products-grid-container">
          {loading ? (
            <div className="flex-center catalog-loading">
              <span className="loading-spinner"></span>
            </div>
          ) : products.length === 0 ? (
            <div className="no-products-found">
              <p>No beautiful pieces match your selection.</p>
              <button className="btn-primary" onClick={handleResetFilters}>Reset Filters</button>
            </div>
          ) : (
            <div className="catalog-grid">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onClick={() => handleProductClick(product.id)} 
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Sidebar Drawer */}
      {showMobileFilters && (
        <div className="mobile-filters-drawer-overlay animate-fade-only" onClick={() => setShowMobileFilters(false)}>
          <div className="mobile-filters-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Filters</h3>
              <button onClick={() => setShowMobileFilters(false)}><X size={20} /></button>
            </div>
            <div className="drawer-body">
              <h4 className="sidebar-heading">Categories</h4>
              <ul className="category-filter-list">
                <li>
                  <button 
                    className={`filter-btn-item ${selectedCategory === '' ? 'active' : ''}`}
                    onClick={() => { setSelectedCategory(''); setShowMobileFilters(false); }}
                  >
                    All Products
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button 
                      className={`filter-btn-item ${selectedCategory === cat.name ? 'active' : ''}`}
                      onClick={() => { setSelectedCategory(cat.name); setShowMobileFilters(false); }}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .catalog-page {
          padding-top: 130px;
          padding-bottom: 7rem;
        }

        .catalog-header {
          margin-bottom: 3rem;
        }

        .catalog-title {
          font-size: 2.8rem;
          margin-bottom: 0.3rem;
        }

        .catalog-subtitle {
          font-size: 0.95rem;
          color: var(--color-muted);
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        /* Toolbar styling */
        .catalog-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          padding-bottom: 1.2rem;
          border-bottom: 1px solid var(--color-border-light);
          gap: 1.5rem;
        }

        .search-bar {
          position: relative;
          display: flex;
          align-items: center;
          width: 320px;
          border-bottom: 1px solid var(--color-border);
        }

        .search-icon {
          color: var(--color-muted);
          margin-right: 0.5rem;
        }

        .search-input {
          border: none;
          background: transparent;
          padding: 0.6rem 0;
          width: 100%;
          font-size: 0.95rem;
        }

        .clear-search-btn {
          color: var(--color-muted);
          position: absolute;
          right: 0;
        }

        .sort-dropdown {
          border: none;
          background: transparent;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--color-primary);
          cursor: pointer;
          font-weight: 500;
          padding: 0.5rem 0;
          border-bottom: 1.5px solid transparent;
        }

        .mobile-filter-toggle {
          display: none;
          padding: 0.5rem 1.2rem;
          font-size: 0.8rem;
        }

        /* Layout */
        .catalog-layout {
          display: flex;
          gap: 4rem;
        }

        .catalog-sidebar {
          width: 240px;
          flex-shrink: 0;
        }

        .sidebar-heading {
          font-family: var(--font-sans);
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 1.5rem;
          color: var(--color-primary);
        }

        .category-filter-list {
          list-style: none;
        }

        .category-filter-list li {
          margin-bottom: 0.9rem;
        }

        .filter-btn-item {
          font-size: 0.95rem;
          color: var(--color-muted);
          transition: var(--transition-fast);
          padding: 0.2rem 0;
          border-bottom: 1.5px solid transparent;
        }

        .filter-btn-item:hover, .filter-btn-item.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-accent);
          font-weight: 500;
        }

        .sidebar-divider {
          height: 1px;
          background-color: var(--color-border-light);
          margin: 2rem 0;
        }

        .clear-all-btn {
          width: 100%;
          font-size: 0.8rem;
          padding: 0.7rem;
        }

        .catalog-products-grid-container {
          flex: 1;
        }

        .catalog-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3rem 2rem;
        }

        .catalog-loading {
          min-height: 400px;
        }

        .no-products-found {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          color: var(--color-muted);
          min-height: 350px;
          text-align: center;
        }

        /* Mobile filters drawer */
        .mobile-filters-drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(61, 74, 62, 0.4);
          z-index: 200;
        }

        .mobile-filters-drawer {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 280px;
          background-color: var(--color-bg);
          padding: 2rem;
          box-shadow: 10px 0 40px rgba(0,0,0,0.08);
          animation: slideInRight 0.4s reverse; /* Adjust for slide-in from left */
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        @media (max-width: 900px) {
          .catalog-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .catalog-sidebar {
            display: none;
          }
          .mobile-filter-toggle {
            display: flex;
            align-items: center;
            gap: 0.4rem;
          }
          .search-bar {
            width: 50%;
          }
        }

        @media (max-width: 600px) {
          .catalog-grid {
            grid-template-columns: 1fr;
          }
          .catalog-toolbar {
            flex-direction: column;
            align-items: flex-start;
          }
          .search-bar {
            width: 100%;
          }
          .mobile-filter-toggle {
            width: 100%;
            justify-content: center;
          }
          .sort-selector {
            width: 100%;
            text-align: center;
            border-top: 1px solid var(--color-border-light);
          }
          .sort-dropdown {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
