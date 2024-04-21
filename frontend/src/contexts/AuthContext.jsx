import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/auth';

const AuthContext = createContext(null);

// Extract profile/company from the /me response
function parseUserData(data) {
  const user = { id: data.id, email: data.email, role: data.role };
  const profile = data.role === 'seeker' ? data.profile : data.company;
  return { user, profile };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then(r => {
          const { user, profile } = parseUserData(r.data);
          setUser(user);
          setProfile(profile);
        })
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = async (token, partialUser) => {
    localStorage.setItem('token', token);
    // Fetch full user data (includes profile/company) from /me
    try {
      const r = await getMe();
      const { user, profile } = parseUserData(r.data);
      setUser(user);
      setProfile(profile);
    } catch {
      // Fallback: use what we have from signup/login response
      setUser(partialUser);
      setProfile(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const r = await getMe();
      const { user, profile } = parseUserData(r.data);
      setUser(user);
      setProfile(profile);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginUser, logout, setProfile, refreshProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
