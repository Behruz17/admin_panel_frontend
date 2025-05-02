import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
import { UserOutlined, FileSearchOutlined, LinkOutlined, QuestionCircleOutlined, FileTextOutlined, TeamOutlined } from "@ant-design/icons";

import CandidatesPage from "./pages/CandidatesPage";
import CandidateDetailsPage from "./pages/CandidateDetailsPage";
import FAQPage from "./pages/FAQPage";
import MiniTestPage from "./pages/MiniTestPage";
import NotificationsPage from "./pages/NotificationsPage";
import LoginPage from "./pages/LoginPage";
import SurveyPage from "./pages/SurveyPage";
import TasksPage from "./pages/TasksPage";
import MentorsPage from "./pages/MentorsPage";
import AdaptationPlanPage from "./pages/AdaptationPlanPage";

const { Header, Sider, Content } = Layout;

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if the user is logged in using the JWT token in sessionStorage
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (token && location.pathname === "/login") {
      navigate("/candidates");
    } else if (!token && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [location.pathname, navigate, token]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {token && location.pathname !== "/login" && (
        <Sider breakpoint="lg" collapsedWidth="0">
          <div className="logo" style={{ color: "white", padding: 20, textAlign: "center" }}>
            HR Admin
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={({ key }) => navigate(key)}
          >
            <Menu.Item key="/candidates" icon={<UserOutlined />}>Кандидаты</Menu.Item>
            <Menu.Item key="/mentors" icon={<TeamOutlined />}>Менторы</Menu.Item> {/* Updated icon */}
            <Menu.Item key="/tasks" icon={<FileSearchOutlined />}>Задачи</Menu.Item> {/* Add tasks menu */}
            <Menu.Item key="/faq" icon={<QuestionCircleOutlined />}>FAQ</Menu.Item>
            <Menu.Item key="/mini-test" icon={<FileTextOutlined />}>Мини Тест</Menu.Item>
            <Menu.Item key="/notifications" icon={<FileTextOutlined />}>Уведомления</Menu.Item>
            <Menu.Item key="/survey" icon={<FileSearchOutlined />}>Опросник</Menu.Item>
            <Menu.Item key="/adaptation-plan" icon={<LinkOutlined />}>План Адаптации</Menu.Item>
          </Menu>
        </Sider>
      )}
      <Layout>
        <Header style={{ background: "#fff", padding: 0 }} />
        <Content style={{ margin: "24px 16px 0" }}>
          <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/candidates" element={<CandidatesPage />} />
              <Route path="/candidates/:id" element={<CandidateDetailsPage />} />
              <Route path="/tasks" element={<TasksPage />} /> {/* Add this route */}
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/mini-test" element={<MiniTestPage />} />
              <Route path="*" element={<CandidatesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/survey" element={<SurveyPage />} />
              <Route path="/mentors" element={<MentorsPage />} />
              <Route path="/adaptation-plan" element={<AdaptationPlanPage />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
