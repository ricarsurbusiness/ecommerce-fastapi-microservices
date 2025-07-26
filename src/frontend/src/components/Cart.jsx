import React, { useState, useEffect } from "react";
import {
  getCartItems,
  getCartSummary,
  removeFromCart,
} from "../services/cartService";
import InstantPayment from "./InstantPayment";
import "./Cart.css";

const Cart = ({ onCartUpdate, onGoToOrders }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingItems, setRemovingItems] = useState({});
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    loadCartData();
  }, []);

  const loadCartData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [items, summary] = await Promise.all([
        getCartItems(),
        getCartSummary(),
      ]);
      setCartItems(items);
      setCartSummary(summary);
    } catch (err) {
      setError("Error al cargar el carrito");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar este producto del carrito?",
      )
    ) {
      return;
    }

    try {
      setRemovingItems((prev) => ({ ...prev, [itemId]: true }));
      await removeFromCart(itemId);
      // Reload cart data after successful removal
      await loadCartData();
      // Update cart count in parent component
      if (onCartUpdate) {
        onCartUpdate();
      }
      alert("Producto eliminado del carrito exitosamente");
    } catch (err) {
      alert("Error al eliminar producto del carrito");
      console.error(err);
    } finally {
      setRemovingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading">Cargando carrito...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-container">
        <div className="error">{error}</div>
        <button onClick={loadCartData} className="retry-btn">
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Tu carrito está vacío</h2>
          <p>Agrega algunos productos para comenzar</p>
          <button
            onClick={() => (window.location.href = "/products")}
            className="continue-shopping-btn"
          >
            Continuar Comprando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Mi Carrito</h2>
        <button onClick={loadCartData} className="refresh-btn">
          🔄 Actualizar
        </button>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="item-info">
                <div className="item-details">
                  <h3>Producto ID: {item.product_id}</h3>
                  <div className="item-meta">
                    <span className="quantity">Cantidad: {item.quantity}</span>
                    <span className="unit-price">
                      Precio unitario: {formatPrice(item.unit_price)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="item-actions">
                <div className="item-total">
                  <span className="total-label">Total:</span>
                  <span className="total-price">
                    {formatPrice(item.total_price)}
                  </span>
                </div>

                <button
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={removingItems[item.id]}
                  className="remove-btn"
                >
                  {removingItems[item.id] ? "Eliminando..." : "🗑️ Eliminar"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {cartSummary && (
          <div className="cart-summary">
            <h3>Resumen del Carrito</h3>

            <div className="summary-details">
              <div className="summary-row">
                <span>Productos diferentes:</span>
                <span>{cartSummary.items_count}</span>
              </div>

              <div className="summary-row">
                <span>Total de artículos:</span>
                <span>{cartSummary.total_items}</span>
              </div>

              <div className="summary-row total-row">
                <span>Total a pagar:</span>
                <span className="total-amount">
                  {formatPrice(cartSummary.total_amount)}
                </span>
              </div>
            </div>

            <div className="cart-actions">
              <button
                className="continue-shopping-btn"
                onClick={() => (window.location.href = "/products")}
              >
                Continuar Comprando
              </button>

              <button
                className="checkout-btn"
                onClick={() => setShowPayment(true)}
              >
                💳 Pagar Ahora
              </button>
            </div>
          </div>
        )}
      </div>

      {showPayment && (
        <InstantPayment
          cartSummary={cartSummary}
          onPaymentComplete={handlePaymentComplete}
          onCancel={handleCancelPayment}
        />
      )}
    </div>
  );

  function handlePaymentComplete(orderResult) {
    setShowPayment(false);

    // Show success message
    alert(`¡Pago exitoso! Tu pedido #${orderResult.order_id} ha sido creado.`);

    // Update cart count
    if (onCartUpdate) {
      onCartUpdate();
    }

    // Navigate to orders if function is provided
    if (onGoToOrders) {
      onGoToOrders();
    }
  }

  function handleCancelPayment() {
    setShowPayment(false);
  }
};

export default Cart;
