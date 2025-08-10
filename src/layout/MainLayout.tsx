import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import MainMenu from "./MainMenu";
import HeaderRight from "./HeaderRight";

const { Header, Sider, Content } = Layout;

function MainLayout() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider>
        <MainMenu />
      </Sider>
      <Layout>
        <Header style={{ display: "flex", justifyContent: "flex-end" }}>
          <HeaderRight />
        </Header>
        <Content style={{ padding: "20px" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
