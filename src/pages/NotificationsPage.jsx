import React, { useEffect, useState } from 'react';
import { Select, Input, Button, Form, Card } from 'antd';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { TextArea } = Input;
const { Option } = Select;

const NotificationsPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState(null);
    const [form] = Form.useForm();

    const filteredUsers =
        filterStatus && filterStatus !== 'all'
            ? users.filter(user => user.status === filterStatus)
            : users;

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const response = await axios.get("https://admin-panel-l87a.onrender.com/candidates");
                setUsers(response.data);
            } catch (err) {
                console.error("Error fetching data");
            }
        };

        fetchCandidates();
    }, []);

    const handleSend = async (values) => {
        setLoading(true);
        try {
            await axios.post('https://admin-panel-l87a.onrender.com/api/notifications/send', values);
            toast.success("Уведомления отправлены!");
            form.resetFields();
        } catch (err) {
            console.error(err);
            toast.error("Не удалось отправить уведомления");
        } finally {
            setLoading(false);
        }
    };

    const handleUserChange = (value) => {
        const allIds = filteredUsers.map(user => user.id);
        const isAllSelected = allIds.every(id => value.includes(id));

        if (value.includes('ALL_USERS')) {
            if (isAllSelected) {
                form.setFieldsValue({ userIds: [] }); // Deselect all
            } else {
                form.setFieldsValue({ userIds: allIds }); // Select all
            }
        } else {
            form.setFieldsValue({ userIds: value });
        }
    };

    return (
        <Card
            title="📢 Отправка уведомлений"
            style={{ maxWidth: 700, margin: '40px auto', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 12 }}
        >
            <Form form={form} layout="vertical" onFinish={handleSend}>
                <Form.Item label="📌 Фильтр по статусу">
                    <Select
                        allowClear
                        placeholder="Выберите статус"
                        onChange={setFilterStatus}
                    >
                        <Option value="all">Все</Option>
                        <Option value="interview">Приглашены на интервью</Option>
                        <Option value="accepted">Приняты</Option>
                        <Option value="rejected">Отклонены</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="userIds"
                    label="👤 Выберите пользователей"
                    rules={[{ required: true, message: 'Пожалуйста, выберите хотя бы одного пользователя' }]}
                >
                    <Select
                        mode="multiple"
                        placeholder="Начните вводить имя или фамилию..."
                        showSearch
                        onChange={handleUserChange}
                        filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                        }
                        optionFilterProp="children"
                    >
                        {filteredUsers.length > 0 && (
                            <Option value="ALL_USERS" style={{ fontWeight: 'bold', color: '#1890ff' }}>
                                🔘 Выбрать всех
                            </Option>
                        )}
                        {filteredUsers.map(user => {
                            const name = (user.first_name || user.last_name)
                                ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
                                : `User ${user.id}`;
                            return (
                                <Option key={user.id} value={user.id}>
                                    {name}
                                </Option>
                            );
                        })}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="message"
                    label="💬 Сообщение"
                    rules={[{ required: true, message: 'Сообщение обязательно для заполнения' }]}
                >
                    <TextArea
                        rows={4}
                        placeholder="Введите ваше сообщение..."
                        style={{ resize: 'none' }}
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        📨 Отправить уведомление
                    </Button>
                </Form.Item>
            </Form>

            <ToastContainer />
        </Card>
    );
};

export default NotificationsPage;
