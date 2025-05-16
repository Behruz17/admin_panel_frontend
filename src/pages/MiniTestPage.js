import React, { useState, useEffect } from 'react';
import { Button, Form, Input, List, Popconfirm, Typography, Space, Spin } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const MiniTestPage = () => {
  const [questions, setQuestions] = useState(null); // Начинаем с null, так как данные загружаются
  const [editIndex, setEditIndex] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    // Загружаем вопросы с сервера при монтировании компонента
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/questions');
        setQuestions(response.data); // Обновляем состояние с полученными данными
      } catch (err) {
        console.error("Ошибка при загрузке вопросов:", err);
      }
    };

    fetchQuestions();
  }, []); // Пустой массив зависимостей, чтобы загрузка происходила только при монтировании

  const onFinish = async (values) => {
    try {
      if (editIndex !== null) {
        const { id } = questions[editIndex];
        await axios.put(`http://localhost:5000/api/questions/${id}`, {
          question: values.question_text,
        });

        const updated = [...questions];
        updated[editIndex].question_text = values.question_text;
        setQuestions(updated);
      } else {
        const response = await axios.post('http://localhost:5000/api/questions', {
          question: values.question_text,
        });

        setQuestions([...questions, { id: response.data.id, question_text: response.data.question }]);
      }
      form.resetFields();
      setEditIndex(null);
    } catch (err) {
      console.error("Ошибка при сохранении вопроса:", err);
    }
  };

  const onEdit = (index) => {
    form.setFieldsValue({ question_text: questions[index].question_text });
    setEditIndex(index);
  };

  const onDelete = async (index) => {
    const { id } = questions[index];
    try {
      await axios.delete(`http://localhost:5000/api/questions/${id}`);
      const updated = questions.filter((_, i) => i !== index);
      setQuestions(updated);
    } catch (err) {
      console.error("Ошибка при удалении вопроса:", err);
    }
  };

  const onCancelEdit = () => {
    form.resetFields();
    setEditIndex(null);
  };

  // Пока данные загружаются, показываем спиннер загрузки
  if (questions === null) {
    return <Spin size="large" />; // Показываем спиннер, пока данные загружаются
  }

  return (
    <div>
      <Title level={2}>Вопросы мини-теста</Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="question_text"
          label="Вопрос"
          rules={[{ required: true, message: 'Пожалуйста, введите вопрос!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {editIndex !== null ? 'Обновить вопрос' : 'Добавить вопрос'}
            </Button>
            {editIndex !== null && (
              <Button type="default" onClick={onCancelEdit}>
                Отмена
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>

      <List
        bordered
        dataSource={questions}
        renderItem={(item, index) => (
          <List.Item
            actions={[
              <Button
                type="default"
                icon={<EditOutlined />}
                onClick={() => onEdit(index)}
              >
                Редактировать
              </Button>,
              <Popconfirm
                title="Вы уверены, что хотите удалить этот вопрос?"
                onConfirm={() => onDelete(index)}
                okText="Да"
                cancelText="Нет"
              >
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                >
                  Удалить
                </Button>
              </Popconfirm>
            ]}
          >
            <span><strong>Вопрос {index + 1}:</strong> {item.question_text}</span>
          </List.Item>
        )}
      />
    </div>
  );
};

export default MiniTestPage;
