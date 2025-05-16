import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Progress, List, Tag, Button, Typography, Modal, Form, Input, DatePicker } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title } = Typography;

const TraineeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [traineeName, setTraineeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Получаем информацию о стажере
      const traineeResponse = await fetch(`http://localhost:5000/candidates/${id}`);
      const traineeData = await traineeResponse.json();
      if (traineeResponse.ok) {
        setTraineeName(traineeData.username || 'Стажер');
      }

      // Получаем задачи стажера
      const tasksResponse = await fetch(`http://localhost:5000/candidateTasks/${id}`);
      const tasksData = await tasksResponse.json();
      if (tasksResponse.ok) {
        setTasks(tasksData.tasks || []);
        setCompletionPercentage(parseFloat(tasksData.completionPercentage) || 0);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (values) => {
    try {
      // Сначала создаем задачу
      const taskResponse = await axios.post('http://localhost:5000/tasks', {
        title: values.title,
        deadline: values.deadline.format('YYYY-MM-DD'),
      });

      // Затем назначаем её стажеру
      await axios.post('http://localhost:5000/assign-task', [{
        candidateId: id,
        taskId: taskResponse.data.id,
      }]);

      toast.success('Задача успешно создана и назначена');
      setIsModalVisible(false);
      form.resetFields();
      fetchData(); // Обновляем список задач
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Ошибка при создании задачи');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done':
        return 'success';
      case 'failed':
        return 'error';
      case 'in_progress':
        return 'processing';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'done':
        return 'Выполнено';
      case 'failed':
        return 'Не выполнено';
      case 'in_progress':
        return 'В процессе';
      default:
        return 'Не начато';
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: 16, marginRight: 16 }}
      >
        Назад к плану адаптации
      </Button>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalVisible(true)}
        style={{ marginBottom: 16 }}
      >
        Добавить задачу
      </Button>

      <Title level={2} style={{ marginBottom: 24 }}>
        Задачи стажера: {traineeName}
      </Title>

      <Card>
        <div style={{ marginBottom: 24 }}>
          <Progress
            percent={completionPercentage}
            status={completionPercentage === 100 ? "success" : "active"}
          />
        </div>

        <List
          itemLayout="horizontal"
          dataSource={tasks}
          locale={{ emptyText: 'Нет назначенных задач' }}
          renderItem={(task) => (
            <List.Item>
              <List.Item.Meta
                title={task.title}
                description={
                  <>
                    <div>Срок выполнения: {new Date(task.deadline).toLocaleDateString()}</div>
                    <Tag color={getStatusColor(task.status)}>
                      {getStatusText(task.status)}
                    </Tag>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="Добавить задачу"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleAddTask}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="Название задачи"
            rules={[{ required: true, message: 'Пожалуйста, введите название задачи' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="deadline"
            label="Срок выполнения"
            rules={[{ required: true, message: 'Пожалуйста, выберите срок выполнения' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Добавить задачу
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default TraineeDetailsPage; 