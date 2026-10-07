import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import RecruiterVerifyOtp from "./pages/RecruiterVerifyOtp";

// Administrator Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ViewRecruiters from "./pages/admin/ViewRecruiters";
import CreateRecruiter from "./pages/admin/CreateRecruiter";

// Applicant Pages
import ApplicantDashboard from "./pages/applicant/ApplicantDashboard";
import MyProfile from "./pages/applicant/MyProfile";
import UploadResume from "./pages/applicant/UploadResume";
import AvailableJobs from "./pages/applicant/AvailableJobs";
import ApplyJob from "./pages/applicant/ApplyJob";
import MyApplications from "./pages/applicant/MyApplications";

// Recruiter Pages
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import RecruiterMyProfile from "./pages/recruiter/MyProfile";
import CreateJob from "./pages/recruiter/CreateJob";
import MyJobs from "./pages/recruiter/MyJobs";
import ViewApplicants from "./pages/recruiter/ViewApplicants";
import ResumeViewer from "./pages/recruiter/ResumeViewer";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Layouts
import ApplicantLayout from "./layouts/ApplicantLayout";
import RecruiterLayout from "./layouts/RecruiterLayout";
import AdminLayout from "./layouts/AdminLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            PUBLIC
            ===================================================== */}

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/verify-recruiter"
          element={<RecruiterVerifyOtp />}
        />


        {/* =====================================================
            APPLICANT
            ===================================================== */}

        <Route
          path="/applicant"
          element={
            <ProtectedRoute allowedRole="APPLICANT">
              <ApplicantLayout />
            </ProtectedRoute>
          }
        >
          {/* /applicant */}
          <Route
            index
            element={<ApplicantDashboard />}
          />

          {/* /applicant/profile */}
          <Route
            path="profile"
            element={<MyProfile />}
          />

          {/* /applicant/upload-resume */}
          <Route
            path="upload-resume"
            element={<UploadResume />}
          />

          {/* /applicant/jobs */}
          <Route
            path="jobs"
            element={<AvailableJobs />}
          />

          {/* /applicant/apply/:jobId */}
          <Route
            path="apply/:jobId"
            element={<ApplyJob />}
          />

          {/* /applicant/applications */}
          <Route
            path="applications"
            element={<MyApplications />}
          />
        </Route>

        {/* =====================================================
            RECRUITER
            ===================================================== */}
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute allowedRole="RECRUITER">
              <RecruiterLayout />
            </ProtectedRoute>
          }
        >
          {/* /recruiter */}
          <Route
            index
            element={<RecruiterDashboard />}
          />

          {/* /recruiter/profile */}
          <Route
            path="profile"
            element={<RecruiterMyProfile />}
          />

          {/* /recruiter/create-job */}
          <Route
            path="create-job"
            element={<CreateJob />}
          />

          {/* /recruiter/jobs */}
          <Route
            path="jobs"
            element={<MyJobs />}
          />

          {/* /recruiter/applicants */}
          <Route
            path="applicants"
            element={<ViewApplicants />}
          />

          {/* /recruiter/applicants/:jobId */}
          <Route
            path="applicants/:jobId"
            element={<ViewApplicants />}
          />

          {/* /recruiter/resume-viewer/:resumeId */}
          <Route
            path="resume-viewer/:resumeId"
            element={<ResumeViewer />}
          />
        </Route>


        {/* =====================================================
            ADMIN
            ===================================================== */}

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="ADMIN">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={<AdminDashboard />}
              />

              <Route
                path="recruiters"
                element={<ViewRecruiters />}
              />

              <Route
                path="create-recruiter"
                element={<CreateRecruiter />}
              />
            </Route>

        {/* =====================================================
            UNKNOWN
            ===================================================== */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;