const BASE_URL =
  import.meta.env.VITE_CART_API || "http://localhost:8002/api/cart";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  console.log(
    "Token from localStorage:",
    token ? "Token exists" : "No token found",
  );
  console.log("Token value:", token);

  if (!token) {
    console.error("No authentication token found in localStorage");
    throw new Error(
      "No hay token de autenticación. Por favor, inicia sesión nuevamente.",
    );
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Get all cart items for the current user
export const getCartItems = async () => {
  try {
    const headers = getAuthHeaders();
    console.log("Making request to:", `${BASE_URL}/`);
    console.log("Headers:", headers);

    const response = await fetch(`${BASE_URL}/`, {
      method: "GET",
      headers: headers,
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries()),
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Token de autenticación inválido. Por favor, inicia sesión nuevamente.",
        );
      }
      throw new Error(
        `Error al obtener items del carrito: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getCartItems:", error);
    throw error;
  }
};

// Add product to cart
export const addToCart = async (productId, quantity) => {
  try {
    const headers = getAuthHeaders();
    const requestBody = {
      product_id: productId,
      quantity: quantity,
    };

    console.log("Adding to cart:", requestBody);
    console.log("Request headers:", headers);

    const response = await fetch(`${BASE_URL}/`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    console.log("Add to cart response status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Token de autenticación inválido. Por favor, inicia sesión nuevamente.",
        );
      }
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(
        `Error al agregar producto al carrito: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error en addToCart:", error);
    throw error;
  }
};

// Get cart summary with totals
export const getCartSummary = async () => {
  try {
    const headers = getAuthHeaders();
    console.log("Getting cart summary from:", `${BASE_URL}/summary`);

    const response = await fetch(`${BASE_URL}/summary`, {
      method: "GET",
      headers: headers,
    });

    console.log("Cart summary response status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Token de autenticación inválido. Por favor, inicia sesión nuevamente.",
        );
      }
      throw new Error(
        `Error al obtener resumen del carrito: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getCartSummary:", error);
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (itemId) => {
  try {
    const response = await fetch(`${BASE_URL}/${itemId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al eliminar item del carrito");
    return await response.json();
  } catch (error) {
    console.error("Error en removeFromCart:", error);
    throw error;
  }
};

// Update cart item quantity (by removing and adding again)
export const updateCartItemQuantity = async (productId, newQuantity) => {
  try {
    // Since we don't have an update endpoint, we can remove and add again
    // This is a simplified approach - in a real app you might want a proper update endpoint
    const response = await fetch(`${BASE_URL}/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        product_id: productId,
        quantity: newQuantity,
      }),
    });
    if (!response.ok) throw new Error("Error al actualizar cantidad");
    return await response.json();
  } catch (error) {
    console.error("Error en updateCartItemQuantity:", error);
    throw error;
  }
};
