import { useNavigate } from "react-router-dom";

function RecruiterDashboard() {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Recruiter Dashboard</h1>

      <p>Welcome to the Resume Screening System.</p>

      <hr />

      <h2>Recruiter Menu</h2>

      <div>
        <button>My Profile</button>
        <button onClick={() => navigate("/recruiter/create-job")}>
            Create Job
        </button>
        <button onClick={() => navigate("/recruiter/jobs")}>
            My Jobs
        </button>
        <button onClick={() => navigate("/recruiter/applicants")}>
            View Applicants
        </button>
      </div>
    </div>
  );
}

export default RecruiterDashboard;