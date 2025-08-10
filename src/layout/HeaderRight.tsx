import { Button } from "antd";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

function HeaderRight() {
  const { isAuth, username } = useAuth();
  const dispatch = useDispatch();

  return (
    <div>
      {isAuth ? (
        <>
          <span style={{ marginRight: "10px" }}>{username}</span>
          <Button onClick={() => dispatch(logout())}>Выйти</Button>
        </>
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
