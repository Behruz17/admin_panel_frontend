import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Descriptions, List, Button, Spin, Collapse, Progress } from "antd";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DatePicker, Modal } from "antd";
import MyPieChart from "../components/PieChart";

function CandidateDetailsPage() {
  const { id } = useParams(); // Get candidate ID from URL params
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null); // Store candidate data
  const [candidateTasks, setCandidateTasks] = useState([]); // Store tasks array
  const [completionPercentage, setCompletionPercentage] = useState(0); // Store completion percentage
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [interviewDateTime, setInterviewDateTime] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { Panel } = Collapse;

  // Fetch candidate details when the component mounts
  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const response = await axios.get(`https://admin-panel-l87a.onrender.com/candidates/${id}`);
        setCandidate(response.data); // Set the candidate data from API response
        setLoading(false); // Set loading to false after data is fetched
      } catch (err) {
        setError("Error fetching candidate data");
        setLoading(false);
        console.error("Error fetching data:", err);
      }
    };

    const fetchCandidateTasks = async () => {
      try {
        const taskRes = await axios.get(`https://admin-panel-l87a.onrender.com/candidateTasks/${id}`);

        // Ensure you're extracting 'tasks' and 'completionPercentage' from the response
        const { tasks, completionPercentage } = taskRes.data;

        // Update state with tasks and completionPercentage
        setCandidateTasks(tasks);
        setCompletionPercentage(parseFloat(completionPercentage)); // Convert to float in case it's a string
      } catch (err) {
        console.error("Error fetching candidate tasks:", err);
      }
    };

    fetchCandidate();
    fetchCandidateTasks();
  }, [id]); // Re-run the effect when the candidate ID changes

  if (loading) {
    return <Spin size="large" />; // Show loading spinner while data is being fetched
  }

  if (error) {
    return <div>{error}</div>; // Display error message if there's an issue
  }

  if (!candidate) {
    return <p>Кандидат не найден</p>; // Display message if candidate is not found
  }

  const handleInviteClick = () => {
    setIsModalVisible(true); // Show modal to pick date
  };

  const handleRejectCandidate = async () => {
    try {
      await axios.post("https://admin-panel-l87a.onrender.com/updateAdminStatus", {
        userId: candidate.id,
        adminStatus: "rejected",
      });
      setCandidate((prev) => ({
        ...prev,
        adminStatus: "rejected",
      }));
      toast.success("Отказ отправлен кандидату");
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast.error("Ошибка при обновлении статуса");
    }
  };

  const handleInviteNextStage = async () => {
    if (!interviewDateTime) {
      toast.error("Пожалуйста, выберите дату и время собеседования");
      return;
    }

    try {
      await axios.post("https://admin-panel-l87a.onrender.com/updateAdminStatus", {
        userId: candidate.id,
        adminStatus: "interview",
        interviewDate: interviewDateTime.toISOString(),
      });

      setCandidate((prev) => ({
        ...prev,
        adminStatus: "interview",
      }));
      toast.success("Кандидат приглашен на собеседование");
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast.error("Ошибка при обновлении статуса");
    }
  };

  const handleAcceptCandidate = async () => {
    try {
      await axios.post("https://admin-panel-l87a.onrender.com/updateAdminStatus", {
        userId: candidate.id,
        adminStatus: "accepted",
      });
      setCandidate((prev) => ({
        ...prev,
        adminStatus: "accepted",
      }));
      toast.success("Кандидат принят");
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast.error("Ошибка при обновлении статуса");
    }
  };

  const openResume = () => {
    window.open(candidate.resumeUrl, "_blank");
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        ← Назад
      </Button>

      <Card title={`Кандидат: ${candidate.name}`}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Username">
            {candidate.username || "Не задано"}
          </Descriptions.Item>
          <Descriptions.Item label="Статус тестирования">
            {
              candidate.testStatus === "completed"
                ? "Завершен"
                : candidate.testStatus === "started"
                  ? "В тестировании"
                  : "Не назначен"
            }
          </Descriptions.Item>
          <Descriptions.Item label="Статус для админа">
            {candidate.adminStatus === "rejected"
              ? "Отказан"
              : candidate.adminStatus === "accepted"
                ? "Принят"
                : candidate.adminStatus === "interview"
                  ? "На собеседовании"
                  : "Не назначен"
            }
          </Descriptions.Item>
          <Descriptions.Item label="Дата прохождения теста">
            {candidate.testDate
              ? new Date(candidate.testDate).toLocaleDateString()
              : "Не указано"}
          </Descriptions.Item>
        </Descriptions>

        <Button type="primary" onClick={openResume} style={{ marginTop: 16 }} disabled={!candidate.resumeUrl || candidate.resumeUrl.trim() === ''}>
          Просмотр резюме
        </Button>

        <Collapse style={{ marginTop: 24 }} accordion>
          <Panel header="Ответы на мини-тест" key="1">
            {Array.isArray(candidate.testAnswers) && candidate.testAnswers.length > 0 ? (
              <List
                bordered
                dataSource={candidate.testAnswers}
                renderItem={(item, index) => (
                  <List.Item>
                    <b>Вопрос {index + 1}:</b> {item.question} <br />
                    <b>Ответ:</b> {item.answer}
                  </List.Item>
                )}
              />
            ) : (
              <p>Ответов на мини-тест нет.</p>
            )}
          </Panel>
          <Panel header="Задачи кандидата" key="2">
            {Array.isArray(candidateTasks) && candidateTasks.length > 0 ? (
              <>
                <div style={{ marginBottom: '10px' }}>
                  <Progress
                    percent={completionPercentage || 0}
                    status={completionPercentage === 100 ? "success" : "active"}
                    strokeColor={completionPercentage === 100 ? "#52c41a" : "#1890ff"}
                  />
                </div>
                <List
                  bordered
                  dataSource={candidateTasks}
                  renderItem={(task) => (
                    <List.Item
                      style={{
                        background:
                          task.status === 'done'
                            ? '#f6ffed' // light green
                            : task.status === 'failed'
                              ? '#fff1f0' // light red
                              : '#fffbe6', // light yellow
                      }}
                    >
                      <div style={{ width: '100%' }}>
                        <b>Задача:</b> {task.title} <br />
                        <b>Статус:</b>{" "}
                        {task.status === "done" ? (
                          <span style={{ color: "green" }}>Выполнено</span>
                        ) : task.status === "failed" ? (
                          <span style={{ color: "red" }}>Не выполнено</span>
                        ) : (
                          <span style={{ color: "orange" }}>В процессе</span>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              </>
            ) : (
              <p>Задачи не назначены.</p>
            )}
          </Panel>
        </Collapse>

        <div style={{ marginTop: 16 }}>
          <Button
            onClick={handleRejectCandidate}
            type="primary"
            danger
            style={{ marginRight: 8 }}
            disabled={candidate.adminStatus === "rejected"} // Disable if rejected
          >
            Отказать кандидату
          </Button>
          <Button
            onClick={handleInviteClick}
            type="primary"
            style={{ marginRight: 8 }}
            disabled={candidate.adminStatus === "interview"}
          >
            Пригласить на собеседование
          </Button>
          <Button
            onClick={handleAcceptCandidate}
            type="primary"
            style={{ marginRight: 8 }}
            disabled={candidate.adminStatus === "accepted"} // Disable if already accepted
          >
            Принять кандидата
          </Button>
        </div>
        <Modal
          title="Назначить дату и время собеседования"
          visible={isModalVisible}
          onOk={handleInviteNextStage}
          onCancel={() => setIsModalVisible(false)}
          okText="Пригласить"
          cancelText="Отмена"
        >
          <DatePicker
            showTime
            style={{ width: "100%" }}
            value={interviewDateTime}
            onChange={(value) => setInterviewDateTime(value)}
            placeholder="Выберите дату и время"
          />
        </Modal>
      </Card>
      <ToastContainer />
    </div>
  );
}

export default CandidateDetailsPage;
