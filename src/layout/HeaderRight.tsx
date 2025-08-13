import { Button, Space } from "antd";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

function HeaderRight() {
  const { isAuth, user } = useAuth();
  const dispatch = useDispatch();

  return (
    <div>
      {isAuth ? (
        <Space size="middle">
          <span>{user?.name || user?.email}</span>
          <Button onClick={() => dispatch(logout())}>Выйти</Button>
        </Space>
      ) : (
        <>
          <Link to="/login">
            <Button>Вход</Button>
          </Link>
          <Link to="/register" style={{ marginLeft: "10px" }}>
            <Button>Регистрация</Button>
          </Link>
        </>
      )}
    </div>
  );
}

export default HeaderRight;
