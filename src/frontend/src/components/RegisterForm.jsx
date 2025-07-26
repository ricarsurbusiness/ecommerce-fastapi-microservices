import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";

function RegisterForm() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      alert("Registro exitoso");
      navigate("/login"); // ✅ redirige al login
    } catch (err) {
      alert("Error en el registro");
      console.error(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registro</h2>
      <input
        name="username"
        placeholder="Usuario"
        value={form.username}
        onChange={handleChange}
      />
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        value={form.password}
        onChange={handleChange}
      />
      <button type="submit">Registrarse</button>
    </form>
  );
}

export default RegisterForm;
