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

// Simulate instant payment and create order
export const processInstantPayment = async () => {
  try {
    console.log("Processing instant payment...");

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Get current user info from localStorage if available
    const userEmail =
      localStorage.getItem("userEmail") || "usuario@ejemplo.com";

    // Create order with minimal default data
    const defaultCheckoutData = {
      shipping_address:
        "Dirección por defecto - Calle 123 #45-67, Bogotá, Colombia",
      billing_address:
        "Dirección por defecto - Calle 123 #45-67, Bogotá, Colombia",
      phone: "3001234567",
      email: userEmail,
      notes: "Pago rápido procesado automáticamente",
      payment_method: "instant_payment",
    };

    console.log("Sending checkout data:", defaultCheckoutData);
    console.log("Auth headers:", getAuthHeaders());

    const response = await fetch(`${BASE_URL}/checkout`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(defaultCheckoutData),
    });

    console.log("Order creation response status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Token de autenticación inválido. Por favor, inicia sesión nuevamente.",
        );
      }
      let errorMessage = "Error al procesar el pago";
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        console.error("Error parsing error response:", e);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Payment processed successfully:", result);

    return {
      success: true,
      order: result,
      message: "¡Pago procesado exitosamente!",
    };
  } catch (error) {
    console.error("Error processing instant payment:", error);
    return {
      success: false,
      error: error.message,
      message: "Error al procesar el pago",
    };
  }
};

// Payment status simulation
export const simulatePaymentStates = {
  PROCESSING: "processing",
  SUCCESS: "success",
  FAILED: "failed",
};

// Get payment status (for animation purposes)
export const getPaymentStatus = async () => {
  // Simulate payment processing steps
  const steps = [
    { status: "Verificando datos...", progress: 25 },
    { status: "Procesando pago...", progress: 50 },
    { status: "Confirmando transacción...", progress: 75 },
    { status: "Creando pedido...", progress: 90 },
    { status: "¡Pago completado!", progress: 100 },
  ];

  return steps;
};

// Format payment response for UI
export const formatPaymentResponse = (response) => {
  if (response.success) {
    return {
      title: "¡Pago Exitoso!",
      message: `Tu pedido #${response.order.order_id} ha sido creado`,
      details: {
        orderId: response.order.order_id,
        amount: response.order.total_amount,
        status: response.order.status,
        estimatedDelivery: response.order.estimated_delivery,
      },
      type: "success",
    };
  } else {
    return {
      title: "Error en el Pago",
      message: response.message || "Hubo un problema al procesar tu pago",
      details: {
        error: response.error,
      },
      type: "error",
    };
  }
};
