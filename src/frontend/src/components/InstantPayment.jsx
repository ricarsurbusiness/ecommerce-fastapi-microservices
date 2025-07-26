import React, { useState, useEffect } from "react";
import {
  processInstantPayment,
  getPaymentStatus,
  formatPaymentResponse,
} from "../services/paymentService";
import "./InstantPayment.css";

const InstantPayment = ({ cartSummary, onPaymentComplete, onCancel }) => {
  const [paymentState, setPaymentState] = useState("idle"); // idle, processing, success, error
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentSteps, setPaymentSteps] = useState([]);
  const [paymentResult, setPaymentResult] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadPaymentSteps = async () => {
      const steps = await getPaymentStatus();
      setPaymentSteps(steps);
    };
    loadPaymentSteps();
  }, []);

  const handleInstantPayment = async () => {
    console.log("handleInstantPayment called");
    setPaymentState("processing");
    setCurrentStep(0);
    setProgress(0);

    // Animate through payment steps
    for (let i = 0; i < paymentSteps.length; i++) {
      setCurrentStep(i);
      setProgress(paymentSteps[i].progress);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // Process actual payment
    const result = await processInstantPayment();
    const formattedResult = formatPaymentResponse(result);

    setPaymentResult(formattedResult);
    setPaymentState(result.success ? "success" : "error");

    if (result.success && onPaymentComplete) {
      // Wait a bit to show success animation
      setTimeout(() => {
        onPaymentComplete(result.order);
      }, 2000);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(price);
  };

  const renderPaymentSummary = () => (
    <div className="payment-summary">
      <h3>Resumen del Pago</h3>
      <div className="summary-details">
        <div className="summary-row">
          <span>Total de productos:</span>
          <span>{cartSummary?.total_items || 0}</span>
        </div>
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>{formatPrice(cartSummary?.total_amount || 0)}</span>
        </div>
        <div className="summary-row">
          <span>Envío:</span>
          <span className="free-shipping">GRATIS</span>
        </div>
        <div className="summary-row total-row">
          <span>Total a pagar:</span>
          <span className="total-amount">
            {formatPrice(cartSummary?.total_amount || 0)}
          </span>
        </div>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="payment-processing">
      <div className="processing-animation">
        <div className="payment-icon">💳</div>
        <div className="loading-spinner"></div>
      </div>

      <h3>Procesando Pago</h3>

      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="progress-text">{progress}%</span>
      </div>

      {paymentSteps[currentStep] && (
        <p className="current-step">{paymentSteps[currentStep].status}</p>
      )}

      <div className="processing-steps">
        {paymentSteps.map((step, index) => (
          <div
            key={index}
            className={`step ${index <= currentStep ? "completed" : ""}`}
          >
            <div className="step-indicator">
              {index < currentStep ? "✓" : index === currentStep ? "⟳" : "○"}
            </div>
            <span className="step-text">{step.status}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="payment-success">
      <div className="success-animation">
        <div className="success-icon">✅</div>
        <div className="success-rings">
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>
        </div>
      </div>

      <h2>{paymentResult?.title}</h2>
      <p className="success-message">{paymentResult?.message}</p>

      {paymentResult?.details && (
        <div className="order-details">
          <div className="detail-item">
            <strong>Número de pedido:</strong> #{paymentResult.details.orderId}
          </div>
          <div className="detail-item">
            <strong>Total pagado:</strong>{" "}
            {formatPrice(paymentResult.details.amount)}
          </div>
          <div className="detail-item">
            <strong>Estado:</strong>{" "}
            <span className="status-pending">Pendiente</span>
          </div>
        </div>
      )}

      <p className="redirect-message">
        Te redirigiremos a tus pedidos en unos segundos...
      </p>
    </div>
  );

  const renderError = () => (
    <div className="payment-error">
      <div className="error-icon">❌</div>
      <h2>{paymentResult?.title}</h2>
      <p className="error-message">{paymentResult?.message}</p>

      <div className="error-actions">
        <button onClick={handleInstantPayment} className="retry-btn">
          Intentar de Nuevo
        </button>
        <button onClick={onCancel} className="cancel-btn">
          Cancelar
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="instant-payment-container"
      onClick={(e) => {
        if (e.target === e.currentTarget && paymentState === "idle") {
          onCancel();
        }
      }}
    >
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-header">
          {paymentState === "idle" && (
            <>
              <h2>💳 Pago Rápido</h2>
              <button
                onClick={(e) => {
                  console.log("Close button clicked", e);
                  e.stopPropagation();
                  onCancel();
                }}
                className="close-btn"
              >
                ✕
              </button>
            </>
          )}
          {paymentState === "processing" && <h2>Procesando...</h2>}
          {paymentState === "success" && <h2>¡Pago Exitoso!</h2>}
          {paymentState === "error" && <h2>Error en el Pago</h2>}
        </div>

        <div className="payment-content">
          {paymentState === "idle" && (
            <>
              {renderPaymentSummary()}

              <div className="payment-method">
                <h4>Método de Pago</h4>
                <div className="payment-option selected">
                  <span className="payment-icon">💳</span>
                  <div className="payment-info">
                    <strong>Pago Instantáneo</strong>
                    <small>Procesamiento automático y seguro</small>
                  </div>
                  <span className="selected-indicator">✓</span>
                </div>
              </div>

              <div className="payment-actions">
                <button
                  onClick={(e) => {
                    console.log("Pay button clicked", e);
                    e.stopPropagation();
                    handleInstantPayment();
                  }}
                  className="pay-now-btn"
                >
                  Pagar {formatPrice(cartSummary?.total_amount || 0)}
                </button>
                <button
                  onClick={(e) => {
                    console.log("Cancel button clicked", e);
                    e.stopPropagation();
                    onCancel();
                  }}
                  className="cancel-payment-btn"
                >
                  Cancelar
                </button>
              </div>

              <div className="payment-security">
                <p>🔒 Pago 100% seguro y protegido</p>
              </div>
            </>
          )}

          {paymentState === "processing" && renderProcessing()}
          {paymentState === "success" && renderSuccess()}
          {paymentState === "error" && renderError()}
        </div>
      </div>
    </div>
  );
};

export default InstantPayment;
