import { useState } from 'react';
import { Layout, Button, Drawer, Flex } from "antd";
import { Outlet } from "react-router-dom";
import { MenuOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import MainMenu from "./MainMenu";
import HeaderRight from "./HeaderRight";

const { Header, Sider, Content } = Layout;

function MainLayout() {
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const toggleDrawer = () => setDrawerOpen(v => !v);
  const toggleCollapsed = () => setCollapsed(v => !v);

  return (
    <Layout className="app-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        collapsedWidth={0}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          setIsMobile(broken);
          if (!broken) setDrawerOpen(false);
        }}
        trigger={null}
        width={200}
      >
        <MainMenu />
      </Sider>

      <Layout>
        <Header className="app-header">
          <Flex justify="space-between" align="center">
            {isMobile ? (
              <Button className="burger-btn" type="text" icon={<MenuOutlined />} onClick={toggleDrawer} />
            ) : (
              <Button
                className="burger-btn"
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={toggleCollapsed}
              />
            )}
            <HeaderRight />
          </Flex>
        </Header>

        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>

      <Drawer
        placement="left"
        closable
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={240}
      >
        <MainMenu />
      </Drawer>
    </Layout>
  );
}

export default MainLayout;
