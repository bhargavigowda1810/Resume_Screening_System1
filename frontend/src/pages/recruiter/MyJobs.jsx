import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

/* =========================================================
   HELPERS
   ========================================================= */

const formatExperience = (job) => {
  const value = job?.minimumExperience;

  return value !== null && value !== undefined && value !== ""
    ? `${value} years`
    : "Not specified";
};

/* =========================================================
   SMALL REUSABLE COMPONENT
   Turns "Java, Spring Boot, SQL" into skill chips and shows
   only the first few plus a "+N" chip.
   ========================================================= */

function SkillChips({ skills, limit = 5 }) {
  const list = String(skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  if (list.length === 0) {
    return (
      <span className="recruiter-job-no-skills">
        No specific skills mentioned
      </span>
    );
  }

  const visible = list.slice(0, limit);
  const hiddenCount = list.length - visible.length;

  return (
    <>
      {visible.map((skill, index) => (
        <span key={`${skill}-${index}`} className="recruiter-job-skill">
          {skill}
        </span>
      ))}

      {hiddenCount > 0 && (
        <span className="recruiter-job-skill recruiter-job-skill-more">
          +{hiddenCount}
        </span>
      )}
    </>
  );
}

/* =========================================================
   MY JOBS PAGE
   ========================================================= */

function MyJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingJobId, setDeletingJobId] = useState(null);

  /* ---------- Load the recruiter's jobs ---------- */
  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const data = await api.get("/jobs/me");

        console.log("My jobs received from backend:", data);

        setJobs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load jobs:", error);

        setError(error?.message || "Failed to load your jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobs();
  }, []);

  /* =====================================================
     DELETE JOB
     ===================================================== */

  const handleDeleteJob = async (job) => {
    // FIRST ALERT: remind the recruiter to download the results
    const downloadReminder = window.confirm(
      "⚠️ Before deleting this job, please make sure you have downloaded the Screening Results Excel file.\n\n" +
        "Once this job is deleted, its applications and screening results will no longer be available.\n\n" +
        "Have you downloaded the Screening Results Excel file?\n\n" +
        "Click OK to continue with deletion or Cancel to keep the job."
    );

    if (!downloadReminder) {
      return;
    }

    // SECOND ALERT: final deletion confirmation
    const finalConfirmation = window.confirm(
      `Are you sure you want to permanently delete the job "${job.title}"?\n\n` +
        "This will delete the job, its applications, and its screening results.\n\n" +
        "This action cannot be undone."
    );

    if (!finalConfirmation) {
      return;
    }

    // Prevent duplicate delete clicks
    setDeletingJobId(job.jobId);

    try {
      // Delete job from backend
      await api.delete(`/jobs/${job.jobId}`);

      // Remove deleted job from the current UI
      setJobs((currentJobs) =>
        currentJobs.filter((currentJob) => currentJob.jobId !== job.jobId)
      );

      console.log(`Job ${job.jobId} deleted successfully.`);
    } catch (error) {
      console.error("Failed to delete job:", error);

      window.alert(
        error?.message || "Failed to delete the job. Please try again."
      );
    } finally {
      setDeletingJobId(null);
    }
  };

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <div className="recruiter-jobs-page recruiter-jobs-state-page">
        <div className="recruiter-jobs-state-card">
          <span className="recruiter-jobs-spinner"></span>

          <h2>Loading Your Jobs</h2>

          <p>Please wait while we load your job postings.</p>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
     ===================================================== */

  if (error) {
    return (
      <div className="recruiter-jobs-page recruiter-jobs-state-page">
        <div className="recruiter-jobs-state-card recruiter-jobs-error-card">

          <div className="recruiter-jobs-state-icon">!</div>

          <h2>Unable to Load Jobs</h2>

          <p>{error}</p>

          <button
            type="button"
            className="recruiter-jobs-primary-button"
            onClick={() => navigate("/recruiter")}
          >
            Back to Dashboard
          </button>

        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <div className="recruiter-jobs-page">

      <div className="recruiter-jobs-container">

        {/* =================================================
            PAGE HEADER
            ================================================= */}

        <header className="recruiter-jobs-header">

          <div className="recruiter-jobs-heading-group">

            <span className="recruiter-jobs-eyebrow">
              RECRUITER WORKSPACE
            </span>

            <h1>My Jobs</h1>

            <p>View and manage the job positions you have created.</p>

          </div>

          <div className="recruiter-jobs-header-actions">

            {/* GENERAL VIEW APPLICANTS */}
            <button
              type="button"
              className="recruiter-jobs-secondary-button"
              onClick={() => navigate("/recruiter/applicants")}
            >
              <span>👥</span>

              View Applicants
            </button>

            {/* CREATE JOB */}
            <button
              type="button"
              className="recruiter-jobs-primary-button"
              onClick={() => navigate("/recruiter/create-job")}
            >
              <span>＋</span>

              Create Job
            </button>

          </div>

        </header>

        {/* =================================================
            SUMMARY BAR
            ================================================= */}

        <section className="recruiter-jobs-summary">

          <div className="recruiter-jobs-summary-icon">💼</div>

          <div>

            <strong>{jobs.length}</strong>

            <span>
              {jobs.length === 1 ? " Job Created" : " Jobs Created"}
            </span>

          </div>

          <div className="recruiter-jobs-summary-divider"></div>

          <p>Your published job openings are listed below.</p>

        </section>

        {/* =================================================
            NO JOBS
            ================================================= */}

        {jobs.length === 0 ? (

          <div className="recruiter-jobs-empty-card">

            <div className="recruiter-jobs-empty-icon">💼</div>

            <span className="recruiter-jobs-empty-label">
              NO JOB POSTINGS
            </span>

            <h2>No Jobs Created Yet</h2>

            <p>
              Create your first job posting to start receiving
              applications from candidates.
            </p>

            <button
              type="button"
              className="recruiter-jobs-primary-button"
              onClick={() => navigate("/recruiter/create-job")}
            >
              <span>＋</span>

              Create Your First Job
            </button>

          </div>

        ) : (

          /* =================================================
             JOB GRID
             ================================================= */

          <div className="recruiter-jobs-grid">

            {jobs.map((job) => (

              <article key={job.jobId} className="recruiter-job-card">

                {/* ---------- Card header ---------- */}
                <div className="recruiter-job-card-header">

                  <div className="recruiter-job-title-area">

                    <div className="recruiter-job-icon">💼</div>

                    <div>

                      <h2>{job.title}</h2>

                      <p>Job ID: #{job.jobId}</p>

                    </div>

                  </div>

                  <span className="recruiter-job-status">Active</span>

                </div>

                {/* ---------- Location ---------- */}
                <div className="recruiter-job-location">

                  <span>📍</span>

                  <span>{job.location || "Location not specified"}</span>

                </div>

                {/* ---------- Description ---------- */}
                <div className="recruiter-job-section">

                  <span className="recruiter-job-section-label">
                    JOB DESCRIPTION
                  </span>

                  <p className="recruiter-job-description">
                    {job.description || "No description provided."}
                  </p>

                </div>

                {/* ---------- Skills ---------- */}
                <div className="recruiter-job-section">

                  <span className="recruiter-job-section-label">
                    REQUIRED SKILLS
                  </span>

                  <div className="recruiter-job-skills">

                    <SkillChips skills={job.requiredSkills} />

                  </div>

                </div>

                {/* ---------- Job details ---------- */}
                <div className="recruiter-job-details">

                  <div className="recruiter-job-detail">

                    <span className="recruiter-job-detail-icon">◷</span>

                    <div>

                      <span className="recruiter-job-detail-label">
                        EXPERIENCE
                      </span>

                      <strong>{formatExperience(job)}</strong>

                    </div>

                  </div>

                  <div className="recruiter-job-detail">

                    <span className="recruiter-job-detail-icon">🎓</span>

                    <div>

                      <span className="recruiter-job-detail-label">
                        EDUCATION
                      </span>

                      <strong>
                        {job.educationRequirement || "Not specified"}
                      </strong>

                    </div>

                  </div>

                </div>

                {/* ---------- Card footer ---------- */}
                <div className="recruiter-job-card-footer">

                  {/* VIEW APPLICANTS */}
                  <button
                    type="button"
                    className="recruiter-job-action recruiter-job-action-primary"
                    onClick={() =>
                      navigate(`/recruiter/applicants/${job.jobId}`)
                    }
                  >

                    <span>👥</span>

                    View Applicants

                    <span className="recruiter-job-arrow">→</span>

                  </button>

                  {/* DELETE JOB */}
                  <button
                    type="button"
                    className="recruiter-job-action recruiter-job-action-danger"
                    onClick={() => handleDeleteJob(job)}
                    disabled={deletingJobId === job.jobId}
                  >

                    <span>
                      {deletingJobId === job.jobId ? "⏳" : "🗑️"}
                    </span>

                    {deletingJobId === job.jobId
                      ? "Deleting..."
                      : "Delete Job"}

                  </button>

                </div>

              </article>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default MyJobs;