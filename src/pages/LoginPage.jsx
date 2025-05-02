import React, { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('https://admin-panel-l87a.onrender.com/api/login', {
        username: values.username,
        password: values.password,
      });

      if (response.data.token) {
        message.success("Вход выполнен успешно!");
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('role', response.data.role);
        sessionStorage.setItem('userId', response.data.userId);
        window.location.href = "/candidates";
      }
    } catch (error) {
      if (error.response) {
        console.error("Ошибка входа:", error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Сетевая ошибка:", error.message);
        toast.error("Ошибка входа");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Вход в систему"
      style={{
        maxWidth: 400,
        margin: "100px auto",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        borderRadius: 12,
      }}
    >
      <Form name="login" onFinish={handleLogin}>
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Пожалуйста, введите имя пользователя!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Имя пользователя" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Пожалуйста, введите пароль!" }]}
        >
          <Input
            prefix={<LockOutlined />}
            type="password"
            placeholder="Пароль"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Войти
          </Button>
        </Form.Item>
      </Form>

      <ToastContainer />
    </Card>
  );
};

export default LoginPage;
