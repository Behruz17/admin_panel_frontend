import React, { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
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
import AdminAdaptationPlanPage from "./pages/AdminAdaptationPlanPage";
import OpAdaptationPlanPage from "./pages/OpAdaptationPlanPage";
import LineAdaptationPlanPage from "./pages/LineAdaptationPlanPage";
import TraineeDetailsPage from "./pages/TraineeDetailsPage";

const { Header, Sider, Content } = Layout;

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
        <Sider breakpoint="lg" collapsedWidth="0" width={240}>
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
            <Menu.Item key="/mentors" icon={<TeamOutlined />}>Пользователи</Menu.Item>
            <Menu.Item key="/tasks" icon={<FileSearchOutlined />}>Задачи</Menu.Item>
            <Menu.Item key="/faq" icon={<QuestionCircleOutlined />}>FAQ</Menu.Item>
            <Menu.Item key="/mini-test" icon={<FileTextOutlined />}>Мини Тест</Menu.Item>
            <Menu.Item key="/notifications" icon={<FileTextOutlined />}>Уведомления</Menu.Item>
            <Menu.Item key="/survey" icon={<FileSearchOutlined />}>Опросник</Menu.Item>
            <Menu.SubMenu key="adaptation" icon={<LinkOutlined />} title="Планы Адаптации">
              <Menu.Item key="/adaptation-plan/admin">Админ персонал</Menu.Item>
              <Menu.Item key="/adaptation-plan/op">ОП</Menu.Item>
              <Menu.Item key="/adaptation-plan/line">Линейный персонал</Menu.Item>
            </Menu.SubMenu>
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
              <Route path="/trainee/:id/tasks" element={<TraineeDetailsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/mini-test" element={<MiniTestPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/survey" element={<SurveyPage />} />
              <Route path="/mentors" element={<MentorsPage />} />
              <Route path="/adaptation-plan/admin" element={<AdminAdaptationPlanPage />} />
              <Route path="/adaptation-plan/op" element={<OpAdaptationPlanPage />} />
              <Route path="/adaptation-plan/line" element={<LineAdaptationPlanPage />} />
              <Route path="*" element={<CandidatesPage />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
