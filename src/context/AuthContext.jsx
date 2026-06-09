import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// In production (Vercel), VITE_API_URL points to the deployed backend on Render.
// Locally, it's empty — the Vite proxy forwards /api/* to localhost:5000.
const API_BASE = import.meta.env.VITE_API_URL || '';

const AuthContext = createContext(null);

const TOKEN_KEY = 'begin_access_token';
const REFRESH_KEY = 'begin_refresh_token';
const USER_KEY = 'begin_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  // Persist tokens to localStorage whenever they change
  useEffect(() => {
    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
    else localStorage.removeItem(TOKEN_KEY);
  }, [accessToken]);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  // On mount: verify the stored token is still valid
  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) { setLoading(false); return; }

      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setAccessToken(token);
        } else {
          // Token is invalid/expired — try to refresh
          await attemptRefresh();
        }
      } catch {
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, []);

  const attemptRefresh = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) { setUser(null); setAccessToken(null); return; }

    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (res.ok) {
        const data = await res.json();
        setAccessToken(data.accessToken);
        localStorage.setItem(TOKEN_KEY, data.accessToken);
        localStorage.setItem(REFRESH_KEY, data.refreshToken);
      } else {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem(REFRESH_KEY);
      }
    } catch {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  const register = async ({ name, email, password }) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed.');

    setUser(data.user);
    setAccessToken(data.accessToken);
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
    return data.user;
  };

  const login = async ({ email, password }) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed.');

    setUser(data.user);
    setAccessToken(data.accessToken);
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  };

  /**
   * Helper for making authenticated API requests.
   * Prepends API_BASE so it works in both local dev and production.
   */
  const authFetch = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    // Auto-refresh if access token expired
    if (res.status === 401) {
      await attemptRefresh();
      const newToken = localStorage.getItem(TOKEN_KEY);
      return fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    }

    return res;
  }, [attemptRefresh]);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
