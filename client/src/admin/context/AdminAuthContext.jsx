import { createContext, useContext, useState } from "react";
import { api } from "../../lib/api.js";

const AdminAuthContext = createContext(null);
const storageKey = "admin-session";

const getStoredSession = () => {
  const raw = localStorage.getItem(storageKey);
  return raw ? JSON.parse(raw) : { token: "", user: null };
};

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(getStoredSession);

  const login = async (credentials) => {
    const data = await api.post("/auth/admin/login", credentials);
    const nextSession = { token: data.token, user: data.user };
    localStorage.setItem(storageKey, JSON.stringify(nextSession));
    setSession(nextSession);
    return data;
  };

  const logout = () => {
    localStorage.removeItem(storageKey);
    setSession({ token: "", user: null });
  };

  return (
    <AdminAuthContext.Provider
      value={{
        token: session.token,
        user: session.user,
        isAuthenticated: Boolean(session.token),
        login,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
