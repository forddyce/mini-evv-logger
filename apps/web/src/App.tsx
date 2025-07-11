import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import ScheduleDetailsPage from "./pages/ScheduleDetailsPage";
import ClockOutPage from "./pages/ClockOutPage";
import "./index.css";

const App: React.FC = () => {
  return (
    <Router>
      {" "}
      <MainLayout>
        <Routes>
          {" "}
          <Route path="/" element={<HomePage />} />
          <Route
            path="/schedule/details/:id"
            element={<ScheduleDetailsPage />}
          />
          <Route path="/clock-out/:id" element={<ClockOutPage />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
