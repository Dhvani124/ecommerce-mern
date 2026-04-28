import { createContext, useContext, useState } from "react";
import { api } from "../lib/api.js";
import { clearStoredSession, getStoredSession, saveStoredSession } from "../lib/session.js";

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [session, setSession] = useState(getStoredSession);

  const persistSession = (data) => {
    const nextSession = { token: data.token, user: data.user };
    saveStoredSession(nextSession);
    setSession(nextSession);
    return nextSession;
  };

  const login = async (credentials) => {
    const data = await api.post("/auth/login", credentials);
    persistSession(data);
    return data;
  };

  const register = async (payload) => {
    const data = await api.post("/auth/register", payload);
    persistSession(data);
    return data;
  };

  const logout = () => {
    clearStoredSession();
    setSession({ token: "", user: null });
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        token: session.token,
        user: session.user,
        isAuthenticated: Boolean(session.token),
        login,
        register,
        logout
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export const useCustomerAuth = () => useContext(CustomerAuthContext);
