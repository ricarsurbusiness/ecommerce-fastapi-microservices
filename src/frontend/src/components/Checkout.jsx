import React, { useState, useEffect } from 'react';
import { createOrderFromCart } from '../services/orderService';
import { getCartSummary, getCartItems } from '../services/cartService';
import './Checkout.css';

const Checkout = ({ onCheckoutComplete, onBack }) => {
  const [formData, setFormData] = useState({
    shipping_address: '',
    billing_address: '',
    phone: '',
    email: '',
    notes: '',
    payment_method: 'cash_on_delivery'
  });
  const [cartSummary, setCartSummary] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [useSameAddress, setUseSameAddress] = useState(true);

  useEffect(() => {
    loadCartData();
  }, []);

  const loadCartData = async () => {
    try {
      setLoading(true);
      const [summary, items] = await Promise.all([
        getCartSummary(),
        getCartItems()
      ]);
      setCartSummary(summary);
      setCartItems(items);

      // Pre-fill email if available
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.email) {
        setFormData(prev => ({ ...prev, email: userData.email }));
      }
    } catch (err) {
      console.error('Error loading cart data:', err);
      alert('Error al cargar información del carrito');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Auto-fill billing address if same as shipping
    if (name === 'shipping_address' && useSameAddress) {
      setFormData(prev => ({
        ...prev,
        billing_address: value
      }));
    }
  };

  const handleSameAddressChange = (e) => {
    const checked = e.target.checked;
    setUseSameAddress(checked);

    if (checked) {
      setFormData(prev => ({
        ...prev,
        billing_address: prev.shipping_address
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        billing_address: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.shipping_address.trim() || formData.shipping_address.length < 10) {
      newErrors.shipping_address = 'La dirección de envío debe tener al menos 10 caracteres';
    }

    if (!formData.phone.trim() || formData.phone.length < 7) {
      newErrors.phone = 'El teléfono debe tener al menos 7 dígitos';
    }

    if (!formData.email.trim() || !formData.email.includes('@') || !formData.email.includes('.')) {
      newErrors.email = 'Por favor ingresa un email válido';
    }

    if (!useSameAddress && (!formData.billing_address.trim() || formData.billing_address.length < 10)) {
      newErrors.billing_address = 'La dirección de facturación debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    try {
      setSubmitting(true);

      const checkoutData = {
        ...formData,
        billing_address: useSameAddress ? formData.shipping_address : formData.billing_address
      };

      const result = await createOrderFromCart(checkoutData);

      alert(`¡Pedido creado exitosamente! Número de orden: #${result.order_id}`);

      if (onCheckoutComplete) {
        onCheckoutComplete(result);
      }
    } catch (err) {
      console.error('Error creating order:', err);
      if (err.message.includes('Token de autenticación inválido')) {
        alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        alert(`Error al crear el pedido: ${err.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="checkout-container">
        <div className="loading">Cargando información del checkout...</div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-cart">
          <h2>El carrito está vacío</h2>
          <p>Agrega algunos productos antes de proceder al checkout</p>
          <button onClick={onBack} className="btn btn-primary">
            Volver a Productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button onClick={onBack} className="back-btn">
          ← Volver al Carrito
        </button>
        <h2>Finalizar Compra</h2>
      </div>

      <div className="checkout-content">
        <div className="checkout-form">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Información de Envío</h3>

              <div className="form-group">
                <label htmlFor="shipping_address">Dirección de Envío *</label>
                <textarea
                  id="shipping_address"
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleChange}
                  placeholder="Ingresa tu dirección completa de envío"
                  rows="3"
                  required
                />
                {errors.shipping_address && (
                  <span className="error-message">{errors.shipping_address}</span>
                )}
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={useSameAddress}
                    onChange={handleSameAddressChange}
                  />
                  Usar la misma dirección para facturación
                </label>
              </div>

              {!useSameAddress && (
                <div className="form-group">
                  <label htmlFor="billing_address">Dirección de Facturación *</label>
                  <textarea
                    id="billing_address"
                    name="billing_address"
                    value={formData.billing_address}
                    onChange={handleChange}
                    placeholder="Ingresa tu dirección de facturación"
                    rows="3"
                  />
                  {errors.billing_address && (
                    <span className="error-message">{errors.billing_address}</span>
                  )}
                </div>
              )}
            </div>

            <div className="form-section">
              <h3>Información de Contacto</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Teléfono *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Número de teléfono"
                    required
                  />
                  {errors.phone && (
                    <span className="error-message">{errors.phone}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Método de Pago</h3>

              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cash_on_delivery"
                    checked={formData.payment_method === 'cash_on_delivery'}
                    onChange={handleChange}
                  />
                  <span className="payment-label">
                    💰 Pago Contra Entrega
                    <small>Paga cuando recibas tu pedido</small>
                  </span>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment_method"
                    value="bank_transfer"
                    checked={formData.payment_method === 'bank_transfer'}
                    onChange={handleChange}
                  />
                  <span className="payment-label">
                    🏦 Transferencia Bancaria
                    <small>Te enviaremos los datos bancarios</small>
                  </span>
                </label>
              </div>
            </div>

            <div className="form-section">
              <h3>Notas Adicionales</h3>

              <div className="form-group">
                <label htmlFor="notes">Comentarios (Opcional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Instrucciones especiales de entrega o comentarios"
                  rows="3"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-large"
              >
                {submitting ? 'Procesando...' : `Confirmar Pedido - ${formatPrice(cartSummary?.total_amount || 0)}`}
              </button>
            </div>
          </form>
        </div>

        <div className="order-summary">
          <h3>Resumen del Pedido</h3>

          <div className="summary-items">
            {cartItems.map(item => (
              <div key={item.id} className="summary-item">
                <div className="item-info">
                  <span className="item-name">Producto ID: {item.product_id}</span>
                  <span className="item-quantity">Cantidad: {item.quantity}</span>
                </div>
                <span className="item-total">{formatPrice(item.total_price)}</span>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Productos ({cartSummary?.total_items}):</span>
              <span>{formatPrice(cartSummary?.total_amount || 0)}</span>
            </div>

            <div className="summary-row">
              <span>Envío:</span>
              <span>GRATIS</span>
            </div>

            <div className="summary-row total-row">
              <span>Total:</span>
              <span className="total-amount">
                {formatPrice(cartSummary?.total_amount || 0)}
              </span>
            </div>
          </div>

          <div className="delivery-info">
            <div className="delivery-estimate">
              <h4>🚚 Entrega Estimada</h4>
              <p>3-5 días hábiles</p>
              <small>Te notificaremos cuando tu pedido esté en camino</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
