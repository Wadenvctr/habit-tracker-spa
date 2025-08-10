import { useState } from "react";
import { Input, Button, message } from "antd";
import { api } from "../api/mockApi";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.login(username, password);
      dispatch(loginSuccess({ token: res.token, user: res.user }));
      message.success("Вход выполнен");
      navigate("/habits");
    } catch {
      message.error("Неверные данные");
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: "auto", paddingTop: 40 }}>
      <h2>Вход</h2>
      <Input
        placeholder="Логин"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Input.Password
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginTop: 10 }}
      />
      <Button
        type="primary"
        onClick={handleLogin}
        style={{ marginTop: 10 }}
        block
      >
        Войти
      </Button>
    </div>
  );
}

export default LoginPage;
