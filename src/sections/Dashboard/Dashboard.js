import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { auth, db } from "../../config/Firebase";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUsers();
      } else {
        navigate("/login");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      if (querySnapshot && querySnapshot.docs) {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(data);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching users data: ", error.message);
      setIsLoading(false);
    }
  };

  const maleUsers = users.filter((user) => user.gender === "Laki-Laki").length;
  const femaleUsers = users.filter(
    (user) => user.gender === "Perempuan"
  ).length;

  // Mengelompokkan data pengguna berdasarkan tahun kelulusan
  const graduatedData = users.reduce((acc, user) => {
    if (user.graduated) {
      acc[user.graduated] = (acc[user.graduated] || 0) + 1;
    }
    return acc;
  }, {});

  // Mengubah objek menjadi array untuk digunakan di grafik
  const chartData = Object.keys(graduatedData).map((year) => ({
    year,
    count: graduatedData[year],
  }));

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <Container fluid>
        <Row>
          <Col md={2}>
            <Sidebar />
          </Col>
          <Col md={10} style={{ paddingTop: "12px" }}>
            <div>
              <h2>Dashboard</h2>
              <hr />
            </div>
            {isLoading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "100vh" }}
              >
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <>
                <Row>
                  <p className="mb-4" style={{fontSize: "20px"}}>
                    <FontAwesomeIcon icon={faInfoCircle} /> Informasi Pengguna
                  </p>
                  <Col xs="auto" md="auto" className="ms-4">
                    <div
                      className="px-4 py-2 text-white rounded d-flex justify-content-center align-items-center"
                      style={{
                        backgroundColor: "#14213D",
                        width: "fit-content",
                      }}
                    >
                      <h2 className="me-2 pt-2">{users.length}</h2> Total Alumni
                    </div>
                  </Col>
                  <Col xs="auto" md="auto">
                    <div
                      className="px-4 py-2 text-white rounded d-flex justify-content-center align-items-center"
                      style={{
                        backgroundColor: "#FCA311",
                        width: "fit-content",
                      }}
                    >
                      <h2 className="me-2 pt-2">{maleUsers}</h2> Laki-Laki
                    </div>
                  </Col>
                  <Col xs="auto" md="auto">
                    <div
                      className="px-4 py-2 text-white rounded d-flex justify-content-center align-items-center"
                      style={{
                        backgroundColor: "#8D99AE",
                        width: "fit-content",
                      }}
                    >
                      <h2 className="me-2 pt-2">{femaleUsers}</h2> Perempuan
                    </div>
                  </Col>
                </Row>
                <br />
                <Row className="my-4">
                  <Col>
                    <p className="mb-4" style={{fontSize: "20px"}}>
                      <FontAwesomeIcon icon={faChartBar} /> Grafik Pengguna
                      Berdasarkan Tahun Kelulusan
                    </p>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#14213D" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Col>
                </Row>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
