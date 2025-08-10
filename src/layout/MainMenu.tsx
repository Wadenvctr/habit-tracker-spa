import { Menu } from "antd";
import { Link, useLocation } from "react-router-dom";

function MainMenu() {
  const location = useLocation();

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={[
        { key: "/", label: <Link to="/">Главная</Link> },
        { key: "/habits", label: <Link to="/habits">Привычки</Link> }
      ]}
    />
  );
}

export default MainMenu;
