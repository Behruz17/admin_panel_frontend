import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, DatePicker, Space, Select, Spin, Popconfirm, Collapse } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [assignedTasksData, setAssignedTasksData] = useState([]);
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [loading, setLoading] = useState(false);

    const [form] = Form.useForm();
    const [assignForm] = Form.useForm();
    const { Panel } = Collapse;

    // Fetch tasks and candidates from the backend when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [tasksResponse, candidatesResponse, assignedTasksResponse] = await Promise.all([
                    axios.get("http://localhost:5000/tasks"),
                    axios.get("http://localhost:5000/candidates"),
                    axios.get("http://localhost:5000/assigned-tasks"),
                ]);
                setTasks(tasksResponse.data);
                setCandidates(candidatesResponse.data);
                setAssignedTasksData(assignedTasksResponse.data);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const showModal = (task = null) => {
        setEditingTask(task);
        setIsModalVisible(true);

        if (task) {
            form.setFieldsValue({
                title: task.title,
                deadline: dayjs(task.deadline),
            });
        } else {
            form.resetFields();
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingTask(null);
        setAssignModalVisible(false);
        form.resetFields();
        assignForm.resetFields();
    };

    const handleSave = async (values) => {
        if (editingTask) {
            try {
                await axios.put(`http://localhost:5000/tasks/${editingTask.id}`, {
                    ...values,
                    deadline: values.deadline.format("YYYY-MM-DD"),
                });
                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task.id === editingTask.id
                            ? { ...task, ...values, deadline: values.deadline.format("YYYY-MM-DD") }
                            : task
                    )
                );
                toast.success("Task updated successfully!");
            } catch (error) {
                toast.error("Failed to update task.");
            }
        } else {
            try {
                const response = await axios.post("http://localhost:5000/tasks", {
                    ...values,
                    deadline: values.deadline.format("YYYY-MM-DD"),
                });

                setTasks([...tasks, response.data]);
                toast.success("Task added successfully!");
            } catch (error) {
                toast.error("Failed to add task.");
            }
        }
        form.resetFields();
        handleCancel();
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/tasks/${id}`);
            setTasks(tasks.filter((task) => task.id !== id));
            toast.success("Task deleted successfully!");
        } catch (error) {
            toast.error("Failed to delete task.");
        }
    };

    const handleAssignTask = async () => {
        // Create an array of new assignments
        const newAssignments = selectedCandidates.map(candidateId => ({
            candidateId,
            taskId: selectedTaskId,
        }));

        // Check if any of the new assignments are already in the assignedTasksData
        const alreadyAssigned = newAssignments.some((newAssignment) =>
            assignedTasksData.some((task) =>
                task.candidate_id === newAssignment.candidateId && task.task_id === newAssignment.taskId
            )
        );

        if (alreadyAssigned) {
            toast.error("Задача уже назначена этому кандидату!");
            return;
        }

        try {
            // Send the new assignments to the server
            const response = await axios.post("http://localhost:5000/assign-task", newAssignments);
            toast.success(`Задачи успешно назначены!`);

            // Create new assigned tasks data based on the new assignments
            const newAssignedTasks = newAssignments.map(assignment => {
                const candidate = candidates.find(c => c.id === assignment.candidateId);
                const task = tasks.find(t => t.id === assignment.taskId);
                return {
                    id: Math.random(), // or get it from response if your backend returns it
                    candidate_id: assignment.candidateId,
                    task_id: assignment.taskId,
                    first_name: candidate?.first_name || '',
                    last_name: candidate?.last_name || '',
                    task_title: task?.title || '',
                };
            });

            // Update the UI by appending the new assignments
            setAssignedTasks(prev => [...prev, ...newAssignedTasks]);
            setAssignedTasksData(prev => [...prev, ...newAssignedTasks]);

            // Close the modal and reset form fields
            setAssignModalVisible(false);
            assignForm.resetFields();
        } catch (error) {
            console.error("Error assigning task:", error);
            toast.error("Ошибка при назначении задачи");
        }
    };



    const columns = [
        { title: "Задача", dataIndex: "title", key: "title" },
        { title: "Срок выполнения", dataIndex: "deadline", key: "deadline" },
        {
            title: "Действия",
            key: "actions",
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
                    <Popconfirm
                        title="Вы уверены, что хотите удалить эту задачу?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Да"
                        cancelText="Нет"
                    >
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                    <Button
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={() => {
                            setSelectedTaskId(record.id);
                            setAssignModalVisible(true);
                        }}
                    >
                        Назначить кандидатам
                    </Button>
                </Space>
            ),
        },
    ];

    const assignedTasksColumns = [
        { title: "Задача", dataIndex: "task_title", key: "task_title" },
        { title: "Кандидат", dataIndex: "candidate", key: "candidate" },
    ];

    const assignedTasksWithCandidates = assignedTasksData.map((task) => ({
        key: task.id,
        task_title: task.task_title,
        candidate: `${task.first_name} ${task.last_name || ''}`,
    }));

    return (
        <div>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => { form.resetFields(); showModal(); }}
                style={{ marginBottom: 16 }}
            >
                Добавить задачу
            </Button>

            {/* Collapsible Accordion for Tasks */}
            <Collapse accordion>
                <Panel header="Задачи" key="1">
                    {loading ? (
                        <Spin size="large" />
                    ) : (
                        <Table columns={columns} dataSource={tasks} rowKey="id" />
                    )}
                </Panel>

                <Panel header="Назначенные задачи" key="2">
                    <Table
                        columns={assignedTasksColumns}
                        dataSource={assignedTasksWithCandidates}
                        rowKey="key"
                    />
                </Panel>
            </Collapse>

            <Modal
                title={editingTask ? "Редактировать задачу" : "Добавить задачу"}
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form
                    form={form}
                    initialValues={{
                        title: editingTask ? editingTask.title : "",
                        deadline: editingTask ? dayjs(editingTask.deadline) : null,
                    }}
                    onFinish={handleSave}
                >
                    <Form.Item
                        label="Задача"
                        name="title"
                        rules={[{ required: true, message: "Пожалуйста, введите название задачи" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Срок выполнения"
                        name="deadline"
                        rules={[{ required: true, message: "Пожалуйста, выберите срок выполнения" }]}
                    >
                        <DatePicker />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            {editingTask ? "Сохранить изменения" : "Добавить задачу"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Назначить задачу кандидатам"
                visible={assignModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form form={assignForm} onFinish={handleAssignTask}>
                    <Form.Item label="Выберите кандидатов" name="candidates">
                        <Select
                            mode="multiple"
                            placeholder="Выберите кандидатов"
                            onChange={(value) => setSelectedCandidates(value)}
                        >
                            {candidates.map((candidate) => (
                                <Select.Option key={candidate.id} value={candidate.id}>
                                    {candidate.first_name} {candidate.last_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Назначить задачи
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <ToastContainer />
        </div>
    );
};

export default TasksPage;
