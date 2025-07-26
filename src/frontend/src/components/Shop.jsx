import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import ProductList from "./ProductList";
import Cart from "./Cart";
import Orders from "./Orders";
import Checkout from "./Checkout";
import { getCartSummary } from "../services/cartService";
import "./Shop.css";

const Shop = () => {
  const [currentView, setCurrentView] = useState("products");
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Debug token information
    const token = localStorage.getItem("token");
    console.log("=== TOKEN DEBUG INFO ===");
    console.log("Token exists:", !!token);
    console.log("Token value:", token);
    console.log("Token length:", token ? token.length : 0);
    console.log("LocalStorage keys:", Object.keys(localStorage));
    console.log("========================");

    loadCartCount();
  }, []);

  useEffect(() => {
    // Refresh cart count when view changes to cart
    if (currentView === "cart") {
      loadCartCount();
    }
  }, [currentView]);

  const loadCartCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, redirecting to login");
        window.location.href = "/login";
        return;
      }

      console.log(
        "Attempting to load cart count with token:",
        token.substring(0, 20) + "...",
      );
      const summary = await getCartSummary();
      setCartItemsCount(summary.total_items || 0);
    } catch (err) {
      console.error("Error loading cart count:", err);
      if (err.message.includes("Token de autenticación inválido")) {
        console.log("Token is invalid, clearing localStorage and redirecting");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      setCartItemsCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    // Refresh cart count when switching views
    if (view === "cart") {
      loadCartCount();
    }
  };

  const refreshCartCount = () => {
    loadCartCount();
  };

  if (loading) {
    return (
      <div className="shop-container">
        <div className="shop-loading">
          <div className="loading-spinner"></div>
          <p>Cargando tienda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-container">
      <Navigation
        currentView={currentView}
        setCurrentView={handleViewChange}
        cartItemsCount={cartItemsCount}
      />

      <main className="shop-main">
        {currentView === "products" && (
          <ProductList onCartUpdate={refreshCartCount} />
        )}

        {currentView === "cart" && (
          <Cart
            onCartUpdate={refreshCartCount}
            onGoToOrders={() => setCurrentView("orders")}
          />
        )}

        {currentView === "orders" && <Orders />}
      </main>

      <footer className="shop-footer">
        <div className="footer-content">
          <p>&copy; 2024 E-Commerce App. Todos los derechos reservados.</p>
          <div className="footer-links">
            <a href="#" onClick={(e) => e.preventDefault()}>
              Términos de Servicio
            </a>
            <a href="#" onClick={(e) => e.preventDefault()}>
              Política de Privacidad
            </a>
            <a href="#" onClick={(e) => e.preventDefault()}>
              Soporte
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Shop;
