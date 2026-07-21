import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';

export default function Auth({ setPage }) {
  const { login, register } = useAuth();
  
  // Toggle states
  const [isLoginView, setIsLoginView] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password || (!isLoginView && !name)) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    try {
      if (isLoginView) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      // Successful auth -> Redirect to Catalog
      setPage('catalog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setErrorMessage('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="auth-page container animate-fade">
      <div className="auth-card">
        {/* Switch Header */}
        <div className="auth-header text-center">
          <h2 className="auth-title">{isLoginView ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="auth-subtitle">
            {isLoginView 
              ? 'Sign in to access your orders and secure checkout' 
              : 'Join us to experience hand-crafted botanical luxury'}
          </p>
        </div>

        {errorMessage && (
          <div className="auth-error-banner animate-fade-only">
            <ShieldAlert size={16} /> <span>{errorMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLoginView && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input" 
                placeholder="Jane Doe"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input" 
              placeholder="jane@example.com"
              required
            />
          </div>

          <div className="form-group password-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input password-input" 
                placeholder="••••••••"
                required
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Register')}
          </button>
        </form>

        <div className="auth-footer text-center">
          <button className="toggle-view-link" onClick={toggleView}>
            {isLoginView 
              ? "Don't have an account? Create one here" 
              : 'Already have an account? Sign in here'}
          </button>
        </div>
      </div>

      <style>{`
        .auth-page {
          padding-top: 150px;
          padding-bottom: 7rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-card {
          width: 100%;
          max-width: 480px;
          background-color: var(--color-white);
          border: 1px solid var(--color-border);
          padding: 3rem;
          box-shadow: var(--shadow-medium);
        }

        .auth-title {
          font-size: 2.2rem;
          margin-bottom: 0.5rem;
        }

        .auth-subtitle {
          font-size: 0.85rem;
          color: var(--color-muted);
          line-height: 1.5;
          margin-bottom: 2rem;
        }

        .auth-error-banner {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background-color: rgba(176, 90, 84, 0.08);
          color: var(--color-error);
          padding: 0.8rem 1.2rem;
          border-left: 3px solid var(--color-error);
          margin-bottom: 1.5rem;
          font-size: 0.88rem;
        }

        .auth-form {
          margin-bottom: 2rem;
        }

        .password-group {
          position: relative;
        }

        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-input {
          padding-right: 2.8rem;
        }

        .password-toggle-btn {
          position: absolute;
          right: 12px;
          color: var(--color-muted);
        }

        .auth-submit-btn {
          width: 100%;
          margin-top: 1rem;
        }

        .toggle-view-link {
          font-size: 0.88rem;
          color: var(--color-primary);
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 2px;
        }

        .toggle-view-link:hover {
          color: var(--color-accent-hover);
          border-bottom-color: var(--color-accent-hover);
        }

        @media (max-width: 600px) {
          .auth-card {
            padding: 2rem 1.5rem;
            border: none;
            box-shadow: none;
            background: transparent;
          }
        }
      `}</style>
    </div>
  );
}
