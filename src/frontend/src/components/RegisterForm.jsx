import { useState } from "react";
import { register } from "../services/authService";

function RegisterForm() {
  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      alert("Registro exitoso");
    } catch (err) {
      alert("Error en el registro", err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registro</h2>
      <input name="username" placeholder="Usuario" onChange={handleChange} />
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        onChange={handleChange}
      />
      <button type="submit">Registrarse</button>
    </form>
  );
}

export default RegisterForm;
