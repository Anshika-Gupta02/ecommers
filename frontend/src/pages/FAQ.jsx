import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Truck, RefreshCw, Activity, HelpCircle } from 'lucide-react';

export default function FAQ({ setPage }) {
  const [activeTab, setActiveTab] = useState('shipping');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleAccordion = (idx) => {
    if (expandedIndex === idx) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(idx);
    }
  };

  const faqData = {
    shipping: {
      icon: <Truck size={18} />,
      title: 'Shipping & Delivery',
      questions: [
        {
          q: 'Do you offer worldwide express shipping?',
          a: 'Yes, we ship globally to all countries. All international shipments are handled via DHL Express or FedEx to ensure safe, traceable, and fast delivery.'
        },
        {
          q: 'How much does shipping cost?',
          a: 'Standard worldwide shipping is a flat rate of $15.00. However, we offer free worldwide express shipping on all orders over $300.00.'
        },
        {
          q: 'What is the average delivery timeframe?',
          a: 'For domestic orders (India), delivery takes 3-5 business days. For international orders, express shipping takes 4-7 business days, depending on customs clearances.'
        },
        {
          q: 'Are custom duties and taxes included?',
          a: 'For orders outside India, customs duties and taxes are determined by the destination country and are the responsibility of the customer at the time of delivery.'
        }
      ]
    },
    returns: {
      icon: <RefreshCw size={18} />,
      title: 'Returns & Exchanges',
      questions: [
        {
          q: 'What is your return policy?',
          a: 'We accept returns of unwashed, unused items in their original packaging within 30 days of delivery. Due to the artisanal and custom nature of our linens, items must be in perfect condition.'
        },
        {
          q: 'How do I start a return or exchange?',
          a: 'Please email support@anshikastore.com with your Order ID. Our customer support team will generate a return authorization code and provide return address instructions.'
        },
        {
          q: 'Who pays for return shipping?',
          a: 'Return shipping costs are the responsibility of the customer unless the item delivered is incorrect or damaged upon arrival.'
        },
        {
          q: 'When will I receive my refund?',
          a: 'Once your return is inspected at our fulfillment center, we process refunds to your original payment method within 5-7 business days.'
        }
      ]
    },
    care: {
      icon: <Activity size={18} />,
      title: 'Linen Care Guide',
      questions: [
        {
          q: 'How should I wash French flax linen bedsheets?',
          a: 'Wash French linen in cold or warm water on a gentle cycle. Use mild liquid detergents and avoid chlorine bleach or fabric softeners, as they weaken the organic fibers.'
        },
        {
          q: 'Can I tumble dry my organic cotton sheets?',
          a: 'Yes, sateen and percale organic cotton sheets can be tumble dried on a low heat setting. Remove them immediately when dry to reduce creasing.'
        },
        {
          q: 'How do I remove wrinkles without harsh chemicals?',
          a: 'Linen has a natural, relaxed draped texture. If you prefer a crisp look, iron the sheets while they are still slightly damp using the cotton/linen steam setting.'
        },
        {
          q: 'How do I prevent color fading on custom prints?',
          a: 'Always wash custom illustrated botanical designs inside out in cold water. Line drying in the shade is highly recommended to protect the eco-friendly dyes from sun bleaching.'
        }
      ]
    },
    general: {
      icon: <HelpCircle size={18} />,
      title: 'General Questions',
      questions: [
        {
          q: 'Can I order custom sizes for extra-deep mattresses?',
          a: 'Yes! We offer bespoke sizing for mattresses exceeding 16 inches in depth, as well as European and non-standard pillowcases. Please contact us via our Contact Page to place a custom inquiry.'
        },
        {
          q: 'Are the items pre-shrunk?',
          a: 'Our French flax linen collections are pre-washed and pre-shrunk for ultimate softness. Our Egyptian cotton sheets might experience a minimal 2-3% shrinkage on the first hot wash.'
        },
        {
          q: 'Do you collaborate with designers or hotels?',
          a: 'We partner with premium luxury boutique hotels and interior designers globally, offering wholesale catalog lists. Please email press@anshikastore.com for B2B collaboration decks.'
        }
      ]
    }
  };

  const currentCategory = faqData[activeTab];

  return (
    <div className="faq-page container animate-fade">
      {/* Header */}
      <header className="faq-header text-center">
        <span className="section-subtitle">Help Center</span>
        <h1 className="faq-title">Customer Care & FAQ</h1>
        <div className="botanical-divider">
          <span className="botanical-line"></span>
          <span className="botanical-line"></span>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="faq-layout">
        {/* Left Side: Tabs */}
        <aside className="faq-tabs-sidebar">
          {Object.keys(faqData).map((key) => (
            <button
              key={key}
              className={`faq-tab-btn ${activeTab === key ? 'active' : ''}`}
              onClick={() => { setActiveTab(key); setExpandedIndex(null); }}
            >
              {faqData[key].icon}
              <span>{faqData[key].title}</span>
            </button>
          ))}
        </aside>

        {/* Right Side: Accordion Items */}
        <main className="faq-content-main">
          <h2 className="content-category-title">{currentCategory.title}</h2>
          
          <div className="accordion-list">
            {currentCategory.questions.map((item, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div 
                  className={`accordion-item ${isExpanded ? 'expanded' : ''}`} 
                  key={idx}
                >
                  <button 
                    className="accordion-header-btn" 
                    onClick={() => toggleAccordion(idx)}
                  >
                    <span>{item.q}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {isExpanded && (
                    <div className="accordion-body animate-fade-only">
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <style>{`
        .faq-page {
          padding-top: 130px;
          padding-bottom: 7rem;
        }

        .faq-header {
          margin-bottom: 4rem;
        }

        .faq-title {
          font-family: var(--font-serif);
          font-size: 2.8rem;
          color: var(--color-primary);
          margin-top: 0.5rem;
          letter-spacing: 0.05em;
        }

        .faq-layout {
          display: grid;
          grid-template-columns: 1fr 2.5fr;
          gap: 4rem;
          max-width: 1100px;
          margin: 0 auto;
        }

        .faq-tabs-sidebar {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .faq-tab-btn {
          width: 100%;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          background: transparent;
          border: 1px solid var(--color-border);
          color: var(--color-primary);
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          text-align: left;
          border-radius: 2px;
          transition: all 0.2s ease;
        }

        .faq-tab-btn:hover {
          background-color: var(--color-bg-alt);
          border-color: var(--color-accent);
        }

        .faq-tab-btn.active {
          background-color: var(--color-primary);
          color: #FCFBF7;
          border-color: var(--color-primary);
        }

        .faq-tab-btn.active svg {
          color: var(--color-accent);
        }

        .faq-tab-btn svg {
          transition: color 0.2s ease;
        }

        .faq-content-main {
          padding-left: 1rem;
        }

        .content-category-title {
          font-family: var(--font-serif);
          font-size: 1.85rem;
          color: var(--color-primary);
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 0.8rem;
        }

        .accordion-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .accordion-item {
          border: 1px solid var(--color-border);
          background-color: var(--color-bg-alt);
          border-radius: 2px;
          overflow: hidden;
          transition: border-color 0.2s ease;
        }

        .accordion-item.expanded {
          border-color: var(--color-accent);
          background-color: var(--color-bg);
        }

        .accordion-header-btn {
          width: 100%;
          padding: 1.2rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: transparent;
          border: none;
          color: var(--color-primary);
          font-family: inherit;
          font-size: 0.98rem;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          outline: none;
          gap: 1.5rem;
        }

        .accordion-body {
          padding: 0 1.5rem 1.5rem;
          color: var(--color-text-light);
          line-height: 1.65;
          font-size: 0.92rem;
        }

        @media (max-width: 768px) {
          .faq-layout {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .faq-content-main {
            padding-left: 0;
          }
        }
      `}</style>
    </div>
  );
}
