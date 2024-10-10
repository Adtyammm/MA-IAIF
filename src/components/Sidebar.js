import {
  faArrowRightFromBracket,
  faClipboardQuestion,
  faDashboard,
  faFileLines,
  faGraduationCap,
  faLock,
  faNewspaper,
  faPeopleGroup,
  faPhotoFilm,
  faSitemap,
  faSquareCheck,
  faSquarePollHorizontal,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Collapse, Container, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/Firebase";

const Sidebar = () => {
  const [openAlumni, setOpenAlumni] = useState(false);
  const [openSurvey, setOpenSurvey] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <Container
      className="text-white"
      style={{
        backgroundColor: "#14213D",
        height: "100vh",
        padding: "1rem",
        fontFamily: "sans-serif",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        width: "15%",
      }}
    >
      <div className="text-center fw-bold">
        <h3>IAIF ADMIN</h3>
        <hr />
      </div>
      <Nav className="flex-column">
        <Nav.Link className="text-white" href="/dashboard">
          <FontAwesomeIcon icon={faDashboard} className="me-2 text-white" />{" "}
          Dashboard
        </Nav.Link>
        <Nav.Link
          onClick={() => setOpenAlumni(!openAlumni)}
          aria-controls="alumni-collapse-text"
          aria-expanded={openAlumni}
          style={{ cursor: "pointer" }}
          className="text-white"
        >
          <FontAwesomeIcon icon={faGraduationCap} className="me-2 text-white" />{" "}
          Alumni
        </Nav.Link>
        <Collapse in={openAlumni}>
          <div id="alumni-collapse-text" className="border rounded bg-white">
            <Nav className="flex-column">
              <Nav.Link href="/dataalumni">
                <FontAwesomeIcon icon={faPeopleGroup} className="me-2" /> Data
                Alumni
              </Nav.Link>
              <Nav.Link href="/organisasi">
                <FontAwesomeIcon icon={faSitemap} className="me-2" /> Organisasi
              </Nav.Link>
            </Nav>
          </div>
        </Collapse>
        <Nav.Link
          onClick={() => setOpenSurvey(!openSurvey)}
          aria-controls="survey-collapse-text"
          aria-expanded={openSurvey}
          style={{ cursor: "pointer" }}
          className="text-white"
        >
          <FontAwesomeIcon
            icon={faSquarePollHorizontal}
            className="me-3 text-white"
          />
          Surveys
        </Nav.Link>
        <Collapse in={openSurvey}>
          <div id="survey-collapse-text" className="border rounded bg-white">
            <Nav className="flex-column">
              <Nav.Link href="/kelolasurvey">
                <FontAwesomeIcon icon={faClipboardQuestion} className="me-3" />
                Kelola Survey
              </Nav.Link>
              <Nav.Link href="/kelolaresponden">
                <FontAwesomeIcon icon={faSquareCheck} className="me-3" />
                Kelola Responden
              </Nav.Link>
            </Nav>
          </div>
        </Collapse>
        <Nav.Link className="text-white" href="/news">
          <FontAwesomeIcon icon={faNewspaper} className="me-3 text-white" />
          News
        </Nav.Link>
        <Nav.Link className="text-white" href="/discover">
          <FontAwesomeIcon icon={faFileLines} className="me-3 text-white" />
          Discover
        </Nav.Link>
        <Nav.Link className="text-white" href="/gallery">
          <FontAwesomeIcon icon={faPhotoFilm} className="me-2 text-white" />{" "}
          Gallery
        </Nav.Link>
        <Nav.Link className="text-white" href="/admin">
          <FontAwesomeIcon icon={faLock} className="me-3 text-white" /> Admin
        </Nav.Link>
        <Nav.Link className="text-white" onClick={handleLogout}>
          <FontAwesomeIcon
            icon={faArrowRightFromBracket}
            className="me-3 text-white"
          />
          Logout
        </Nav.Link>
      </Nav>
    </Container>
  );
};

export default Sidebar;
