const BASE_URL =
  import.meta.env.VITE_ORDER_API || "http://localhost:8003/api/orders";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error(
      "No hay token de autenticación. Por favor, inicia sesión nuevamente.",
    );
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Create order from cart (checkout)
export const createOrderFromCart = async (checkoutData) => {
  try {
    console.log("Creating order with data:", checkoutData);

    const response = await fetch(`${BASE_URL}/checkout`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(checkoutData),
    });

    console.log("Order creation response status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Token de autenticación inválido. Por favor, inicia sesión nuevamente.",
        );
      }
      let errorMessage = "Error al crear el pedido";
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        console.error("Error parsing error response:", e);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Order created successfully:", result);
    return result;
  } catch (error) {
    console.error("Error en createOrderFromCart:", error);
    throw error;
  }
};

// Get all user orders with pagination
export const getUserOrders = async (
  page = 1,
  perPage = 10,
  statusFilter = null,
) => {
  try {
    let url = `${BASE_URL}/?page=${page}&per_page=${perPage}`;
    if (statusFilter) {
      url += `&status_filter=${statusFilter}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Token de autenticación inválido. Por favor, inicia sesión nuevamente.",
        );
      }
      throw new Error("Error al obtener pedidos");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getUserOrders:", error);
    throw error;
  }
};

// Get order details by ID
export const getOrderDetails = async (orderId) => {
  try {
    const response = await fetch(`${BASE_URL}/${orderId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Token de autenticación inválido. Por favor, inicia sesión nuevamente.",
        );
      }
      if (response.status === 404) {
        throw new Error("Pedido no encontrado");
      }
      throw new Error("Error al obtener detalles del pedido");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getOrderDetails:", error);
    throw error;
  }
};

// Cancel an order
export const cancelOrder = async (orderId) => {
  try {
    const response = await fetch(`${BASE_URL}/${orderId}/cancel`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Token de autenticación inválido. Por favor, inicia sesión nuevamente.",
        );
      }
      if (response.status === 404) {
        throw new Error("Pedido no encontrado");
      }
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "No se puede cancelar este pedido");
      }
      throw new Error("Error al cancelar el pedido");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en cancelOrder:", error);
    throw error;
  }
};

// Get orders by status
export const getOrdersByStatus = async (status) => {
  try {
    const response = await fetch(`${BASE_URL}/status/${status}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Token de autenticación inválido. Por favor, inicia sesión nuevamente.",
        );
      }
      throw new Error("Error al obtener pedidos por estado");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getOrdersByStatus:", error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, statusUpdate) => {
  try {
    const response = await fetch(`${BASE_URL}/${orderId}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(statusUpdate),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Token de autenticación inválido. Por favor, inicia sesión nuevamente.",
        );
      }
      if (response.status === 404) {
        throw new Error("Pedido no encontrado");
      }
      throw new Error("Error al actualizar estado del pedido");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en updateOrderStatus:", error);
    throw error;
  }
};

// Get order statistics
export const getOrderStatistics = async () => {
  try {
    const response = await fetch(`${BASE_URL}/summary/stats`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Token de autenticación inválido. Por favor, inicia sesión nuevamente.",
        );
      }
      throw new Error("Error al obtener estadísticas de pedidos");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getOrderStatistics:", error);
    throw error;
  }
};

// Order status constants
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

// Order status labels in Spanish
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: "Pendiente",
  [ORDER_STATUS.CONFIRMED]: "Confirmado",
  [ORDER_STATUS.PROCESSING]: "En Proceso",
  [ORDER_STATUS.SHIPPED]: "Enviado",
  [ORDER_STATUS.DELIVERED]: "Entregado",
  [ORDER_STATUS.CANCELLED]: "Cancelado",
};

// Get status color for UI
export const getOrderStatusColor = (status) => {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return "#ffc107"; // Yellow
    case ORDER_STATUS.CONFIRMED:
      return "#17a2b8"; // Blue
    case ORDER_STATUS.PROCESSING:
      return "#fd7e14"; // Orange
    case ORDER_STATUS.SHIPPED:
      return "#6610f2"; // Purple
    case ORDER_STATUS.DELIVERED:
      return "#28a745"; // Green
    case ORDER_STATUS.CANCELLED:
      return "#dc3545"; // Red
    default:
      return "#6c757d"; // Gray
  }
};
