import React, { useState, useEffect } from "react";
import { getAllProducts } from "../services/productService";
import { addToCart } from "../services/cartService";
import "./ProductList.css";

const ProductList = ({ onCartUpdate }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
      // Initialize quantities for each product
      const initialQuantities = {};
      data.forEach((product) => {
        initialQuantities[product.id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (err) {
      setError("Error al cargar productos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    if (quantity >= 1) {
      setQuantities((prev) => ({
        ...prev,
        [productId]: quantity,
      }));
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
        window.location.href = "/login";
        return;
      }

      setAddingToCart((prev) => ({ ...prev, [productId]: true }));
      const quantity = quantities[productId] || 1;
      console.log("Adding product to cart:", { productId, quantity });

      await addToCart(productId, quantity);
      alert("Producto agregado al carrito exitosamente!");
      // Update cart count in parent component
      if (onCartUpdate) {
        onCartUpdate();
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      if (err.message.includes("Token de autenticación inválido")) {
        alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        alert(`Error al agregar producto al carrito: ${err.message}`);
      }
    } finally {
      setAddingToCart((prev) => ({ ...prev, [productId]: false }));
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
      <div className="product-list-container">
        <div className="loading">Cargando productos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-list-container">
        <div className="error">{error}</div>
        <button onClick={loadProducts} className="retry-btn">
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      <h2>Productos Disponibles</h2>

      {products.length === 0 ? (
        <div className="no-products">
          <p>No hay productos disponibles</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = "/placeholder-product.png";
                    }}
                  />
                ) : (
                  <div className="placeholder-image">
                    <span>📦</span>
                  </div>
                )}
              </div>

              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>

                <div className="product-details">
                  {product.size && (
                    <span className="product-detail">
                      <strong>Tamaño:</strong> {product.size}
                    </span>
                  )}
                  {product.weight && (
                    <span className="product-detail">
                      <strong>Peso:</strong> {product.weight}kg
                    </span>
                  )}
                </div>

                <div className="product-category">
                  <span className="category-badge">
                    {product.category?.name || "Sin categoría"}
                  </span>
                </div>

                <div className="product-pricing">
                  <div className="price-info">
                    <span className="unit-price">
                      {formatPrice(product.unit_price)}
                    </span>
                    {product.iva > 0 && (
                      <span className="iva-info">(+ {product.iva}% IVA)</span>
                    )}
                  </div>
                </div>

                <div className="product-actions">
                  <div className="quantity-selector">
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          product.id,
                          quantities[product.id] - 1,
                        )
                      }
                      disabled={quantities[product.id] <= 1}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantities[product.id] || 1}
                      onChange={(e) =>
                        handleQuantityChange(
                          product.id,
                          parseInt(e.target.value) || 1,
                        )
                      }
                      min="1"
                      className="quantity-input"
                    />
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          product.id,
                          quantities[product.id] + 1,
                        )
                      }
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={addingToCart[product.id]}
                    className="add-to-cart-btn"
                  >
                    {addingToCart[product.id]
                      ? "Agregando..."
                      : "Agregar al Carrito"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
