import React from "react";
import { Route, Routes } from "react-router-dom";
import Admin from "./sections/Admin/Admin";
import DataAlumni from "./sections/Alumni/DataAlumni";
import Organisasi from "./sections/Alumni/Organisasi";
import Login from "./sections/Authentication/Login";
import Dashboard from "./sections/Dashboard/Dashboard";
import Discover from "./sections/Discover/Discover";
import Gallery from "./sections/Gallery/Gallery";
import News from "./sections/News/News";
import Responden from "./sections/Survey/Responden";
import RespondenDetails from "./sections/Survey/RespondenDetails";
import Surveys from "./sections/Survey/Surveys";
import SurveySetup from "./sections/Survey/SurveySetup";

const Rout = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dataalumni" element={<DataAlumni />} />
        <Route path="/organisasi" element={<Organisasi />} />
        <Route path="/kelolasurvey" element={<Surveys />} />
        <Route path="/kelolasurvey/:id_survey" element={<SurveySetup />} />
        <Route path="/kelolaresponden" element={<Responden />} />
        <Route path="/kelolaresponden/:id_survey" element={<RespondenDetails />} />
        <Route path="/news" element={<News />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  );
};

export default Rout;
