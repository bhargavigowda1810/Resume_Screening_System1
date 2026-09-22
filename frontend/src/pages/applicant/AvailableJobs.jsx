import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

function AvailableJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await api.get("/jobs");
        setJobs(data);
      } catch (error) {
        console.error("Failed to load jobs:", error);
        setError("Failed to load available jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  /* Prevent background scrolling when modal is open */
  useEffect(() => {
    if (selectedJob) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedJob]);

  /* Close modal with Escape key */
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedJob(null);
      }
    };

    if (selectedJob) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [selectedJob]);

  const handleApply = (jobId) => {
    setSelectedJob(null);
    navigate(`/applicant/apply/${jobId}`);
  };

  const handleCardKeyDown = (event, job) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedJob(job);
    }
  };

  if (loading) {
    return (
      <div className="available-jobs-page">
        <div className="available-jobs-loading">
          <div className="available-jobs-spinner"></div>

          <h2>Loading available jobs</h2>

          <p>Please wait while we load the latest opportunities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="available-jobs-page">
        <div className="available-jobs-error">
          <div className="available-jobs-error-icon">!</div>

          <span>JOBS</span>

          <h2>Unable to load jobs</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => navigate("/applicant")}
            className="available-jobs-dashboard-btn"
          >
            ← Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="available-jobs-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="available-jobs-header">

        <div className="available-jobs-header-content">

          <span className="available-jobs-eyebrow">
            OPPORTUNITIES
          </span>

          <h1>
            Find Your Next <span>Opportunity</span>
          </h1>

          <p>
            Explore available jobs and discover opportunities that
            match your skills, education and experience.
          </p>

        </div>

        <button
          type="button"
          className="available-jobs-back-btn"
          onClick={() => navigate("/applicant")}
        >
          <span>←</span>
          Dashboard
        </button>

      </header>


      {/* =====================================================
          SUMMARY
          ===================================================== */}

      <div className="available-jobs-summary">

        <div className="available-jobs-summary-left">

          <div className="available-jobs-summary-icon">
            💼
          </div>

          <div>
            <span>AVAILABLE POSITIONS</span>

            <strong>{jobs.length}</strong>
          </div>

        </div>

        <div className="available-jobs-summary-right">

          <span className="available-jobs-status-dot"></span>

          <p>
            {jobs.length > 0
              ? "Currently accepting applications"
              : "No current openings"}
          </p>

        </div>

      </div>


      {/* =====================================================
          JOB SECTION
          ===================================================== */}

      <section className="available-jobs-section">

        <div className="available-jobs-section-header">

          <div>
            <span>EXPLORE OPPORTUNITIES</span>

            <h2>Available Jobs</h2>
          </div>

          <div className="available-jobs-count">
            {jobs.length} {jobs.length === 1 ? "Job" : "Jobs"}
          </div>

        </div>


        {/* =================================================
            EMPTY STATE
            ================================================= */}

        {jobs.length === 0 ? (
          <div className="available-jobs-empty">

            <div className="available-jobs-empty-icon">
              💼
            </div>

            <span>NO OPEN POSITIONS</span>

            <h2>No jobs available</h2>

            <p>
              There are currently no job opportunities available.
              Please check again later for new openings.
            </p>

          </div>
        ) : (

          /* =================================================
             JOB GRID
             ================================================= */

          <div className="available-jobs-grid">

            {jobs.map((job) => (

              <article
                className="available-job-card"
                key={job.jobId}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedJob(job)}
                onKeyDown={(event) =>
                  handleCardKeyDown(event, job)
                }
                aria-label={`View details for ${job.title}`}
              >

                {/* Card Header */}
                <div className="available-job-card-header">

                  <div className="available-job-icon">
                    💼
                  </div>

                  <div className="available-job-heading">

                    <span className="available-job-id">
                      JOB #{job.jobId}
                    </span>

                    <h2>{job.title}</h2>

                  </div>

                </div>


                {/* Basic Details */}

                <div className="available-job-basic-details">

                  <div className="available-job-basic-item">

                    <span>📍</span>

                    <div>
                      <small>LOCATION</small>

                      <strong>
                        {job.location || "Not specified"}
                      </strong>
                    </div>

                  </div>


                  <div className="available-job-basic-item">

                    <span>💼</span>

                    <div>
                      <small>EXPERIENCE</small>

                      <strong>
                        {job.minimumExperience !== null &&
                        job.minimumExperience !== undefined &&
                        job.minimumExperience !== ""
                          ? `${job.minimumExperience} years`
                          : "Not specified"}
                      </strong>
                    </div>

                  </div>

                </div>


                {/* Education */}

                <div className="available-job-education">

                  <span>🎓</span>

                  <div>

                    <small>EDUCATION</small>

                    <strong>
                      {job.educationRequirement ||
                        "Not specified"}
                    </strong>

                  </div>

                </div>


                {/* Skills Preview */}

                <div className="available-job-skills">

                  <small>REQUIRED SKILLS</small>

                  <p>
                    {job.requiredSkills ||
                      "No specific skills mentioned."}
                  </p>

                </div>


                {/* View Details */}

                <div className="available-job-view-details">

                  <span>
                    Click to view full job details
                  </span>

                  <strong>→</strong>

                </div>

              </article>

            ))}

          </div>
        )}

      </section>


      {/* =====================================================
          JOB DETAILS MODAL
          ===================================================== */}

      {selectedJob && (

        <div
          className="job-details-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedJob(null);
            }
          }}
          role="presentation"
        >

          <div
            className="job-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-details-title"
          >

            {/* Modal Header */}

            <div className="job-details-modal-header">

              <div className="job-details-modal-title">

                <div className="job-details-modal-icon">
                  💼
                </div>

                <div>

                  <span>
                    JOB #{selectedJob.jobId}
                  </span>

                  <h2 id="job-details-title">
                    {selectedJob.title}
                  </h2>

                </div>

              </div>


              <button
                type="button"
                className="job-details-close-btn"
                onClick={() => setSelectedJob(null)}
                aria-label="Close job details"
              >
                ×
              </button>

            </div>


            {/* Quick Information */}

            <div className="job-details-quick-info">

              <div>

                <span>📍</span>

                <div>
                  <small>LOCATION</small>

                  <strong>
                    {selectedJob.location ||
                      "Not specified"}
                  </strong>
                </div>

              </div>


              <div>

                <span>💼</span>

                <div>
                  <small>EXPERIENCE</small>

                  <strong>
                    {selectedJob.minimumExperience !== null &&
                    selectedJob.minimumExperience !== undefined &&
                    selectedJob.minimumExperience !== ""
                      ? `${selectedJob.minimumExperience} years`
                      : "Not specified"}
                  </strong>
                </div>

              </div>


              <div>

                <span>🎓</span>

                <div>
                  <small>EDUCATION</small>

                  <strong>
                    {selectedJob.educationRequirement ||
                      "Not specified"}
                  </strong>
                </div>

              </div>

            </div>


            {/* Modal Body */}

            <div className="job-details-modal-body">

              {/* Full Description */}

              <section className="job-details-content-section">

                <span className="job-details-content-label">
                  JOB DESCRIPTION
                </span>

                <p className="job-details-full-description">
                  {selectedJob.description ||
                    "No job description provided."}
                </p>

              </section>


              {/* Full Skills */}

              <section className="job-details-content-section">

                <span className="job-details-content-label">
                  REQUIRED SKILLS
                </span>

                <div className="job-details-skills-box">

                  {selectedJob.requiredSkills ||
                    "No specific skills mentioned."}

                </div>

              </section>


              {/* Information */}

              <section className="job-details-content-section">

                <span className="job-details-content-label">
                  JOB INFORMATION
                </span>

                <div className="job-details-information-grid">

                  <div>
                    <small>JOB ID</small>

                    <strong>
                      #{selectedJob.jobId}
                    </strong>
                  </div>


                  <div>
                    <small>LOCATION</small>

                    <strong>
                      {selectedJob.location ||
                        "Not specified"}
                    </strong>
                  </div>


                  <div>
                    <small>EXPERIENCE</small>

                    <strong>
                      {selectedJob.minimumExperience !== null &&
                      selectedJob.minimumExperience !== undefined &&
                      selectedJob.minimumExperience !== ""
                        ? `${selectedJob.minimumExperience} years`
                        : "Not specified"}
                    </strong>
                  </div>


                  <div>
                    <small>EDUCATION</small>

                    <strong>
                      {selectedJob.educationRequirement ||
                        "Not specified"}
                    </strong>
                  </div>

                </div>

              </section>

            </div>


            {/* Modal Footer */}

            <div className="job-details-modal-footer">

              <button
                type="button"
                className="job-details-cancel-btn"
                onClick={() => setSelectedJob(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="job-details-apply-btn"
                onClick={() => handleApply(selectedJob.jobId)}
              >
                Apply for this Job
                <span>→</span>
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AvailableJobs;