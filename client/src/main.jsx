import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AdminAuthProvider } from "./admin/context/AdminAuthContext.jsx";
import App from "./App.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { CustomerAuthProvider } from "./context/CustomerAuthContext.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <CustomerAuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </CustomerAuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
