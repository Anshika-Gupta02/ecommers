import React, { useState } from 'react';
import { API_URL } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { Mail, Phone, MapPin, CheckCircle, Send } from 'lucide-react';

export default function Contact({ setPage }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });
      const data = await res.json();
      if (!res.ok) {
        Swal.fire({
          title: 'Submission Failed',
          text: data.message || 'Error submitting inquiry.',
          icon: 'error',
          confirmButtonColor: '#3D4A3E'
        });
      } else {
        setSubmitted(true);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        Swal.fire({
          title: 'Message Sent!',
          text: 'Thank you. Your message has been submitted successfully.',
          icon: 'success',
          confirmButtonColor: '#3D4A3E'
        });
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      Swal.fire({
        title: 'Network Error',
        text: 'Network error submitting inquiry. Please try again.',
        icon: 'error',
        confirmButtonColor: '#3D4A3E'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page container animate-fade">
      {/* Header */}
      <header className="contact-header text-center">
        <span className="section-subtitle">Customer Care</span>
        <h1 className="contact-title">Contact Us</h1>
        <div className="botanical-divider">
          <span className="botanical-line"></span>
          <span className="botanical-line"></span>
        </div>
      </header>

      <div className="contact-grid">
        {/* Contact info list side */}
        <div className="contact-info-col">
          <h2 className="col-heading">Get In Touch</h2>
          <p className="col-description">
            We are always here to assist with product inquiries, order assistance, custom bedsheet dimensions, or wholesale partnerships.
          </p>

          <ul className="info-list">
            <li>
              <Mail className="info-icon" size={20} />
              <div>
                <h5>Email Us</h5>
                <p><a href="mailto:support@anshikastore.com">support@anshikastore.com</a></p>
                <p className="sub-text">We respond within 24 business hours.</p>
              </div>
            </li>
            <li>
              <Phone className="info-icon" size={20} />
              <div>
                <h5>Call Support</h5>
                <p><a href="tel:+919876543210">+91 98765 43210</a></p>
                <p className="sub-text">Mon - Sat: 9:00 AM - 6:00 PM IST</p>
              </div>
            </li>
            <li>
              <MapPin className="info-icon" size={20} />
              <div>
                <h5>Showrooms & Corporate</h5>
                <p><strong>Anshika's Store HQ:</strong></p>
                <p>12, Botanical Enclave, Sector-4</p>
                <p>New Delhi, 110001, India</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Contact Form side */}
        <div className="contact-form-col">
          {submitted ? (
            <div className="form-success-box text-center animate-fade">
              <CheckCircle size={50} className="success-icon" />
              <h3>Inquiry Sent</h3>
              <p>Thank you for reaching out. A customer support specialist will review your message and email you shortly.</p>
              <button className="btn-secondary" onClick={() => setSubmitted(false)}>Send Another Message</button>
            </div>
          ) : (
            <div className="form-card">
              <h3 className="card-title">Send a Message</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Jane Doe" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="jane@example.com" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)} 
                    placeholder="e.g. Sizing details, custom sheets" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea 
                    className="form-input textarea" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    placeholder="How can we help you?" 
                    rows="5"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary form-submit-btn" disabled={loading}>
                  {loading ? 'Sending Inquiry...' : (
                    <>
                      Send Message <Send size={14} style={{ marginLeft: '0.5rem' }} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .contact-page {
          padding-top: 130px;
          padding-bottom: 7rem;
        }

        .contact-header {
          margin-bottom: 3.5rem;
        }

        .contact-title {
          font-family: var(--font-serif);
          font-size: 2.8rem;
          color: var(--color-primary);
          margin-top: 0.5rem;
          letter-spacing: 0.05em;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 5rem;
          max-width: 1100px;
          margin: 0 auto;
        }

        .contact-info-col {
          padding-right: 1rem;
        }

        .col-heading {
          font-family: var(--font-serif);
          font-size: 1.8rem;
          color: var(--color-primary);
          margin-bottom: 1rem;
        }

        .col-description {
          color: var(--color-text-light);
          line-height: 1.6;
          font-size: 0.95rem;
          margin-bottom: 2.5rem;
        }

        .info-list {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 2.2rem;
        }

        .info-list li {
          display: flex;
          gap: 1.2rem;
          align-items: flex-start;
        }

        .info-icon {
          color: var(--color-accent);
          margin-top: 0.2rem;
          flex-shrink: 0;
        }

        .info-list h5 {
          font-family: var(--font-serif);
          font-size: 1.05rem;
          color: var(--color-primary);
          margin-bottom: 0.3rem;
        }

        .info-list p {
          color: var(--color-text-light);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .info-list p a {
          color: inherit;
          text-decoration: underline;
          transition: color 0.2s ease;
        }

        .info-list p a:hover {
          color: var(--color-accent);
        }

        .info-list .sub-text {
          font-size: 0.8rem;
          opacity: 0.75;
          margin-top: 0.1rem;
        }

        .form-card {
          background-color: var(--color-bg-alt);
          border: 1px solid var(--color-border);
          padding: 2.5rem;
          border-radius: 4px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }

        .card-title {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          color: var(--color-primary);
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 0.8rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-label {
          display: block;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--color-primary);
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid var(--color-border);
          background-color: var(--color-bg);
          font-size: 0.9rem;
          color: var(--color-primary);
          border-radius: 2px;
          outline: none;
          transition: border-color 0.2s ease;
          font-family: inherit;
        }

        .form-input:focus {
          border-color: var(--color-accent);
        }

        .form-input.textarea {
          resize: vertical;
        }

        .form-submit-btn {
          width: 100%;
          padding: 0.9rem;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 1.5rem;
        }

        .form-success-box {
          background-color: var(--color-bg-alt);
          border: 1px solid var(--color-border);
          padding: 4rem 2rem;
          border-radius: 4px;
        }

        .form-success-box .success-icon {
          color: var(--color-accent);
          margin-bottom: 1.5rem;
        }

        .form-success-box h3 {
          font-family: var(--font-serif);
          font-size: 1.6rem;
          color: var(--color-primary);
          margin-bottom: 1rem;
        }

        .form-success-box p {
          color: var(--color-text-light);
          font-size: 0.95rem;
          line-height: 1.6;
          max-width: 400px;
          margin: 0 auto 2.5rem;
        }

        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 3.5rem;
          }
          .form-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
