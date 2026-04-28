import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { useCustomerAuth } from "./CustomerAuthContext.jsx";

const emptyCart = { items: [] };
const emptyTotals = { subtotal: 0, tax: 0, shippingFee: 0, total: 0 };
const CartContext = createContext(null);

const withToken = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
});

export function CartProvider({ children }) {
  const { token, isAuthenticated } = useCustomerAuth();
  const [cart, setCart] = useState(emptyCart);
  const [totals, setTotals] = useState(emptyTotals);
  const [isLoading, setIsLoading] = useState(false);

  const applyCartResponse = (data) => {
    setCart(data.cart || emptyCart);
    setTotals(data.totals || emptyTotals);
    return data;
  };

  const loadCart = async () => {
    if (!token) {
      setCart(emptyCart);
      setTotals(emptyTotals);
      return null;
    }

    setIsLoading(true);
    try {
      const data = await api.get("/cart", withToken(token));
      return applyCartResponse(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadCart();
    else {
      setCart(emptyCart);
      setTotals(emptyTotals);
    }
  }, [token]);

  const ensureAuth = () => {
    if (!token) throw new Error("Please login first to use your cart.");
  };

  const addItem = async (productId, quantity = 1) => {
    ensureAuth();
    const data = await api.post("/cart", { productId, quantity }, withToken(token));
    return applyCartResponse(data);
  };

  const updateItem = async (productId, quantity) => {
    ensureAuth();
    const data = await api.patch(`/cart/${productId}`, { quantity }, withToken(token));
    return applyCartResponse(data);
  };

  const removeItem = async (productId) => {
    ensureAuth();
    const data = await api.delete(`/cart/${productId}`, withToken(token));
    return applyCartResponse(data);
  };

  const clearCart = async () => {
    ensureAuth();
    const data = await api.delete("/cart/clear/all", withToken(token));
    return applyCartResponse(data);
  };

  const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        totals,
        itemCount,
        isLoading,
        isAuthenticated,
        loadCart,
        addItem,
        updateItem,
        removeItem,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
