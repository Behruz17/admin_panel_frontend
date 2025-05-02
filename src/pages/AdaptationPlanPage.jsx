import React, { useEffect, useState } from 'react';
import { Table, Form, Select, Input, Button, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const AdaptationPlanPage = () => {
  const [plans, setPlans] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [form] = Form.useForm();
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetch('https://admin-panel-l87a.onrender.com/mentors')
      .then(res => res.json())
      .then(setMentors);
    const role = sessionStorage.getItem('role');
    setIsAdmin(role === 'admin');
  }, []);

  const fetchPlans = async () => {
    const role = sessionStorage.getItem('role');
    const userId = sessionStorage.getItem('userId');

    const res = await fetch('https://admin-panel-l87a.onrender.com/adaptation-plan', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Role': role,
        'UserId': userId,
      },
    });

    const data = await res.json();
    setPlans(data);
  };

  const onFinish = async (values) => {
    const role = sessionStorage.getItem('role');
    const method = values.id ? 'PUT' : 'POST';
    const url = values.id
      ? `https://admin-panel-l87a.onrender.com/adaptation-plan/${values.id}`
      : 'https://admin-panel-l87a.onrender.com/adaptation-plan';
  
    const body = {
      mentor_id: values.mentor_id,
      link: values.link,
      role,
    };

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  
    const result = await res.json();
    if (res.ok) {
      message.success(values.id ? 'План обновлён' : 'План добавлен');
      form.resetFields();
      setEditing(false);
      fetchPlans();
    } else {
      message.error(result.message || 'Ошибка');
    }
  };
  

  const handleDelete = async (id) => {
    const role = sessionStorage.getItem('role');
    const res = await fetch(`https://admin-panel-l87a.onrender.com/adaptation-plan/${id}`, {
      method: 'DELETE',
      headers: {
        'Role': role,
      },
    });

    const result = await res.json();
    if (res.ok) {
      message.success('План удалён');
      fetchPlans();
    } else {
      message.error(result.message || 'Ошибка удаления');
    }
  };

  return (
    <div>
      {isAdmin && (
        <Form form={form} layout="inline" onFinish={onFinish} style={{ marginBottom: 24 }}>
          <Form.Item name="id" hidden><Input /></Form.Item>
          <Form.Item name="mentor_id" rules={[{ required: true }]}>
            <Select placeholder="Выберите наставника" style={{ width: 200 }}>
              {mentors.map(m => (
                <Select.Option key={m.id} value={m.id}>
                  {m.username}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="link" rules={[{ required: true }]}>
            <Input placeholder="Ссылка" style={{ width: 300 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editing ? 'Обновить план' : 'Добавить план'}
            </Button>
            {editing && (
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => {
                  form.resetFields();
                  setEditing(false);
                }}
              >
                Отмена
              </Button>
            )}
          </Form.Item>
        </Form>
      )}
      <Table
        dataSource={plans}
        rowKey="id"
        columns={[
          isAdmin ? { title: 'Наставник', dataIndex: 'username' } : null,
          {
            title: 'Ссылка',
            dataIndex: 'link',
            render: link => <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
          },
          isAdmin ? {
            title: 'Действия',
            render: (_, record) => (
              <>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => {
                    form.setFieldsValue({
                      id: record.id,
                      mentor_id: record.mentor_id,
                      link: record.link,
                    });
                    setEditing(true);
                  }}
                />
                <Popconfirm
                  title="Вы уверены, что хотите удалить этот план?"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button type="link" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </>
            ),
          } : null,
        ].filter(Boolean)}
      />
    </div>
  );
};

export default AdaptationPlanPage;
