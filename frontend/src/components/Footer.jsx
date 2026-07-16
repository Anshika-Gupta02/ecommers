import React from 'react';

export default function Footer({ setPage }) {
  const navigateTo = (pageName) => {
    setPage(pageName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-section">
      <div className="container footer-grid">
        {/* Brand Information */}
        <div className="footer-col brand-info">
          <h3 className="footer-logo">ANSHIKA'S</h3>
          <span className="footer-logo-sub">STORE</span>
          <p className="footer-description">
            A premium botanical home linens brand celebrating comfort, organic Egyptian cotton, French flax linen, and delicate hand-embroidery.
          </p>
        </div>

        {/* Shop Category Links */}
        <div className="footer-col">
          <h4 className="footer-heading">Collections</h4>
          <ul className="footer-links">
            <li><button className="footer-link-btn" onClick={() => navigateTo('catalog')}>All Products</button></li>
            <li><button className="footer-link-btn" onClick={() => navigateTo('catalog')}>Bedsheets</button></li>
            <li><button className="footer-link-btn" onClick={() => navigateTo('catalog')}>Pillow Covers</button></li>
            <li><button className="footer-link-btn" onClick={() => navigateTo('catalog')}>Blankets & Throws</button></li>
          </ul>
        </div>

        {/* Brand Philosophy Links */}
        <div className="footer-col">
          <h4 className="footer-heading">Our World</h4>
          <ul className="footer-links">
            <li>
              <button 
                className="footer-link-btn"
                onClick={() => {
                  navigateTo('home');
                  setTimeout(() => {
                    document.getElementById('our-story')?.scrollIntoView({ behavior: 'smooth' });
                  }, 300);
                }}
              >
                The Story
              </button>
            </li>
            <li><button className="footer-link-btn" onClick={() => navigateTo('about')}>Artisan Communities</button></li>
            <li><button className="footer-link-btn" onClick={() => navigateTo('about')}>Sustainability Commitments</button></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="footer-col">
          <h4 className="footer-heading">Customer Care</h4>
          <ul className="footer-links">
            <li><button className="footer-link-btn" onClick={() => navigateTo('contact')}>Contact Us</button></li>
            <li><button className="footer-link-btn" onClick={() => navigateTo('faq')}>Shipping & Deliveries</button></li>
            <li><button className="footer-link-btn" onClick={() => navigateTo('faq')}>Returns & Exchanges</button></li>
            <li><button className="footer-link-btn" onClick={() => navigateTo('faq')}>Care Guide</button></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-flex">
          <p className="copyright">&copy; 2026 ANSHIKA'S STORE. All Rights Reserved.</p>
          <div className="social-links">
            <a href="#" className="social-link">Instagram</a>
            <a href="#" className="social-link">Pinterest</a>
            <a href="#" className="social-link">Facebook</a>
          </div>
        </div>
      </div>

      <style>{`
        .footer-section {
          background-color: var(--color-bg-alt);
          padding: 5rem 0 2rem;
          margin-top: auto;
          border-top: 1px solid var(--color-border);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 4rem;
          margin-bottom: 4rem;
        }

        .brand-info {
          display: flex;
          flex-direction: column;
        }

        .footer-logo {
          font-size: 1.6rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          line-height: 1;
        }

        .footer-logo-sub {
          font-size: 0.55rem;
          letter-spacing: 0.3em;
          color: var(--color-muted);
          margin-top: 0.15rem;
          margin-bottom: 1.5rem;
        }

        .footer-description {
          font-size: 0.88rem;
          color: var(--color-muted);
          line-height: 1.7;
          max-width: 320px;
        }

        .footer-heading {
          font-family: var(--font-sans);
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 1.5rem;
          color: var(--color-primary);
        }

        .footer-links {
          list-style: none;
        }

        .footer-links li {
          margin-bottom: 0.8rem;
        }

        .footer-link-btn {
          font-size: 0.88rem;
          color: var(--color-muted);
          text-align: left;
          transition: var(--transition-fast);
          padding: 0;
        }

        .footer-link-btn:hover {
          color: var(--color-primary);
          padding-left: 3px;
        }

        .footer-bottom {
          padding-top: 2rem;
          border-top: 1px solid rgba(61, 74, 62, 0.08);
        }

        .footer-bottom-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          color: var(--color-muted);
        }

        .social-links {
          display: flex;
          gap: 1.5rem;
        }

        .social-link {
          transition: var(--transition-fast);
        }

        .social-link:hover {
          color: var(--color-primary);
        }

        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2.5rem;
          }
        }

        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .footer-bottom-flex {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
