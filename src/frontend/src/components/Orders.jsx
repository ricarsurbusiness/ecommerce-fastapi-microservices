import React, { useState, useEffect, useCallback } from "react";
import {
  getUserOrders,
  getOrderDetails,
  cancelOrder,
  ORDER_STATUS_LABELS,
  getOrderStatusColor,
} from "../services/orderService";
import "./Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [cancelling, setCancelling] = useState({});

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getUserOrders(
        currentPage,
        10,
        statusFilter || null,
      );

      setOrders(response.orders);
      setTotalPages(response.total_pages);
    } catch (err) {
      console.error("Error loading orders:", err);
      if (err.message.includes("Token de autenticación inválido")) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        setError("Error al cargar los pedidos");
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleOrderClick = async (orderId) => {
    try {
      setLoadingDetails(true);
      const orderDetails = await getOrderDetails(orderId);
      setSelectedOrder(orderDetails);
    } catch (err) {
      console.error("Error loading order details:", err);
      alert("Error al cargar detalles del pedido");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar este pedido?")) {
      return;
    }

    try {
      setCancelling((prev) => ({ ...prev, [orderId]: true }));
      await cancelOrder(orderId);
      alert("Pedido cancelado exitosamente");

      // Refresh orders list
      await loadOrders();

      // Update selected order if it's the one being cancelled
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = await getOrderDetails(orderId);
        setSelectedOrder(updatedOrder);
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert(`Error al cancelar el pedido: ${err.message}`);
    } finally {
      setCancelling((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canCancelOrder = (status) => {
    return status === "pending" || status === "confirmed";
  };

  if (loading && currentPage === 1) {
    return (
      <div className="orders-container">
        <div className="loading">Cargando pedidos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <div className="error">
          {error}
          <button onClick={loadOrders} className="retry-btn">
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>Mis Pedidos</h2>
        <div className="orders-filters">
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="status-filter"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="processing">En Proceso</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="orders-content">
        <div className="orders-list">
          {orders.length === 0 ? (
            <div className="no-orders">
              <div className="no-orders-icon">📦</div>
              <h3>No tienes pedidos</h3>
              <p>Cuando hagas tu primer pedido aparecerá aquí</p>
            </div>
          ) : (
            <>
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`order-card ${selectedOrder && selectedOrder.id === order.id ? "selected" : ""}`}
                  onClick={() => handleOrderClick(order.id)}
                >
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Pedido #{order.id}</h3>
                      <span className="order-date">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                    <div className="order-status">
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getOrderStatusColor(order.status),
                        }}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>
                  </div>

                  <div className="order-details">
                    <div className="order-summary">
                      <span className="items-count">
                        {order.items_count} productos
                      </span>
                      <span className="order-total">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>

                    {order.estimated_delivery && (
                      <div className="delivery-info">
                        <span className="delivery-label">
                          Entrega estimada:
                        </span>
                        <span className="delivery-date">
                          {new Date(
                            order.estimated_delivery,
                          ).toLocaleDateString("es-CO")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="order-actions">
                    {canCancelOrder(order.status) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelOrder(order.id);
                        }}
                        disabled={cancelling[order.id]}
                        className="cancel-btn"
                      >
                        {cancelling[order.id] ? "Cancelando..." : "Cancelar"}
                      </button>
                    )}
                    <button className="view-details-btn">Ver Detalles →</button>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    ← Anterior
                  </button>

                  <span className="pagination-info">
                    Página {currentPage} de {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Order Details Panel */}
        {selectedOrder && (
          <div className="order-details-panel">
            <div className="panel-header">
              <h3>Detalles del Pedido #{selectedOrder.id}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="close-panel-btn"
              >
                ✕
              </button>
            </div>

            {loadingDetails ? (
              <div className="panel-loading">Cargando detalles...</div>
            ) : (
              <div className="panel-content">
                <div className="order-status-section">
                  <div className="status-info">
                    <span
                      className="status-badge large"
                      style={{
                        backgroundColor: getOrderStatusColor(
                          selectedOrder.status,
                        ),
                      }}
                    >
                      {ORDER_STATUS_LABELS[selectedOrder.status]}
                    </span>
                    <span className="order-date">
                      Pedido realizado: {formatDate(selectedOrder.created_at)}
                    </span>
                  </div>
                </div>

                <div className="order-items-section">
                  <h4>Productos</h4>
                  <div className="items-list">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="order-item">
                        <div className="item-details">
                          <h5>{item.product_name}</h5>
                          {item.product_description && (
                            <p className="item-description">
                              {item.product_description}
                            </p>
                          )}
                          <div className="item-pricing">
                            <span>Cantidad: {item.quantity}</span>
                            <span>
                              Precio unitario: {formatPrice(item.unit_price)}
                            </span>
                          </div>
                        </div>
                        <div className="item-total">
                          {formatPrice(item.total_price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="shipping-section">
                  <h4>Información de Envío</h4>
                  <div className="address-info">
                    <div className="address">
                      <strong>Dirección de envío:</strong>
                      <p>{selectedOrder.shipping_address}</p>
                    </div>

                    {selectedOrder.billing_address &&
                      selectedOrder.billing_address !==
                        selectedOrder.shipping_address && (
                        <div className="address">
                          <strong>Dirección de facturación:</strong>
                          <p>{selectedOrder.billing_address}</p>
                        </div>
                      )}

                    <div className="contact-info">
                      <p>
                        <strong>Teléfono:</strong> {selectedOrder.phone}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedOrder.email}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="notes-section">
                    <h4>Notas</h4>
                    <p>{selectedOrder.notes}</p>
                  </div>
                )}

                <div className="order-total-section">
                  <div className="total-breakdown">
                    <div className="total-row">
                      <span>Subtotal:</span>
                      <span>{formatPrice(selectedOrder.total_amount)}</span>
                    </div>
                    <div className="total-row">
                      <span>Envío:</span>
                      <span>GRATIS</span>
                    </div>
                    <div className="total-row final-total">
                      <span>Total:</span>
                      <span>{formatPrice(selectedOrder.total_amount)}</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.estimated_delivery && (
                  <div className="delivery-section">
                    <h4>🚚 Información de Entrega</h4>
                    <p>
                      <strong>Entrega estimada:</strong>{" "}
                      {new Date(
                        selectedOrder.estimated_delivery,
                      ).toLocaleDateString("es-CO", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {selectedOrder.delivered_at && (
                      <p>
                        <strong>Entregado:</strong>{" "}
                        {formatDate(selectedOrder.delivered_at)}
                      </p>
                    )}
                  </div>
                )}

                {canCancelOrder(selectedOrder.status) && (
                  <div className="panel-actions">
                    <button
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      disabled={cancelling[selectedOrder.id]}
                      className="cancel-order-btn"
                    >
                      {cancelling[selectedOrder.id]
                        ? "Cancelando..."
                        : "Cancelar Pedido"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
