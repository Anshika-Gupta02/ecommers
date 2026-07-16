import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Auth from './pages/Auth';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';

export default function AppContent() {
  const [page, setPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);

  return (
    <div className="app-container">
      {/* Top Sticky Navigation */}
      <Navbar setPage={setPage} currentPage={page} />
      
      {/* Dynamic Page Views */}
      <main className="main-content">
        {page === 'home' && (
          <Home setPage={setPage} setSelectedProductId={setSelectedProductId} />
        )}
        {page === 'catalog' && (
          <Catalog setPage={setPage} setSelectedProductId={setSelectedProductId} />
        )}
        {page === 'product' && (
          <ProductDetail productId={selectedProductId} setPage={setPage} />
        )}
        {page === 'auth' && (
          <Auth setPage={setPage} />
        )}
        {page === 'checkout' && (
          <Checkout setPage={setPage} />
        )}
        {page === 'profile' && (
          <Profile setPage={setPage} />
        )}
        {page === 'admin' && (
          <Admin setPage={setPage} />
        )}
        {page === 'about' && (
          <About setPage={setPage} />
        )}
        {page === 'contact' && (
          <Contact setPage={setPage} />
        )}
        {page === 'faq' && (
          <FAQ setPage={setPage} />
        )}
      </main>

      {/* Side Panels & Footers */}
      <CartDrawer setPage={setPage} />
      <Footer setPage={setPage} />
    </div>
  );
}
