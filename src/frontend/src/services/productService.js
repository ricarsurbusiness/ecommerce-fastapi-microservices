const BASE_URL =
  import.meta.env.VITE_PRODUCT_API || "http://localhost:8001/products";

export const getAllProducts = async () => {
  try {
    const response = await fetch(`${BASE_URL}`);
    if (!response.ok) throw new Error("Error al obtener productos");
    return await response.json();
  } catch (error) {
    console.error("Error en getAllProducts:", error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) throw new Error("Producto no encontrado");
    return await response.json();
  } catch (error) {
    console.error("Error en getProductById:", error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await fetch(`${BASE_URL}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error("Error al crear producto");
    return await response.json();
  } catch (error) {
    console.error("Error en createProduct:", error);
    throw error;
  }
};

export const updateProduct = async (id, updatedData) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) throw new Error("Error al actualizar producto");
    return await response.json();
  } catch (error) {
    console.error("Error en updateProduct:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error al eliminar producto");
    return await response.json();
  } catch (error) {
    console.error("Error en deleteProduct:", error);
    throw error;
  }
};
