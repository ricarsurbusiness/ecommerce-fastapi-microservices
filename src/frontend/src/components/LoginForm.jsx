import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

function LoginForm({ onLoginSuccess }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await login(form);
      onLoginSuccess(data.access_token);
      navigate("/products"); // Redirigir al login exitoso
    } catch (err) {
      setError("Credenciales inválidas", err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input name="username" placeholder="Usuario" onChange={handleChange} />
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        onChange={handleChange}
      />
      <button type="submit">Iniciar sesión</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}

export default LoginForm;
