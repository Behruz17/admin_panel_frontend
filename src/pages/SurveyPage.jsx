import React, { useState, useEffect } from 'react';
import {
  Button,
  Form,
  Input,
  List,
  Popconfirm,
  Typography,
  Space,
  Modal,
  Rate,
  Select,
  Collapse,
  Card,
  Divider
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SendOutlined } from '@ant-design/icons';
import axios from 'axios';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const SurveyPage = () => {
  const [questions, setQuestions] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [responses, setResponses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState(null);
  const [sortKey, setSortKey] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/surveyQuestions');
        const data = response.data.map(q => ({
          ...q,
          questionText: q.questionText || q.question || ''
        }));
        setQuestions(data);
      } catch (error) {
        console.error('Ошибка при загрузке вопросов:', error);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const res = await axios.get('http://localhost:5000/surveyResponses');
        const rawResponses = res.data;
        const grouped = rawResponses.reduce((acc, curr) => {
          const key = `${curr.userId}_${dayjs(curr.date).format('YYYY-MM-DD HH:mm:ss')}`;
          if (!acc[key]) {
            acc[key] = {
              userId: curr.userId,
              submittedAt: curr.date,
              userName: `User ${curr.userId}`, // Replace with actual name if available
              ratings: [],
              feedback: null,
            };
          }

          if (curr.type === 'rating') {
            acc[key].ratings.push({
              questionId: curr.questionId,
              questionText: curr.questionText,
              rating: Number(curr.response),
            });
          } else if (curr.type === 'feedback') {
            acc[key].feedback = curr.response;
          }

          return acc;
        }, {});

        const groupedResponses = Object.values(grouped);
        setResponses(groupedResponses);
      } catch (error) {
        console.error('Ошибка при загрузке ответов пользователей:', error);
        toast.error('Не удалось загрузить ответы пользователей');
      }
    };

    fetchResponses();
  }, []);

  const groupedResponses = responses.reduce((acc, curr) => {
    const userId = curr.userId;
    if (!acc[userId]) {
      acc[userId] = {
        userName: `User ${curr.userId}`, // Replace with actual user name if available
        responses: [],
        submittedAt: curr.submittedAt, // Only store one submission date
      };
    }
    acc[userId].responses.push(curr);
    return acc;
  }, {});

  const onFinish = (values) => {
    if (editIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editIndex] = {
        ...updatedQuestions[editIndex],
        questionText: values.question,
      };

      setQuestions(updatedQuestions);
      axios
        .put(`http://localhost:5000/surveyQuestions/${questions[editIndex].id}`, {
          questionText: values.question,
        })
        .then(() => {
          toast.success('Вопрос успешно обновлён');
        })
        .catch(() => toast.error('Ошибка при обновлении вопроса'));
    } else {
      axios
        .post('http://localhost:5000/surveyQuestions', {
          questionText: values.question
        })
        .then((response) => {
          setQuestions(prev => [...prev, {
            ...response.data,
            questionText: values.question
          }]);
          toast.success('Вопрос успешно добавлен');
        })
        .catch(() => toast.error('Ошибка при добавлении вопроса'));
    }

    form.resetFields();
    setEditIndex(null);
    setIsModalVisible(false);
  };

  const onEdit = (index) => {
    form.setFieldsValue({ question: questions[index].questionText });
    setEditIndex(index);
    setIsModalVisible(true);
  };

  const onDelete = (index) => {
    const questionId = questions[index].id;
    axios
      .delete(`http://localhost:5000/surveyQuestions/${questionId}`)
      .then(() => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
        toast.success('Вопрос успешно удалён');
      })
      .catch(() => toast.error('Ошибка при удалении вопроса'));
  };

  const showAddModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditIndex(null);
  };

  const getQuestionText = (id) => {
    const question = questions.find((q) => q.id === id);
    return question ? question.questionText : 'Неизвестный вопрос';
  };

  const filteredResponses = responses
    .filter((r) => r.userName.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((r) =>
      ratingFilter ? r.ratings.some((rat) => rat.rating <= ratingFilter) : true
    )
    .filter((r) =>
      dateRange.length === 2
        ? dayjs(r.submittedAt).isAfter(dayjs(dateRange[0])) &&
        dayjs(r.submittedAt).isBefore(dayjs(dateRange[1]).endOf('day'))
        : true
    );

  const sortedResponses = [...filteredResponses].sort((a, b) => {
    if (sortKey === 'recent') {
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    }
    if (sortKey === 'average') {
      const avgA = a.ratings.reduce((sum, r) => sum + r.rating, 0) / a.ratings.length;
      const avgB = b.ratings.reduce((sum, r) => sum + r.rating, 0) / b.ratings.length;
      return avgB - avgA;
    }
    return 0;
  });

  const paginatedResponses = sortedResponses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const sendSurveyToAll = async () => {
    try {
      const response = await axios.post('http://localhost:5000/survey');
      console.log('er', response);

      if (response.status === 201) {
        toast.success('Опросник успешно отправлен всем пользователям!');
      } else {
        toast.error('Ошибка при отправке опросника.');
      }
    } catch (error) {
      console.error('Survey send error:', error);
      toast.error('Ошибка при соединении с сервером.');
    }
  };

  return (
    <div>
      <Title level={2}>Опрос</Title>
      <ToastContainer />
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={sendSurveyToAll}
        style={{ marginBottom: '16px' }}
      >
        Отправить опросник всем
      </Button>
      <Collapse accordion>
        <Panel header="🛠️ Управление Вопросами" key="crud">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showAddModal}
            style={{ marginBottom: '16px' }}
          >
            Добавить вопрос
          </Button>

          <List
            bordered
            dataSource={questions}
            renderItem={(item, index) => (
              <List.Item
                key={item.id} // Ensure unique key
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
                    <Button type="primary" danger icon={<DeleteOutlined />}>
                      Удалить
                    </Button>
                  </Popconfirm>,
                ]}
              >
                {item.questionText}
              </List.Item>
            )}
          />

          <Modal
            title={editIndex !== null ? 'Редактировать вопрос' : 'Добавить вопрос'}
            visible={isModalVisible}
            onCancel={handleCancel}
            footer={null}
          >
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="question"
                label="Вопрос"
                rules={[{ required: true, message: 'Введите вопрос!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {editIndex !== null ? 'Обновить' : 'Добавить'}
                  </Button>
                  <Button onClick={handleCancel}>Отмена</Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        </Panel>

        <Panel header="📝 Отзывы Пользователей" key="responses">
          <Space style={{ marginBottom: 16 }} wrap>
            <DatePicker.RangePicker
              onChange={(dates) => {
                setDateRange(dates);
                setCurrentPage(1);
              }}
            />
            <Input
              placeholder="Поиск по имени пользователя"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              allowClear
            />
            <Select
              placeholder="Фильтр: рейтинг ≤"
              allowClear
              onChange={(val) => {
                setRatingFilter(val);
                setCurrentPage(1);
              }}
              style={{ width: 180 }}
            >
              {[1, 2, 3, 4, 5].map((val) => (
                <Option key={val} value={val}>
                  {val} звезды или ниже
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Сортировать по"
              onChange={(val) => {
                setSortKey(val);
                setCurrentPage(1);
              }}
              style={{ width: 180 }}
            >
              <Option value="recent">Недавние</Option>
              <Option value="average">Средний рейтинг</Option>
            </Select>
          </Space>

          <List
            bordered
            dataSource={Object.keys(groupedResponses)} // Use keys (userIds) for the list
            renderItem={(userId) => {
              const user = groupedResponses[userId];
              return (
                <Card key={userId} style={{ marginBottom: '16px', padding: '8px', }} title={`${user.userName} - Отзыв`}>
                  <p style={{ fontSize: '12px' }}><strong>Дата отправки:</strong> {dayjs(user.submittedAt).format('YYYY-MM-DD HH:mm:ss')}</p>

                  {/* Render responses as a single row with counters */}
                  {user.responses.map((response, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '8px' }}>
                      {/* Add a counter before each question */}
                      <div style={{ marginRight: '8px', fontWeight: 'bold' }}>{idx + 1}.</div>

                      {response.ratings && response.ratings.map((rating) => (
                        <div key={rating.questionId} style={{ marginRight: '8px' }}>
                          {getQuestionText(rating.questionId)}: <Rate value={rating.rating} disabled />
                        </div>
                      ))}

                      {response.feedback && (
                        <div>
                          <strong>Отзыв:</strong> {response.feedback}
                        </div>
                      )}
                    </div>
                  ))}
                </Card>
              );
            }}
          />


        </Panel>
      </Collapse>
    </div>
  );
};

export default SurveyPage;
