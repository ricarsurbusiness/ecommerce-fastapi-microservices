import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

function App() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Autenticación</h1>
      <RegisterForm />
      <hr />
      <LoginForm />
    </div>
  );
}

export default App;
