import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

/* =========================================================
   HELPERS (pure functions, no component state needed)
   ========================================================= */

const formatDate = (date) => {
  if (!date) {
    return "N/A";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusClass = (status) => {
  const value = String(status || "").toLowerCase();

  if (
    value.includes("accept") ||
    value.includes("selected") ||
    value.includes("shortlist")
  ) {
    return "application-status status-success";
  }

  if (value.includes("reject") || value.includes("declin")) {
    return "application-status status-danger";
  }

  if (value.includes("review") || value.includes("screen")) {
    return "application-status status-info";
  }

  return "application-status status-pending";
};

const getStatusLabel = (status) => {
  if (!status) {
    return "Submitted";
  }

  return String(status)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/* =========================================================
   MY APPLICATIONS PAGE
   ========================================================= */

function MyApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------- Load applications and match them with jobs ---------- */
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // Get logged-in applicant from server session
        const user = await api.get("/users/me");

        console.log("Logged-in applicant:", user);

        if (!user?.userUuid) {
          setError("User information not found. Please login again.");
          setLoading(false);
          return;
        }

        // Fetch user's applications
        const applicationData = await api.get("/applications/me");

        // Fetch all jobs to get job names/details
        const jobsData = await api.get("/jobs");

        const applicationList = Array.isArray(applicationData)
          ? applicationData
          : [];

        const jobsList = Array.isArray(jobsData) ? jobsData : [];

        // Match each application's jobId with the corresponding job
        const applicationsWithJobDetails = applicationList.map(
          (application) => {
            const matchingJob = jobsList.find(
              (job) => Number(job.jobId) === Number(application.jobId)
            );

            return {
              ...application,
              jobTitle:
                matchingJob?.title ||
                matchingJob?.jobTitle ||
                "Job Not Found",
              jobLocation: matchingJob?.location || "",
            };
          }
        );

        console.log(
          "Applications with job details:",
          applicationsWithJobDetails
        );

        setApplications(applicationsWithJobDetails);
      } catch (err) {
        console.error("Failed to load applications:", err);

        setError(err?.message || "Unable to load your applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  /* ---------- Summary numbers ---------- */
  const pendingCount = applications.filter((application) => {
    const status = String(application.status || "").toLowerCase();

    return (
      !status.includes("reject") &&
      !status.includes("accept") &&
      !status.includes("selected")
    );
  }).length;

  const rejectedCount = applications.filter((application) => {
    const status = String(application.status || "").toLowerCase();

    return status.includes("reject") || status.includes("declin");
  }).length;

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="applicant-applications-page">
        <div className="applications-loading">
          <div className="applications-spinner"></div>
          <p>Loading your applications...</p>
        </div>
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <div className="applicant-applications-page">
        <div className="applications-header">
          <div>
            <span className="applications-eyebrow">APPLICATIONS</span>

            <h1>My Applications</h1>

            <p>Track the jobs you have applied for.</p>
          </div>
        </div>

        <div className="applications-error">
          <div className="applications-error-icon">!</div>

          <h2>Unable to load applications</h2>

          <p>{error}</p>

          <button
            type="button"
            className="applications-primary-btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Page ---------- */
  return (
    <div className="applicant-applications-page">

      {/* Page Header */}

      <div className="applications-header">
        <div>
          <span className="applications-eyebrow">APPLICATIONS</span>

          <h1>My Applications</h1>

          <p>Track and manage the jobs you have applied for.</p>
        </div>

        <button
          type="button"
          className="applications-back-btn"
          onClick={() => navigate("/applicant/jobs")}
        >
          Browse Jobs
        </button>
      </div>

      {/* Summary */}

      <div className="applications-summary">

        <div className="applications-summary-card">
          <div className="summary-icon summary-icon-total">≡</div>

          <div>
            <span>Total Applications</span>
            <strong>{applications.length}</strong>
          </div>
        </div>

        <div className="applications-summary-card">
          <div className="summary-icon summary-icon-progress">◷</div>

          <div>
            <span>In Progress</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>

        <div className="applications-summary-card">
          <div className="summary-icon summary-icon-rejected">×</div>

          <div>
            <span>Not Selected</span>
            <strong>{rejectedCount}</strong>
          </div>
        </div>

      </div>

      {/* Application Section */}

      <div className="applications-section">

        <div className="applications-section-header">
          <div>
            <h2>Application History</h2>

            <p>Your submitted applications and their current status.</p>
          </div>

          <span className="applications-count">
            {applications.length}{" "}
            {applications.length === 1 ? "Application" : "Applications"}
          </span>
        </div>

        {/* Empty State */}

        {applications.length === 0 ? (
          <div className="applications-empty">

            <div className="applications-empty-icon">□</div>

            <h3>No applications yet</h3>

            <p>
              You haven't applied for any jobs yet. Explore available
              opportunities and submit your application.
            </p>

            <button
              type="button"
              className="applications-primary-btn"
              onClick={() => navigate("/applicant/jobs")}
            >
              Browse Available Jobs
            </button>

          </div>
        ) : (

          /* Application List */

          <div className="applications-list">

            {applications.map((application) => (
              <div
                className="application-item"
                key={application.applicationId}
              >

                {/* Application Information */}

                <div className="application-main">

                  {/* First letter of the job title */}
                  <div className="application-avatar">
                    {application.jobTitle
                      ? application.jobTitle.charAt(0).toUpperCase()
                      : "A"}
                  </div>

                  <div className="application-title">

                    {/*<span className="application-number">
                      APPLICATION #{application.applicationId}
                    </span>*/}

                    <h3>{application.jobTitle}</h3>

                    {application.jobLocation && (
                      <p>📍 {application.jobLocation}</p>
                    )}

                  </div>

                </div>

                {/* Application Details */}

                <div className="application-details">

                  <div className="application-detail">
                    <span>Applied On</span>

                    <strong>{formatDate(application.appliedAt)}</strong>
                  </div>

                  <div className="application-detail">
                    <span>Status</span>

                    <span className={getStatusClass(application.status)}>
                      <span className="status-dot"></span>

                      {getStatusLabel(application.status)}
                    </span>
                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default MyApplications;