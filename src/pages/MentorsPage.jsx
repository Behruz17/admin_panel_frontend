import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Select, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const MentorsPage = () => {
    const [mentors, setMentors] = useState([]);  // Храним список пользователей
    const [modalVisible, setModalVisible] = useState(false);  // Видимость модального окна
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();  // Используем форму для создания пользователя
    const navigate = useNavigate();

    const roles = [
        { label: 'Админ персонал', value: 'admin' },
        { label: 'ОП', value: 'op' },
        { label: 'Линейный персонал', value: 'line' }
    ];

    // Загружаем список пользователей при монтировании компонента
    useEffect(() => {
        const userRole = sessionStorage.getItem('role');
        if (userRole !== 'admin') {
            toast.error('Доступ запрещен');
            navigate('/');
            return;
        }
        fetchMentors();
    }, [navigate]);

    // Функция для получения списка пользователей с сервера
    const fetchMentors = async () => {
        const res = await fetch('https://admin-panel-l87a.onrender.com/mentors', {
            headers: {
                'role': sessionStorage.getItem('role')
            }
        });
        const data = await res.json();
        if (res.ok) {
            setMentors(data);
        } else {
            toast.error(data.message || 'Ошибка получения данных');
            if (res.status === 403) {
                navigate('/');
            }
        }
    };

    // Функция для создания пользователя
    const handleCreate = async (values) => {
        const res = await fetch('https://admin-panel-l87a.onrender.com/mentors', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'role': sessionStorage.getItem('role')
            },
            body: JSON.stringify(values),
        });

        const result = await res.json();
        if (res.ok) {
            toast.success('Пользователь создан');
            fetchMentors();
            setModalVisible(false);
            form.resetFields();
        } else {
            toast.error(result.message || result.error || 'Ошибка');
            if (res.status === 403) {
                navigate('/');
            }
        }
    };

    const handleEdit = async (values) => {
        const res = await fetch(`https://admin-panel-l87a.onrender.com/mentors/${editingUser.id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'role': sessionStorage.getItem('role')
            },
            body: JSON.stringify(values),
        });

        const result = await res.json();
        if (res.ok) {
            toast.success('Пользователь обновлен');
            fetchMentors();
            setModalVisible(false);
            setEditingUser(null);
            form.resetFields();
        } else {
            toast.error(result.message || result.error || 'Ошибка');
            if (res.status === 403) {
                navigate('/');
            }
        }
    };

    const handleDelete = async (id) => {
        const res = await fetch(`https://admin-panel-l87a.onrender.com/mentors/${id}`, {
            method: 'DELETE',
            headers: {
                'role': sessionStorage.getItem('role')
            }
        });

        const result = await res.json();
        if (res.ok) {
            toast.success('Пользователь удален');
            fetchMentors();
        } else {
            toast.error(result.message || 'Ошибка');
            if (res.status === 403) {
                navigate('/');
            }
        }
    };

    const showEditModal = (record) => {
        setEditingUser(record);
        form.setFieldsValue({
            username: record.username,
            role: record.role,
        });
        setModalVisible(true);
    };

    const handleModalCancel = () => {
        setModalVisible(false);
        setEditingUser(null);
        form.resetFields();
    };

    return (
        <div>
            <Button type="primary" onClick={() => setModalVisible(true)}>Создать пользователя</Button>
            <Table
                dataSource={mentors}  // Отображаем список пользователей
                rowKey="id"
                columns={[
                    { title: 'Имя пользователя', dataIndex: 'username' },  // Колонка с именем пользователя
                    { 
                        title: 'Роль', 
                        dataIndex: 'role',
                        render: (role) => {
                            const roleObj = roles.find(r => r.value === role);
                            return roleObj ? roleObj.label : role;
                        }
                    },
                    {
                        title: 'Действия',
                        key: 'actions',
                        render: (_, record) => (
                            <span>
                                <Button
                                    type="link"
                                    icon={<EditOutlined />}
                                    onClick={() => showEditModal(record)}
                                />
                                <Popconfirm
                                    title="Вы уверены, что хотите удалить этого пользователя?"
                                    onConfirm={() => handleDelete(record.id)}
                                    okText="Да"
                                    cancelText="Нет"
                                >
                                    <Button
                                        type="link"
                                        danger
                                        icon={<DeleteOutlined />}
                                    />
                                </Popconfirm>
                            </span>
                        ),
                    },
                ]}
                style={{ marginTop: 20 }}
            />

            <Modal
                open={modalVisible}  // Отображаем модальное окно, если modalVisible = true
                title={editingUser ? "Редактировать пользователя" : "Создать пользователя"}
                onCancel={handleModalCancel}  // Закрываем модальное окно
                onOk={() => form.submit()}  // Отправляем форму
                okText={editingUser ? "Сохранить" : "Создать"}
                cancelText="Отмена"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={editingUser ? handleEdit : handleCreate}
                >
                    <Form.Item
                        name="username"
                        label="Имя пользователя"
                        rules={[{ required: true, message: 'Введите имя пользователя' }]}
                    >
                        <Input />
                    </Form.Item>
                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="Пароль"
                            rules={[{ required: !editingUser, message: 'Введите пароль' }]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}
                    <Form.Item
                        name="role"
                        label="Роль"
                        rules={[{ required: true, message: 'Выберите роль' }]}
                    >
                        <Select options={roles} placeholder="Выберите роль" />
                    </Form.Item>
                </Form>
            </Modal>
            <ToastContainer />
        </div>
    );
};

export default MentorsPage;
