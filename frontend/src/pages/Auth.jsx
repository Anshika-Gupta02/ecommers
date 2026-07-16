import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';

export default function Auth({ setPage }) {
  const { login, register, googleLogin } = useAuth();
  
  // Toggle states
  const [isLoginView, setIsLoginView] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [googleClientId, setGoogleClientId] = useState('');

  // Fetch dynamic Auth configs
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch(`${API_URL}/auth/config`);
        if (res.ok) {
          const data = await res.json();
          setGoogleClientId(data.googleClientId);
        }
      } catch (err) {
        console.error('Failed to load auth config:', err);
      }
    }
    loadConfig();
  }, []);

  useEffect(() => {
    /* global google */
    if (typeof google !== 'undefined' && googleClientId) {
      try {
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse
        });
        
        google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", text: isLoginView ? "signin_with" : "signup_with", width: 384 }
        );
      } catch (err) {
        console.warn("Google Client Initialization failed:", err);
      }
    }
  }, [isLoginView, googleClientId]);

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    setErrorMessage('');
    try {
      await googleLogin(response.credential);
      setPage('catalog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleDemoLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      await googleLogin("MOCK_GOOGLE_TOKEN_ANSHIKA_STORE");
      setPage('catalog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage(err.message || 'Demo Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

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

          <div className="auth-divider" style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: 'var(--color-muted)', fontSize: '0.8rem' }}>
            <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></span>
            <span style={{ padding: '0 0.8rem' }}>OR</span>
            <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center', width: '100%' }}>
            {/* The Google Sign-In Button Container */}
            <div id="google-signin-btn" style={{ width: '100%', minHeight: '40px', display: 'flex', justifyContent: 'center' }}></div>
            
            {/* Mock/Demo Login button as fallback */}
            <button 
              type="button" 
              onClick={handleGoogleDemoLogin} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.6rem', 
                width: '100%', 
                padding: '0.7rem', 
                border: '1.5px solid var(--color-border)', 
                backgroundColor: '#fff', 
                color: 'var(--color-primary)', 
                fontWeight: 600, 
                fontSize: '0.82rem', 
                cursor: 'pointer', 
                transition: 'background-color 0.2s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-alt)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Google Quick Login
            </button>
          </div>
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
