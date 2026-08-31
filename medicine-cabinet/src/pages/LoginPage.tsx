import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, resetPassword } from '../services/authService';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginUser(email, password);
      navigate('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', margin: 'auto', padding: '2rem' }}>
      <h1 className="text-center">{showReset ? 'Reset Password' : 'Login'}</h1>
      
      {resetSent ? (
        <div className="alert alert-success">
          Password reset email sent! Check your inbox.
          <button 
            className="btn btn-secondary mt-2" 
            onClick={() => { setShowReset(false); setResetSent(false); }}
          >
            Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={showReset ? handleResetPassword : handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {!showReset && (
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          {error && <div className="alert alert-danger">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Please wait...' : showReset ? 'Send Reset Email' : 'Login'}
          </button>
        </form>
      )}

      <div className="text-center mt-3">
        {!showReset && (
          <>
            <p className="text-muted">
              <button 
                type="button" 
                className="btn-link" 
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setShowReset(true)}
              >
                Forgot password?
              </button>
            </p>
            <p className="text-muted">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--color-primary)' }}>Register</Link>
            </p>
          </>
        )}
        {showReset && (
          <p className="text-muted">
            <button 
              type="button" 
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => setShowReset(false)}
            >
              Back to Login
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
