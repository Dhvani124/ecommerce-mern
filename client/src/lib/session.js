const sessionKeys = ["shop-session", "user-session", "auth-session"];

export const shopSessionKey = "shop-session";

export const getStoredSession = () => {
  for (const key of sessionKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      if (parsed?.token) return parsed;
    } catch {
      continue;
    }
  }

  return { token: "", user: null };
};

export const saveStoredSession = (session) => {
  localStorage.setItem(shopSessionKey, JSON.stringify(session));
};

export const clearStoredSession = () => {
  localStorage.removeItem(shopSessionKey);
};
