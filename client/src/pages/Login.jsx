import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { syncWithBackend } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const provider = new GoogleAuthProvider();

  // Email Login / Register
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;

      if (isRegister) {
        result = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        result = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }

      await syncWithBackend(result.user, name);

      navigate('/dashboard');

    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(
        auth,
        provider
      );

      await syncWithBackend(
        result.user,
        result.user.displayName
      );

      navigate('/dashboard');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">

      {/* LEFT PANEL */}
      <div className="login-left">

        <div className="login-brand">
          <div className="login-brand-icon">🌾</div>

          <div>
            <h1>Agri-Smart</h1>
            <span>Smart Farming Platform</span>
          </div>
        </div>

        <h2 className="login-tagline">
          Farm smarter,<br />not <em>harder</em>
        </h2>

        <p className="login-subtitle">
          Get real-time weather updates,
          AI-powered crop disease detection,
          market prices and personalized
          farming advice — all in one place.
        </p>

        <div className="login-features">
          {[
            'Live weather forecasts',
            'AI leaf disease detection',
            'Mandi price tracker',
            'Multilingual farming advisor',
          ].map((f) => (
            <div
              className="login-feature"
              key={f}
            >
              <div className="login-feature-dot" />
              {f}
            </div>
          ))}
        </div>

      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">

        <div className="login-form-box fade-in-up">

          <h2>
            {isRegister
              ? 'Create Account'
              : 'Welcome back 👋'}
          </h2>

          <p>
            Sign in using your email
          </p>

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >

            {isRegister && (
              <div className="input-group">
                <label>Your Name</label>

                <input
                  type="text"
                  placeholder="e.g. Rajan Kumar"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label>Email Address</label>

              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
              }}
            >
              {loading
                ? 'Signing in...'
                : isRegister
                ? 'Register →'
                : 'Login →'}
            </button>

          </form>

          {/* Google Sign-In */}

          <button
            className="btn btn-outline"
            style={{
              width: '100%',
              marginTop: 12,
            }}
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            style={{ marginTop: 10 }}
            onClick={() =>
              setIsRegister(!isRegister)
            }
          >
            {isRegister
              ? '← Already have account? Login'
              : 'New user? Create account'}
          </button>

        </div>

      </div>

    </div>
  );
}