import React, { useEffect, useState } from 'react';
import { Table, Form, Select, Input, Button, message, Popconfirm, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const { RangePicker } = DatePicker;

const OpAdaptationPlanPage = () => {
  const [plans, setPlans] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [form] = Form.useForm();
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
    fetchMentors();
    fetchTrainees();
    const role = sessionStorage.getItem('role');
    setIsAdmin(role === 'admin');
  }, []);

  const fetchMentors = async () => {
    try {
      const role = sessionStorage.getItem('role');
      const res = await fetch('http://localhost:5000/mentors', {
        headers: {
          'role': role
        }
      });
      const data = await res.json();
      if (res.ok) {
        // Фильтруем только ОП
        const opUsers = (Array.isArray(data) ? data : []).filter(user => user.role === 'op');
        setMentors(opUsers);
      } else {
        console.error('Error fetching mentors:', data);
        setMentors([]);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
      setMentors([]);
      message.error('Ошибка при загрузке списка наставников');
    }
  };

  const fetchTrainees = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/candidates/trainees');
      const data = await res.json();
      if (res.ok) {
        setTrainees(data);
      } else {
        console.error('Error fetching trainees:', data);
        setTrainees([]);
      }
    } catch (error) {
      console.error('Error fetching trainees:', error);
      setTrainees([]);
      message.error('Ошибка при загрузке списка стажеров');
    }
  };

  const fetchPlans = async () => {
    try {
      const role = sessionStorage.getItem('role');
      const userId = sessionStorage.getItem('userId');

      const res = await fetch('http://localhost:5000/api/staff-adaptation-plans', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Role': role,
          'UserId': userId,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setPlans(Array.isArray(data) ? data : []);
      } else {
        console.error('Error fetching plans:', data);
        setPlans([]);
        message.error(data.message || 'Ошибка при загрузке планов');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      setPlans([]);
      message.error('Ошибка при загрузке планов');
    }
  };

  const onFinish = async (values) => {
    try {
      const role = sessionStorage.getItem('role');
      const method = values.id ? 'PUT' : 'POST';
      const url = values.id
        ? `http://localhost:5000/api/staff-adaptation-plans/${values.id}`
        : 'http://localhost:5000/api/staff-adaptation-plans';
    
      const body = {
        mentor_id: values.mentor_id,
        trainee_id: values.trainee_id,
        start_date: values.period[0].format('YYYY-MM-DD'),
        end_date: values.period[1].format('YYYY-MM-DD'),
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
    } catch (error) {
      console.error('Error saving plan:', error);
      message.error('Ошибка при сохранении плана');
    }
  };

  const handleDelete = async (id) => {
    try {
      const role = sessionStorage.getItem('role');
      const res = await fetch(`http://localhost:5000/api/staff-adaptation-plans/${id}`, {
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
    } catch (error) {
      console.error('Error deleting plan:', error);
      message.error('Ошибка при удалении плана');
    }
  };

  const handleTraineeClick = (traineeId) => {
    navigate(`/trainee/${traineeId}/tasks`);
  };

  return (
    <div>
      <h2>План адаптации для ОП</h2>
      {isAdmin && (
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginBottom: 24 }}>
          <Form.Item name="id" hidden><Input /></Form.Item>
          
          <Form.Item 
            name="mentor_id" 
            label="Наставник"
            rules={[{ required: true, message: 'Выберите наставника' }]}
          >
            <Select placeholder="Выберите наставника" style={{ width: '100%' }}>
              {Array.isArray(mentors) && mentors.map(m => (
                <Select.Option key={m.id} value={m.id}>
                  {m.username}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            name="trainee_id" 
            label="Стажер"
            rules={[{ required: true, message: 'Выберите стажера' }]}
          >
            <Select placeholder="Выберите стажера" style={{ width: '100%' }}>
              {Array.isArray(trainees) && trainees.map(t => (
                <Select.Option key={t.id} value={t.id}>
                  {t.username}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            name="period" 
            label="Период адаптации"
            rules={[{ required: true, message: 'Укажите период адаптации' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              {editing ? 'Обновить план' : 'Добавить план'}
            </Button>
            {editing && (
              <Button
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
        dataSource={Array.isArray(plans) ? plans : []}
        rowKey="id"
        columns={[
          { 
            title: 'Наставник', 
            dataIndex: ['mentor', 'username']
          },
          { 
            title: 'Стажер', 
            dataIndex: ['trainee', 'username'],
            render: (username, record) => (
              <Button 
                type="link" 
                onClick={() => handleTraineeClick(record.trainee.id)}
              >
                {username}
              </Button>
            )
          },
          {
            title: 'Дата начала',
            dataIndex: 'start_date',
            render: date => moment(date).format('DD.MM.YYYY')
          },
          {
            title: 'Дата окончания',
            dataIndex: 'end_date',
            render: date => moment(date).format('DD.MM.YYYY')
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
                      mentor_id: record.mentor.id,
                      trainee_id: record.trainee.id,
                      period: [moment(record.start_date), moment(record.end_date)]
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

export default OpAdaptationPlanPage; 