import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import { auth, db } from "../../config/Firebase";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
//   updateDoc,
} from "firebase/firestore";
import {
  Col,
  Container,
  Row,
  Spinner,
  Form,
  Button,
} from "react-bootstrap";
import DataTable from "react-data-table-component";

const Responden = () => {
  const [surveyData, setSurveyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSurveys = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "surveys"));
      if (querySnapshot && querySnapshot.docs) {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSurveyData(data);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching surveys:", error.message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchSurveys();
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [fetchSurveys, navigate]);

//   const handleToggleStatus = async (row) => {
//     try {
//       const updatedSurveyData = surveyData.map((survey) => {
//         if (survey.id === row.id) {
//           return { ...survey, isActive: !survey.isActive };
//         } else {
//           return survey;
//         }
//       });

//       setSurveyData(updatedSurveyData);

//       const surveyDocRef = doc(db, "surveys", row.id);
//       await updateDoc(surveyDocRef, {
//         isActive: !row.isActive,
//       });
//     } catch (error) {
//       console.error("Error toggling status:", error.message);
//     }
//   };

  const columns = [
    { name: "No", selector: (row, index) => index + 1, width: "5%" },
    { name: "ID", selector: (row) => row.id, sortable: true },
    { name: "Nama", selector: (row) => row.name },
    {
      name: "Status",
      selector: "isActive",
      cell: (row) => (
        <Form.Check
          type="switch"
          id={`switch-${row.id}`}
          label={row.isActive ? "Aktif" : "Nonaktif"}
          checked={row.isActive}
        //   onChange={() => handleToggleStatus(row)}
        />
      ),
    },
    {
      name: "Aksi",
      cell: (row) => (
          <Button
            variant="success"
            onClick={() => {
              navigate("/kelolaresponden/" + row.id);
            }}
          >
            Lihat Responden
          </Button>
      ),
    },
  ];

  return (
    <div>
      <Container fluid>
        <Row>
          <Col md={2}>
            <Sidebar />
          </Col>
          <Col md={10} style={{ paddingTop: "12px" }}>
            <div>
              <h2>Kelola Responden</h2>
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
              <DataTable
                striped
                columns={columns}
                data={surveyData}
                title= "List Survey"
                pagination
              />
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Responden;
