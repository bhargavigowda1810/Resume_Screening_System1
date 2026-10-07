import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

/* =========================================================
   CONSTANTS
   ========================================================= */

// Applications are loaded for the newest jobs only,
// so the dashboard stays fast for recruiters with many jobs.
const MAX_JOBS_FOR_STATS = 20;

/* =========================================================
   HELPERS
   ========================================================= */

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

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

const normalizeStatus = (status) => String(status || "").toUpperCase();

// SUBMITTED -> info, SHORTLISTED -> success, REJECTED -> danger
const getStatusGroup = (status) => {
  const value = normalizeStatus(status);

  if (value === "SHORTLISTED") return "success";
  if (value === "REJECTED") return "danger";
  if (value === "SUBMITTED") return "info";

  return "pending";
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
   RECRUITER HOME (DASHBOARD)
   ========================================================= */

function RecruiterDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);

  /* ---------- Load everything the home page needs ---------- */
  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        // The logged-in recruiter is required
        const currentUser = await api.get("/users/me");

        // The recruiter's jobs: if this fails, the page still opens
        let jobList = [];

        try {
          const jobData = await api.get("/jobs/me");

          jobList = Array.isArray(jobData) ? jobData : [];
        } catch (error) {
          console.error("Unable to load recruiter jobs:", error);
        }

        // Applications of the newest jobs
        const newestJobs = [...jobList]
          .sort((a, b) => Number(b.jobId) - Number(a.jobId))
          .slice(0, MAX_JOBS_FOR_STATS);

        const applicationResults = await Promise.allSettled(
          newestJobs.map((job) =>
            api.get(`/applications/job/${job.jobId}`)
          )
        );

        const applicationList = applicationResults.flatMap(
          (result, index) =>
            result.status === "fulfilled" && Array.isArray(result.value)
              ? result.value.map((application) => ({
                  ...application,
                  jobId: application.jobId ?? newestJobs[index].jobId,
                  jobTitle: newestJobs[index].title,
                }))
              : []
        );

        if (!mounted) {
          return;
        }

        setUser(currentUser);
        setJobs(jobList);
        setApplications(applicationList);
      } catch (error) {
        console.error("Unable to load current recruiter:", error);

        if (mounted) {
          navigate("/login", { replace: true });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="recruiter-home">
        <div className="rhome-loading">
          <div className="rhome-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  /* =========================================================
     DERIVED DATA
     ========================================================= */

  const firstName = (user.name || "Recruiter").trim().split(" ")[0];

  const totalApplications = applications.length;

  const submittedCount = applications.filter(
    (application) => normalizeStatus(application.status) === "SUBMITTED"
  ).length;

  const shortlistedCount = applications.filter(
    (application) => normalizeStatus(application.status) === "SHORTLISTED"
  ).length;

  const rejectedCount = applications.filter(
    (application) => normalizeStatus(application.status) === "REJECTED"
  ).length;

  // Applicants per job: { jobId: { total, submitted } }
  const jobStats = {};

  applications.forEach((application) => {
    const key = String(application.jobId);

    if (!jobStats[key]) {
      jobStats[key] = { total: 0, submitted: 0 };
    }

    jobStats[key].total += 1;

    if (normalizeStatus(application.status) === "SUBMITTED") {
      jobStats[key].submitted += 1;
    }
  });

  // Newest jobs first
  const recentJobs = [...jobs]
    .sort((a, b) => Number(b.jobId) - Number(a.jobId))
    .slice(0, 5);

  // Latest applications first
  const recentApplications = [...applications]
    .sort((a, b) => {
      const dateA = new Date(a.appliedAt).getTime() || 0;
      const dateB = new Date(b.appliedAt).getTime() || 0;

      return (
        dateB - dateA || Number(b.applicationId) - Number(a.applicationId)
      );
    })
    .slice(0, 6);

  // The job with the most applicants waiting for a decision
  const jobNeedingReview = Object.entries(jobStats)
    .filter(([, stats]) => stats.submitted > 0)
    .sort((a, b) => b[1].submitted - a[1].submitted)[0];

  /* ---------- Hero message and button ---------- */
  let heroMessage;
  let heroButton;

  if (jobs.length === 0) {
    heroMessage =
      "Create your first job opening to start receiving applications from candidates.";

    heroButton = {
      label: "Create Job",
      path: "/recruiter/create-job",
    };
  } else if (submittedCount > 0 && jobNeedingReview) {
    heroMessage = `${submittedCount} ${
      submittedCount === 1 ? "application is" : "applications are"
    } waiting for your review.`;

    heroButton = {
      label: "Review Applicants",
      path: `/recruiter/applicants/${jobNeedingReview[0]}`,
    };
  } else {
    heroMessage =
      "You are all caught up. Create a new opening or check your jobs.";

    heroButton = {
      label: "Create Job",
      path: "/recruiter/create-job",
    };
  }

  const percentOfTotal = (count) =>
    totalApplications > 0
      ? Math.round((count / totalApplications) * 100)
      : 0;

  const pipeline = [
    { key: "submitted", label: "Awaiting review", count: submittedCount },
    { key: "shortlisted", label: "Shortlisted", count: shortlistedCount },
    { key: "rejected", label: "Rejected", count: rejectedCount },
  ];

  /* =========================================================
     UI
     ========================================================= */

  return (
    <div className="recruiter-home">

      {/* ==================== WELCOME ==================== */}
      <section className="rhome-hero">

        <div className="rhome-hero-text">
          <span className="rhome-hero-badge">{getGreeting()}</span>

          <h1>Welcome back, {firstName}!</h1>

          <p>{heroMessage}</p>
        </div>

        <div className="rhome-hero-actions">
          <button
            type="button"
            className="rhome-primary-btn"
            onClick={() => navigate(heroButton.path)}
          >
            {heroButton.label}
            <span>→</span>
          </button>
        </div>

      </section>

      {/* ==================== STATS ==================== */}
      <section className="rhome-stats">

        <button
          type="button"
          className="rhome-stat-card"
          onClick={() => navigate("/recruiter/jobs")}
        >
          <span className="rhome-stat-icon rhome-stat-jobs">💼</span>

          <div>
            <strong>{jobs.length}</strong>
            <span>Active Jobs</span>
          </div>
        </button>

        <button
          type="button"
          className="rhome-stat-card"
          onClick={() => navigate("/recruiter/applicants")}
        >
          <span className="rhome-stat-icon rhome-stat-total">👥</span>

          <div>
            <strong>{totalApplications}</strong>
            <span>Total Applicants</span>
          </div>
        </button>

        <button
          type="button"
          className="rhome-stat-card"
          onClick={() => navigate("/recruiter/applicants")}
        >
          <span className="rhome-stat-icon rhome-stat-progress">⏳</span>

          <div>
            <strong>{submittedCount}</strong>
            <span>Awaiting Review</span>
          </div>
        </button>

        <button
          type="button"
          className="rhome-stat-card"
          onClick={() => navigate("/recruiter/applicants")}
        >
          <span className="rhome-stat-icon rhome-stat-success">✓</span>

          <div>
            <strong>{shortlistedCount}</strong>
            <span>Shortlisted</span>
          </div>
        </button>

      </section>

      {/* ==================== MAIN GRID ==================== */}
      <div className="rhome-grid">

        {/* ---------- LEFT COLUMN ---------- */}
        <div className="rhome-main">

          {/* My jobs */}
          <section className="rhome-card">

            <div className="rhome-card-header">
              <div>
                <h2>Your Jobs</h2>
                <p>Newest openings and their applicants</p>
              </div>

              {jobs.length > 0 && (
                <button
                  type="button"
                  className="rhome-link-btn"
                  onClick={() => navigate("/recruiter/jobs")}
                >
                  View all →
                </button>
              )}
            </div>

            {recentJobs.length === 0 ? (
              <div className="rhome-empty">
                <p>You haven't created any jobs yet.</p>

                <button
                  type="button"
                  className="rhome-secondary-btn"
                  onClick={() => navigate("/recruiter/create-job")}
                >
                  Create your first job
                </button>
              </div>
            ) : (
              <ul className="rhome-job-list">
                {recentJobs.map((job) => {
                  const stats = jobStats[String(job.jobId)] || {
                    total: 0,
                    submitted: 0,
                  };

                  return (
                    <li className="rhome-job-item" key={job.jobId}>

                      <div className="rhome-job-info">
                        <strong>{job.title}</strong>

                        <span>
                          {job.location || "Location not specified"} ·{" "}
                          {stats.total}{" "}
                          {stats.total === 1 ? "applicant" : "applicants"}
                        </span>
                      </div>

                      {stats.submitted > 0 && (
                        <span className="rhome-pending-tag">
                          {stats.submitted} to review
                        </span>
                      )}

                      <button
                        type="button"
                        className="rhome-secondary-btn"
                        onClick={() =>
                          navigate(`/recruiter/applicants/${job.jobId}`)
                        }
                      >
                        Applicants
                      </button>

                    </li>
                  );
                })}
              </ul>
            )}

          </section>

          {/* Recent applications */}
          <section className="rhome-card">

            <div className="rhome-card-header">
              <div>
                <h2>Recent Applications</h2>
                <p>Latest candidates across your jobs</p>
              </div>

              {applications.length > 0 && (
                <button
                  type="button"
                  className="rhome-link-btn"
                  onClick={() => navigate("/recruiter/applicants")}
                >
                  View all →
                </button>
              )}
            </div>

            {recentApplications.length === 0 ? (
              <div className="rhome-empty">
                <p>No applications have been received yet.</p>
              </div>
            ) : (
              <ul className="rhome-application-list">
                {recentApplications.map((application) => (
                  <li key={application.applicationId}>

                    <button
                      type="button"
                      className="rhome-application-item"
                      onClick={() =>
                        navigate(`/recruiter/applicants/${application.jobId}`)
                      }
                    >
                      <div className="rhome-application-avatar">
                        {String(application.jobTitle || "A")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="rhome-application-info">
                        <strong>
                          Application #{application.applicationId}
                        </strong>

                        <span>
                          {application.jobTitle} · Applied{" "}
                          {formatDate(application.appliedAt)}
                        </span>
                      </div>

                      <span
                        className={`rhome-status rhome-status-${getStatusGroup(
                          application.status
                        )}`}
                      >
                        <span className="rhome-status-dot"></span>
                        {getStatusLabel(application.status)}
                      </span>
                    </button>

                  </li>
                ))}
              </ul>
            )}

          </section>

        </div>

        {/* ---------- RIGHT COLUMN ---------- */}
        <aside className="rhome-side">

          {/* Hiring pipeline */}
          <section className="rhome-card">

            <div className="rhome-card-header">
              <div>
                <h2>Hiring Pipeline</h2>
                <p>Where your applicants are right now</p>
              </div>
            </div>

            {totalApplications === 0 ? (
              <div className="rhome-empty">
                <p>The pipeline fills up as applications arrive.</p>
              </div>
            ) : (
              <ul className="rhome-pipeline">
                {pipeline.map((stage) => (
                  <li key={stage.key} className="rhome-pipeline-row">

                    <div className="rhome-pipeline-label">
                      <span>{stage.label}</span>

                      <strong>{stage.count}</strong>
                    </div>

                    <div className="rhome-pipeline-track">
                      <div
                        className={`rhome-pipeline-fill ${stage.key}`}
                        style={{ width: `${percentOfTotal(stage.count)}%` }}
                      ></div>
                    </div>

                  </li>
                ))}
              </ul>
            )}

          </section>

          {/* AI screening note */}
          <section className="rhome-card rhome-note">

            <div className="rhome-note-icon">✨</div>

            <div>
              <h3>AI-Powered Screening</h3>

              <p>
                Run screening on a job's applicants to compare them on
                skills, experience, education and similarity. Candidates
                are ranked automatically by their final score.
              </p>
            </div>

          </section>

        </aside>

      </div>

    </div>
  );
}

export default RecruiterDashboard;