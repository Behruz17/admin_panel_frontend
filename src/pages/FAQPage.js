import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Collapse, Typography, Popconfirm, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title } = Typography;
const { Panel } = Collapse;

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [form] = Form.useForm();
  const [editIndex, setEditIndex] = useState(null);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/faqs')
      .then(res => setFaqs(res.data))
      .catch(() => toast.error('Не удалось загрузить FAQ'));
  }, []);

  const onFinish = (values) => {
    if (editIndex !== null) {
      axios.put(`http://localhost:5000/api/faqs/${editId}`, values)
        .then(res => {
          const updatedFaqs = [...faqs];
          updatedFaqs[editIndex] = res.data;
          setFaqs(updatedFaqs);
          toast.success('FAQ обновлен');
        })
        .catch(() => toast.error('Не удалось обновить FAQ'));
    } else {
      axios.post('http://localhost:5000/api/faqs', values)
        .then(res => {
          setFaqs([...faqs, res.data]);
          toast.success('FAQ добавлен');
        })
        .catch(() => toast.error('Не удалось добавить FAQ'));
    }
    form.resetFields();
    setEditIndex(null);
    setEditId(null);
  };

  const onEdit = (index) => {
    form.setFieldsValue(faqs[index]);
    setEditIndex(index);
    setEditId(faqs[index].id);
  };

  const onDelete = (index) => {
    const id = faqs[index].id;
    axios.delete(`http://localhost:5000/api/faqs/${id}`)
      .then(() => {
        const updatedFaqs = faqs.filter((_, i) => i !== index);
        setFaqs(updatedFaqs);
        toast.success('FAQ удален');
      })
      .catch(() => toast.error('Не удалось удалить FAQ'));
  };

  const onCancelEdit = () => {
    form.resetFields();
    setEditIndex(null);
    setEditId(null);
  };

  return (
    <div>
      <Title level={2}>Часто задаваемые вопросы (FAQ)</Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="question" label="Вопрос" rules={[{ required: true, message: 'Пожалуйста, введите вопрос!' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="answer" label="Ответ" rules={[{ required: true, message: 'Пожалуйста, введите ответ!' }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {editIndex !== null ? 'Обновить FAQ' : 'Добавить FAQ'}
            </Button>
            {editIndex !== null && (
              <Button onClick={onCancelEdit}>Отмена</Button>
            )}
          </Space>
        </Form.Item>
      </Form>

      <Collapse accordion>
        {faqs.map((item, index) => (
          <Panel header={item.question} key={item.id}>
            <p>{item.answer}</p>
            <Space>
              <Button icon={<EditOutlined />} onClick={() => onEdit(index)}>Редактировать</Button>
              <Popconfirm
                title="Вы уверены, что хотите удалить этот FAQ?"
                onConfirm={() => onDelete(index)}
                okText="Да"
                cancelText="Нет"
              >
                <Button danger icon={<DeleteOutlined />}>Удалить</Button>
              </Popconfirm>
            </Space>
          </Panel>
        ))}
      </Collapse>

      {/* Toast container for notifications */}
      <ToastContainer />
    </div>
  );
};

export default FAQPage;
