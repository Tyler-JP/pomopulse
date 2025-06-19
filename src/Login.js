import React, { useState, useEffect } from 'react';
import './Login.css';

function Login({ onLogin, onRegister, isRegistering, setIsRegistering, error: externalError }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Update local error when external error changes
  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    if (isRegistering) {
      onRegister(username, password);
    } else {
      onLogin(username, password);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-container">
        <h2 className="login-title">
          {isRegistering ? 'Create Account' : 'Login'}
        </h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete={isRegistering ? "new-password" : "current-password"}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button">
            {isRegistering ? 'Create Account' : 'Login'}
          </button>
        </form>
        <div className="login-switch">
          {isRegistering ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="switch-button"
                onClick={() => setIsRegistering(false)}
              >
                Login here
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                className="switch-button"
                onClick={() => setIsRegistering(true)}
              >
                Register here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
