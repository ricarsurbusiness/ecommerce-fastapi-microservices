// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Shop from "./components/Shop";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLoginSuccess = (token) => {
    localStorage.setItem("token", token);
    setToken(token);
  };

  const isAuthenticated = !!token;

  // Si se borra el token desde otro tab o ventana
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/shop" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={<LoginForm onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="/register" element={<RegisterForm />} />
        <Route
          path="/shop"
          element={
            isAuthenticated ? <Shop /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/products"
          element={
            isAuthenticated ? <Shop /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/cart"
          element={
            isAuthenticated ? <Shop /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
