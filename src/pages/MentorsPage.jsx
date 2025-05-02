import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import { ToastContainer, toast } from 'react-toastify';

const MentorsPage = () => {
    const [mentors, setMentors] = useState([]);  // Храним список наставников
    const [modalVisible, setModalVisible] = useState(false);  // Видимость модального окна
    const [form] = Form.useForm();  // Используем форму для создания наставника

    // Загружаем список наставников при монтировании компонента
    useEffect(() => {
        fetchMentors();
    }, []);

    // Функция для получения списка наставников с сервера
    const fetchMentors = async () => {
        const res = await fetch('https://admin-panel-l87a.onrender.com/mentors');
        const data = await res.json();
        setMentors(data);
    };

    // Функция для создания наставника
    const handleCreate = async (values) => {
        const res = await fetch('https://admin-panel-l87a.onrender.com/mentors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        });

        const result = await res.json();
        if (res.ok) {
            toast.success('Наставник создан');
            fetchMentors();  // Обновляем список наставников
            setModalVisible(false);  // Закрываем модальное окно
            form.resetFields();  // Очищаем поля формы
        } else {
            toast.error(result.message || 'Ошибка');
        }
    };

    return (
        <div>
            <Button type="primary" onClick={() => setModalVisible(true)}>Создать наставника</Button>
            <Table
                dataSource={mentors}  // Отображаем список наставников
                rowKey="id"
                columns={[
                    { title: 'Имя пользователя', dataIndex: 'username' },  // Колонка с именем пользователя
                    { 
                        title: 'Роль', 
                        dataIndex: 'role',
                        render: (role) => role === 'admin' ? 'Админ' : 'Наставник'  // Добавили преобразование роли
                    },
                ]}
                style={{ marginTop: 20 }}
            />

            <Modal
                open={modalVisible}  // Отображаем модальное окно, если modalVisible = true
                onCancel={() => setModalVisible(false)}  // Закрываем модальное окно
                onOk={() => form.submit()}  // Отправляем форму
                title="Создать наставника"
            >
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="username" label="Имя пользователя" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="password" label="Пароль" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>
            <ToastContainer />
        </div>
    );
};

export default MentorsPage;
