import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import ApplicantDashboard from "./pages/applicant/ApplicantDashboard";
import MyProfile from "./pages/applicant/MyProfile";
import UploadResume from "./pages/applicant/UploadResume";
import AvailableJobs from "./pages/applicant/AvailableJobs";
import ApplyJob from "./pages/applicant/ApplyJob";
import MyApplications from "./pages/applicant/MyApplications";

import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import CreateJob from "./pages/recruiter/CreateJob";
import MyJobs from "./pages/recruiter/MyJobs";
import ViewApplicants from "./pages/recruiter/ViewApplicants";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Applicant Routes */}
        <Route
          path="/applicant"
          element={
            <ProtectedRoute allowedRole="APPLICANT">
              <ApplicantDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applicant/profile"
          element={
            <ProtectedRoute allowedRole="APPLICANT">
              <MyProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applicant/upload-resume"
          element={
            <ProtectedRoute allowedRole="APPLICANT">
              <UploadResume />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applicant/jobs"
          element={
            <ProtectedRoute allowedRole="APPLICANT">
              <AvailableJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applicant/apply/:jobId"
          element={
            <ProtectedRoute allowedRole="APPLICANT">
              <ApplyJob />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applicant/applications"
          element={
            <ProtectedRoute allowedRole="APPLICANT">
              <MyApplications />
            </ProtectedRoute>
          }
        />

        {/* Recruiter Routes */}
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute allowedRole="RECRUITER">
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/create-job"
          element={
            <ProtectedRoute allowedRole="RECRUITER">
              <CreateJob />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/jobs"
          element={
            <ProtectedRoute allowedRole="RECRUITER">
              <MyJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/applicants"
          element={
            <ProtectedRoute allowedRole="RECRUITER">
              <ViewApplicants />
            </ProtectedRoute>
          }
        />

        {/* Unknown Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

