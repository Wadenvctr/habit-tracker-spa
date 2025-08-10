import { useState } from "react";
import { Input, Button, message } from "antd";
import { api } from "../api/mockApi";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name.trim()) {
      message.warning("Введите имя");
      return;
    }
    if (!email.trim()) {
      message.warning("Введите email");
      return;
    }
    if (!password.trim()) {
      message.warning("Введите пароль");
      return;
    }
    try {
      const res = await api.register({ name: name.trim(), email: email.trim(), password: password.trim() });
      dispatch(loginSuccess(res));
      navigate("/habits");
    } catch {
      message.error("Ошибка регистрации");
    }
  };

  return (
    <div>
      <h2>Регистрация</h2>
      <Input
        placeholder="Имя"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <Input.Password
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <Button type="primary" onClick={handleRegister}>
        Зарегистрироваться
      </Button>
    </div>
  );
}

export default RegisterPage;
