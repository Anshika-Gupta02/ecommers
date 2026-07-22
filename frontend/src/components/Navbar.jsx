import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useSettings } from '../context/SettingsContext';
import { ShoppingBag, User, LogOut, Menu, X } from 'lucide-react';

export default function Navbar({ setPage, currentPage }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount, setCartOpen } = useCart();
  const { selectedCurrency, setSelectedCurrency, currencies } = useCurrency();
  const { settings } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Monitor scroll for premium visual blur effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = (pageName) => {
    setPage(pageName);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoutClick = async () => {
    setMobileMenuOpen(false);
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

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container nav-container">
          {/* Mobile Menu Toggle */}
          <button className="nav-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Left Navigation links */}
          <div className="nav-links-left">
            <button 
              className={`nav-link-item ${currentPage === 'catalog' ? 'active' : ''}`}
              onClick={() => navigateTo('catalog')}
            >
              Shop Collection
            </button>
            <button 
              className="nav-link-item"
              onClick={() => {
                navigateTo('home');
                setTimeout(() => {
                  document.getElementById('our-story')?.scrollIntoView({ behavior: 'smooth' });
                }, 300);
              }}
            >
              Our Story
            </button>
          </div>

          {/* Center Brand Name / Dynamic Logo */}
          <div className="nav-brand" onClick={() => navigateTo('home')}>
            {settings?.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt={settings.store_name || "Store Logo"} 
                style={{ maxHeight: '42px', maxWidth: '180px', objectFit: 'contain' }} 
              />
            ) : (
              <>
                {settings?.store_name?.split(' ')[0] || "ANSHIKA'S"}
                <span className="brand-sub">
                  {settings?.store_name?.split(' ').slice(1).join(' ') || "STORE"}
                </span>
              </>
            )}
          </div>

          {/* Right Navigation Controls */}
          <div className="nav-controls-right">
            {isAuthenticated ? (
              <div className="nav-user-menu">
                {user?.role === 'admin' && (
                  <button 
                    className={`nav-link-item ${currentPage === 'admin' ? 'active' : ''}`}
                    onClick={() => navigateTo('admin')}
                    style={{ marginRight: '1rem' }}
                  >
                    Admin
                  </button>
                )}
                <button className="nav-icon-btn" onClick={() => navigateTo('profile')} title="Profile">
                  <User size={19} />
                  <span className="nav-username">{user?.name?.split(' ')[0]}</span>
                </button>
                <button className="nav-icon-btn nav-logout-btn" onClick={handleLogoutClick} title="Log Out">
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <button 
                className={`nav-link-item ${currentPage === 'auth' ? 'active' : ''}`} 
                onClick={() => navigateTo('auth')}
              >
                Sign In
              </button>
            )}

            {/* Currency Selector */}
            <select 
              value={selectedCurrency} 
              onChange={(e) => setSelectedCurrency(e.target.value)}
              title="Switch Currency"
              style={{
                border: '1px solid rgba(61, 74, 62, 0.15)',
                background: scrolled ? '#FCFBF7' : 'transparent',
                fontSize: '0.78rem',
                color: '#3D4A3E',
                fontWeight: 500,
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                outline: 'none',
                marginRight: '0.8rem',
                fontFamily: 'inherit'
              }}
            >
              {Object.keys(currencies).map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>

            <button className="nav-icon-btn cart-btn-trigger" onClick={() => setCartOpen(true)} title="Shopping Cart">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-badge animate-fade-only">{cartCount}</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-menu animate-fade-only">
          <div className="mobile-nav-content">
            <button className="mobile-nav-link" onClick={() => navigateTo('catalog')}>
              Shop Collection
            </button>
            <button 
              className="mobile-nav-link"
              onClick={() => {
                navigateTo('home');
                setTimeout(() => {
                  document.getElementById('our-story')?.scrollIntoView({ behavior: 'smooth' });
                }, 300);
              }}
            >
              Our Story
            </button>
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <button className="mobile-nav-link" onClick={() => navigateTo('admin')}>
                    Admin Panel
                  </button>
                )}
                <button className="mobile-nav-link" onClick={() => navigateTo('profile')}>
                  My Account
                </button>
                <button className="mobile-nav-link text-logout" onClick={handleLogoutClick}>
                  Log Out
                </button>
              </>
            ) : (
              <button className="mobile-nav-link" onClick={() => navigateTo('auth')}>
                Sign In
              </button>
            )}
          </div>
        </div>
      )}

      {/* Styling for Navbar */}
      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 85px;
          z-index: 100;
          display: flex;
          align-items: center;
          background-color: transparent;
          border-bottom: 1px solid transparent;
          transition: var(--transition-smooth);
        }

        .navbar-scrolled {
          background-color: rgba(252, 251, 247, 0.95);
          backdrop-filter: blur(10px);
          height: 75px;
          border-bottom: 1px solid var(--color-border);
          box-shadow: 0 4px 30px rgba(0,0,0,0.02);
        }

        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 100%;
        }

        .nav-links-left {
          display: flex;
          gap: 2.5rem;
          width: 30%;
        }

        .nav-link-item {
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: var(--color-primary);
          font-weight: 500;
          padding: 0.5rem 0;
          border-bottom: 1.5px solid transparent;
          position: relative;
        }

        .nav-link-item:hover, .nav-link-item.active {
          border-bottom-color: var(--color-accent);
          color: var(--color-secondary);
        }

        .nav-brand {
          font-family: var(--font-serif);
          font-size: 1.8rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-align: center;
          color: var(--color-primary);
          cursor: pointer;
          user-select: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 1.1;
        }

        .brand-sub {
          font-family: var(--font-sans);
          font-size: 0.55rem;
          letter-spacing: 0.32em;
          font-weight: 400;
          color: var(--color-muted);
          margin-top: 0.2rem;
        }

        .nav-controls-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 1.8rem;
          width: 30%;
        }

        .nav-user-menu {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-icon-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-primary);
          position: relative;
        }

        .nav-username {
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 500;
        }

        .nav-logout-btn {
          color: var(--color-muted);
        }
        .nav-logout-btn:hover {
          color: var(--color-error);
        }

        .cart-btn-trigger {
          position: relative;
          color: var(--color-primary);
        }

        .cart-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background-color: var(--color-accent);
          color: var(--color-white);
          font-size: 0.65rem;
          font-weight: 600;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-toggle {
          display: none;
          color: var(--color-primary);
        }

        /* Mobile Nav */
        .mobile-nav-menu {
          position: fixed;
          top: 85px;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--color-bg);
          z-index: 99;
          display: flex;
          flex-direction: column;
          padding: 2rem;
          border-top: 1px solid var(--color-border);
        }

        .mobile-nav-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .mobile-nav-link {
          font-size: 1.2rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          text-align: left;
          color: var(--color-primary);
          border-bottom: 1px solid var(--color-border-light);
          padding-bottom: 0.8rem;
        }

        .text-logout {
          color: var(--color-error);
        }

        @media (max-width: 900px) {
          .nav-links-left {
            display: none;
          }
          .nav-toggle {
            display: block;
            width: auto;
            text-align: left;
            padding: 0.5rem 0;
          }
          .nav-brand {
            flex-grow: 1;
            width: auto;
            text-align: center;
            font-size: 1.5rem;
          }
          .brand-sub {
            font-size: 0.5rem;
            letter-spacing: 0.25em;
          }
          .nav-controls-right {
            width: auto;
            gap: 1rem;
          }
          .nav-username {
            display: none;
          }
          .navbar {
            height: 75px;
          }
        }

        @media (max-width: 480px) {
          .nav-controls-right {
            gap: 0.6rem;
          }
          .nav-brand {
            font-size: 1.25rem;
          }
          .brand-sub {
            font-size: 0.45rem;
            letter-spacing: 0.2em;
          }
          .nav-brand img {
            max-height: 32px !important;
          }
          select[title="Switch Currency"] {
            font-size: 0.72rem !important;
            padding: 0.15rem 0.3rem !important;
            margin-right: 0.4rem !important;
          }
        }
      `}</style>
    </>
  );
}
