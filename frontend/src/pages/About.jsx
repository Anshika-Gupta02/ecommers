import React from 'react';
import { Heart, Compass, ShieldCheck } from 'lucide-react';

export default function About({ setPage }) {
  return (
    <div className="about-page container animate-fade">
      {/* Page Header */}
      <header className="about-header text-center">
        <span className="section-subtitle">Our World</span>
        <h1 className="about-title">Artisanship & Care</h1>
        <div className="botanical-divider">
          <span className="botanical-line"></span>
          <span className="botanical-line"></span>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="about-hero">
        <div className="about-hero-img-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=1200" 
          alt="Linen textures" 
          className="about-hero-img" 
        />
        <div className="about-hero-content text-center">
          <h2>Woven for Rest, Designed for Comfort</h2>
          <p>
            Anshika's Store is built on the belief that home should be a sanctuary of organic beauty, rich craftsmanship, and peaceful comfort.
          </p>
        </div>
      </section>

      {/* Editorial Content sections */}
      <section className="about-story-grid">
        {/* Story Section 1 */}
        <div className="story-row">
          <div className="story-img-col">
            <img 
              src="https://images.unsplash.com/photo-1590736969955-71cb94801750?auto=format&fit=crop&q=80&w=600" 
              alt="Artisan weaving looms" 
            />
          </div>
          <div className="story-text-col flex-center-column">
            <span className="row-subtitle">Traditional Handcraft</span>
            <h3 className="row-title">Collaborating with Master Weavers</h3>
            <p>
              We work hand-in-hand with traditional artisan communities in rural India and Central Asia. By preserving centuries-old handloom techniques and delicate hand-embroidery methods, we build bedsheets, throws, and pillowcases that carry a unique soul.
            </p>
            <p>
              Every artisan receives fair-trade wages, a secure workplace, and educational support, enabling local communities to flourish through their heritage craftsmanship.
            </p>
          </div>
        </div>

        {/* Story Section 2 */}
        <div className="story-row reverse">
          <div className="story-img-col">
            <img 
              src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=600" 
              alt="Linen bedding setup" 
            />
          </div>
          <div className="story-text-col flex-center-column">
            <span className="row-subtitle">Eco-conscious Sourcing</span>
            <h3 className="row-title">Pure Egyptian Cotton & Flax Linen</h3>
            <p>
              Our textiles are sourced with complete transparency. We select premium organic long-staple Egyptian cotton for its crisp sateen softness, and French flax linen for its natural thermoregulating and hypoallergenic properties.
            </p>
            <p>
              No toxic chemical finishes, heavy synthetic dyes, or pesticides are used in our supply chain. The botanical prints are colored using safe, eco-certified water-based dyes that stay vibrant wash after wash.
            </p>
          </div>
        </div>
      </section>

      {/* Core Philosophy Badges */}
      <section className="about-philosophy text-center">
        <span className="section-subtitle">Values</span>
        <h3 className="phi-title">Our Commitments</h3>
        
        <div className="philosophy-grid">
          <div className="phi-card">
            <Heart size={30} className="phi-card-icon" />
            <h4>Artisanal Integrity</h4>
            <p>We celebrate hand-woven textures and hand-guided embroidery, supporting slow fashion and slow home living.</p>
          </div>
          <div className="phi-card">
            <Compass size={30} className="phi-card-icon" />
            <h4>Traceable Sourcing</h4>
            <p>From French flax fields to Indian handlooms, we track and evaluate the environment and wage factors of every weaver.</p>
          </div>
          <div className="phi-card">
            <ShieldCheck size={30} className="phi-card-icon" />
            <h4>Conscious Shipping</h4>
            <p>All items are shipped in biodegradable bags, organic cotton dust envelopes, and FSC-certified recyclable boxes.</p>
          </div>
        </div>

        <button className="btn-primary shop-cta" onClick={() => setPage('catalog')}>
          Explore The Collection
        </button>
      </section>

      <style>{`
        .about-page {
          padding-top: 130px;
          padding-bottom: 7rem;
        }

        .about-header {
          margin-bottom: 3rem;
        }

        .about-title {
          font-family: var(--font-serif);
          font-size: 2.8rem;
          color: var(--color-primary);
          margin-top: 0.5rem;
          letter-spacing: 0.05em;
        }

        .about-hero {
          position: relative;
          height: 380px;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .about-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
        }

        .about-hero-img-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(44, 44, 42, 0.45);
          z-index: 2;
        }

        .about-hero-content {
          position: relative;
          z-index: 3;
          max-width: 650px;
          color: #FCFBF7;
          padding: 2rem;
        }

        .about-hero-content h2 {
          font-family: var(--font-serif);
          font-size: 2.2rem;
          margin-bottom: 1rem;
        }

        .about-hero-content p {
          font-size: 1.05rem;
          line-height: 1.6;
          opacity: 0.95;
        }

        .about-story-grid {
          display: flex;
          flex-direction: column;
          gap: 6rem;
          margin-bottom: 6rem;
        }

        .story-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .story-row.reverse {
          direction: rtl;
        }

        .story-row.reverse .story-text-col {
          direction: ltr;
        }

        .story-img-col img {
          width: 100%;
          height: 450px;
          object-fit: cover;
          border-radius: 4px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);
        }

        .story-text-col {
          padding: 1rem 2rem;
        }

        .row-subtitle {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--color-accent);
          font-weight: 600;
          margin-bottom: 0.8rem;
          display: block;
        }

        .row-title {
          font-family: var(--font-serif);
          font-size: 1.85rem;
          color: var(--color-primary);
          margin-bottom: 1.5rem;
          line-height: 1.3;
        }

        .story-text-col p {
          color: var(--color-text-light);
          line-height: 1.65;
          font-size: 0.95rem;
          margin-bottom: 1rem;
        }

        .about-philosophy {
          background-color: var(--color-bg-alt);
          padding: 5rem 2rem;
          border-radius: 4px;
          border: 1px solid var(--color-border);
        }

        .phi-title {
          font-family: var(--font-serif);
          font-size: 2.1rem;
          color: var(--color-primary);
          margin-top: 0.5rem;
          margin-bottom: 3.5rem;
        }

        .philosophy-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3rem;
          max-width: 1100px;
          margin: 0 auto 4rem;
        }

        .phi-card {
          text-align: center;
          padding: 1rem;
        }

        .phi-card-icon {
          color: var(--color-accent);
          margin-bottom: 1.2rem;
        }

        .phi-card h4 {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          color: var(--color-primary);
          margin-bottom: 0.8rem;
        }

        .phi-card p {
          color: var(--color-text-light);
          font-size: 0.88rem;
          line-height: 1.6;
        }

        .shop-cta {
          padding: 1rem 2.5rem;
        }

        @media (max-width: 768px) {
          .story-row {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .story-row.reverse {
            direction: ltr;
          }
          .story-img-col img {
            height: 300px;
          }
          .philosophy-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
