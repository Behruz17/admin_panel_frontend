import React, { useState, useEffect } from "react";
import { Table, Button, Tag, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CandidatesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);  // Loading state for spinner
  const [error, setError] = useState(null); // Error state

  const navigate = useNavigate();

  // Fetch data from the backend on component mount
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await axios.get("http://localhost:5000/candidates");
        setData(response.data);  // Set data from API response
        setLoading(false);        // Set loading to false after data is fetched
      } catch (err) {
        setError("Error fetching data");  // Set error if something goes wrong
        setLoading(false);  // Set loading to false even in case of error
      }
    };

    fetchCandidates();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  const columns = [
    {
      title: "Имя",
      render: (_, record) => {
        const fullName = `${record.first_name || ""} ${record.last_name || ""}`.trim();
        return fullName || "Не задано";
      },
    },
    {
      title: "Username",
      dataIndex: "username",
      render: (username) => (username ? username : "Не задано"),
    },
    {
      title: "Статус",
      dataIndex: "status",
      render: (status) => {
        let color;
        switch (status) {
          case "interview":
            color = "orange";
            break;
          case "rejected":
            color = "red";
            break;
          case "accepted":
            color = "green";
            break;
          default:
            color = "default";
        }
        return <span style={{ color }}> {
          status === "rejected"
            ? "Отказан"
            : status === "accepted"
              ? "Принят"
              : status === "interview"
                ? "На собеседовании"
                : "Не назначен"
        }</span>;
      },
    },
    {
      title: "Действия",
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/candidates/${record.id}`)}>
          Подробнее
        </Button>
      ),
    },
  ];

  if (loading) {
    return <Spin size="large" />;  // Show a loading spinner while the data is being fetched
  }

  if (error) {
    return <div>{error}</div>;  // Display error message if something goes wrong
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Кандидаты</h2>
      </div>

      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        scroll={{ x: "100%" }}  // Allow horizontal scroll for small screens
        pagination={{ pageSize: 5 }}  // Add pagination for better mobile view
      />
    </>
  );
}

export default CandidatesPage;
