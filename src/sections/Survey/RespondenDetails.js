import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as XLSX from "xlsx";
import Sidebar from "../../components/Sidebar";
import { auth, db } from "../../config/Firebase";

const RespondenDetails = () => {
  const { id_survey } = useParams();
  const [surveyData, setSurveyData] = useState({});
  const [answersData, setAnswersData] = useState([]);
  const [selectedResponden, setSelectedResponden] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const fetchSurveyData = useCallback(async () => {
    try {
      const surveyDocRef = doc(db, "surveys", id_survey);
      const surveyDocSnapshot = await getDoc(surveyDocRef);

      if (surveyDocSnapshot.exists()) {
        const surveyData = surveyDocSnapshot.data();
        setSurveyData(surveyData);

        const answersCollectionRef = collection(surveyDocRef, "answers");
        const answersQuerySnapshot = await getDocs(answersCollectionRef);
        const answersDoc = answersQuerySnapshot.docs.map((doc) => doc.data());
        setAnswersData(answersDoc);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching survey data:", error.message);
    }
  }, [id_survey]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchSurveyData();
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [fetchSurveyData, navigate]);

  const handleShowModal = (row) => {
    setSelectedResponden(row);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const exportToExcel = () => {
    if (answersData && answersData.length > 0) {
      const uniqueQuestions = Array.from(
        new Set(
          answersData.flatMap((respondent) =>
            respondent.responses.map((response) => response.question)
          )
        )
      );

      const dataToExport = answersData.flatMap((respondent, index) => {
        const rowData = {
          No: index + 1,
          NIM: respondent.nim,
          Nama: respondent.name,
        };

        uniqueQuestions.forEach((question, i) => {
          const response = respondent.responses.find(
            (r) => r.question === question
          );

          rowData[question] = response ? response.answer : "";
        });

        return rowData;
      });

      const ws = XLSX.utils.json_to_sheet(dataToExport, {
        header: ["No", "NIM", "Nama", ...uniqueQuestions],
      });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Responses");
      XLSX.writeFile(wb, `List Responden ${surveyData.name}.xlsx`);
    }
  };

  const columns = [
    {
      name: "No.",
      cell: (row, index) => index + 1,
      width: "5%",
    },
    {
      name: "NIM",
      selector: (row) => row.nim,
    },
    {
      name: "Nama",
      selector: (row) => row.name,
    },
    {
      name: "Aksi",
      cell: (row) => (
        <div>
          <Button
            variant="info"
            className="text-white"
            onClick={() => handleShowModal(row)}
          >
            Lihat
          </Button>
        </div>
      ),
    },
  ];

  const questionData = answersData.reduce((acc, respondent) => {
    respondent.responses.forEach((response) => {
      const question = response.question;
      const answer = response.answer;
      if (!acc[question]) {
        acc[question] = {};
      }
      if (!acc[question][answer]) {
        acc[question][answer] = 0;
      }
      acc[question][answer] += 1;
    });
    return acc;
  }, {});

  const formattedChartData = Object.keys(questionData).map((question) => {
    const questionAnswers = questionData[question];
    const questionDataObj = { question };
    Object.keys(questionAnswers).forEach((answer) => {
      questionDataObj[answer] = questionAnswers[answer];
    });
    return questionDataObj;
  });

  if (isLoading) {
    return (
      <Container fluid>
        <Row>
          <Col md={2}>
            <Sidebar />
          </Col>
          <Col md={10} style={{ paddingTop: "12px", fontFamily: "sans-serif" }}>
            <div className="d-flex justify-content-between">
              <Link to={"/kelolaresponden"} className="btn btn-secondary">
                Back
              </Link>
              <h4>Details</h4>
            </div>
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "100vh" }}
            >
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <div>
      <Container fluid>
        <Row>
          <Col md={2}>
            <Sidebar />
          </Col>
          <Col md={10} style={{ paddingTop: "12px", fontFamily: "sans-serif" }}>
            <div className="d-flex justify-content-between">
              <Link to={"/kelolaresponden"} className="btn btn-secondary">
                Back
              </Link>
              <h4 className="me-2">Details</h4>
            </div>
            <hr className="me-2" />
            <Container fluid className="my-4">
              <div className="d-flex justify-content-between align-items-center">
                <h4>List Responden {surveyData.name}</h4>
                <Button variant="success" onClick={exportToExcel}>
                  Export Ke Excel
                </Button>
              </div>
              <DataTable
                striped
                pagination
                columns={columns}
                data={answersData}
              />

              <h4 className="mt-4">Survey Chart</h4>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={formattedChartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="question" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {formattedChartData.length > 0 &&
                    Object.keys(formattedChartData[0])
                      .filter((key) => key !== "question")
                      .map((key, index) => (
                        <Bar key={index} dataKey={key} fill="blue" />
                      ))}
                </BarChart>
              </ResponsiveContainer>
            </Container>
          </Col>
        </Row>
      </Container>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detail Responden</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedResponden && (
            <>
              <p>NIM : {selectedResponden.nim}</p>
              <p>Nama : {selectedResponden.name}</p>
              <p>Respon :</p>
              <Table striped bordered>
                <thead className="text-center">
                  <tr>
                    <th>No</th>
                    <th>Pertanyaan</th>
                    <th>Opsi</th>
                    <th>Jawaban</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedResponden.responses.map((response, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{response.question}</td>
                      <td>
                        {response.options &&
                        response.options.length > 0 &&
                        response.options !== "" &&
                        response.options !== null
                          ? response.options.join(", ")
                          : "Tidak ada opsi"}
                      </td>
                      <td>{response.answer}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RespondenDetails;
