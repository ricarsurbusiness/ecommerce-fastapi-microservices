import React from "react";
import "./Navigation.css";

const Navigation = ({ currentView, setCurrentView, cartItemsCount = 0 }) => {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h1>🛍️ E-Commerce</h1>
        </div>

        <div className="nav-links">
          <button
            className={`nav-btn ${currentView === "products" ? "active" : ""}`}
            onClick={() => setCurrentView("products")}
          >
            📦 Productos
          </button>

          <button
            className={`nav-btn cart-btn ${currentView === "cart" ? "active" : ""}`}
            onClick={() => setCurrentView("cart")}
          >
            🛒 Carrito
            {cartItemsCount > 0 && (
              <span className="cart-badge">{cartItemsCount}</span>
            )}
          </button>

          <button
            className={`nav-btn ${currentView === "orders" ? "active" : ""}`}
            onClick={() => setCurrentView("orders")}
          >
            📋 Mis Pedidos
          </button>
        </div>

        <div className="nav-user">
          <span className="user-welcome">👤 Bienvenido</span>
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
