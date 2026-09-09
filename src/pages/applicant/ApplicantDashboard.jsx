import { useNavigate } from "react-router-dom";

function ApplicantDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Applicant Dashboard</h1>
      <p>Welcome to the Resume Screening System.</p>

      <hr />

      <h2>Applicant Menu</h2>

      <div>
        <button onClick={() => navigate("/applicant/profile")}>
          My Profile
        </button>

        <button onClick={() => navigate("/applicant/upload-resume")}>
            Upload Resume
        </button>
        <button onClick={() => navigate("/applicant/jobs")}>
            Available Jobs
        </button>
        <button onClick={() => navigate("/applicant/applications")}>
            My Applications
        </button>
      </div>
    </div>
  );
}

export default ApplicantDashboard;