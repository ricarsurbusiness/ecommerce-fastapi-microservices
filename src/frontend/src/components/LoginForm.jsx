import { useState } from "react";
import { login } from "../services/authService";

function LoginForm() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [token, setToken] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(form);
      setToken(data.access_token);
      alert("Login exitoso");
    } catch (err) {
      alert("Error en login", err.message);
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
      {token && <p>Token: {token}</p>}
    </form>
  );
}

export default LoginForm;
