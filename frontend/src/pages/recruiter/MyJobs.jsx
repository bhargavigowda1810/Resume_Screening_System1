import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

function MyJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user?.userId) {
          setError(
            "Recruiter information not found. Please login again."
          );
          return;
        }

        const data = await api.get(
          `/jobs/recruiter/${user.userId}`
        );

        console.log(
          "Jobs received from backend:",
          data
        );

        setJobs(data);
      } catch (error) {
        console.error(
          "Failed to load jobs:",
          error
        );

        setError("Failed to load your jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobs();
  }, []);


  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <div className="recruiter-jobs-page recruiter-jobs-state-page">

        <div className="recruiter-jobs-state-card">

          <span className="recruiter-jobs-spinner"></span>

          <h2>
            Loading Your Jobs
          </h2>

          <p>
            Please wait while we load your job postings.
          </p>

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

          <div className="recruiter-jobs-state-icon">
            !
          </div>

          <h2>
            Unable to Load Jobs
          </h2>

          <p>
            {error}
          </p>

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

            <h1>
              My Jobs
            </h1>

            <p>
              View and manage the job positions you
              have created.
            </p>

          </div>


          <div className="recruiter-jobs-header-actions">

            {/* GENERAL VIEW APPLICANTS */}

            <button
              type="button"
              className="recruiter-jobs-secondary-button"
              onClick={() =>
                navigate("/recruiter/applicants")
              }
            >
              <span>
                👥
              </span>

              View Applicants
            </button>


            {/* CREATE JOB */}

            <button
              type="button"
              className="recruiter-jobs-primary-button"
              onClick={() =>
                navigate("/recruiter/create-job")
              }
            >
              <span>
                ＋
              </span>

              Create Job
            </button>

          </div>

        </header>


        {/* =================================================
            SUMMARY BAR
            ================================================= */}

        <section className="recruiter-jobs-summary">

          <div className="recruiter-jobs-summary-icon">
            💼
          </div>

          <div>

            <strong>
              {jobs.length}
            </strong>

            <span>
              {jobs.length === 1
                ? " Job Created"
                : " Jobs Created"}
            </span>

          </div>

          <div className="recruiter-jobs-summary-divider"></div>

          <p>
            Your published job openings are listed below.
          </p>

        </section>


        {/* =================================================
            NO JOBS
            ================================================= */}

        {jobs.length === 0 ? (

          <div className="recruiter-jobs-empty-card">

            <div className="recruiter-jobs-empty-icon">
              💼
            </div>

            <span className="recruiter-jobs-empty-label">
              NO JOB POSTINGS
            </span>

            <h2>
              No Jobs Created Yet
            </h2>

            <p>
              Create your first job posting to start
              receiving applications from candidates.
            </p>

            <button
              type="button"
              className="recruiter-jobs-primary-button"
              onClick={() =>
                navigate("/recruiter/create-job")
              }
            >
              <span>
                ＋
              </span>

              Create Your First Job
            </button>

          </div>

        ) : (

          /* =================================================
             JOB GRID
             ================================================= */

          <div className="recruiter-jobs-grid">

            {jobs.map((job) => (

              <article
                key={job.jobId}
                className="recruiter-job-card"
              >

                {/* =========================================
                    CARD HEADER
                    ========================================= */}

                <div className="recruiter-job-card-header">

                  <div className="recruiter-job-title-area">

                    <div className="recruiter-job-icon">
                      💼
                    </div>

                    <div>

                      <h2>
                        {job.title}
                      </h2>

                      <p>
                        Job ID: #{job.jobId}
                      </p>

                    </div>

                  </div>

                  <span className="recruiter-job-status">
                    Active
                  </span>

                </div>


                {/* =========================================
                    LOCATION
                    ========================================= */}

                <div className="recruiter-job-location">

                  <span>
                    📍
                  </span>

                  <span>
                    {job.location || "Location not specified"}
                  </span>

                </div>


                {/* =========================================
                    DESCRIPTION
                    ========================================= */}

                <div className="recruiter-job-section">

                  <span className="recruiter-job-section-label">
                    JOB DESCRIPTION
                  </span>

                  <p className="recruiter-job-description">
                    {job.description}
                  </p>

                </div>


                {/* =========================================
                    SKILLS
                    ========================================= */}

                <div className="recruiter-job-section">

                  <span className="recruiter-job-section-label">
                    REQUIRED SKILLS
                  </span>

                  <div className="recruiter-job-skills">

                    {job.requiredSkills
                      ?.split(",")
                      .map((skill, index) => {

                        const cleanedSkill =
                          skill.trim();

                        if (!cleanedSkill) {
                          return null;
                        }

                        return (
                          <span
                            key={index}
                            className="recruiter-job-skill"
                          >
                            {cleanedSkill}
                          </span>
                        );
                      })}

                  </div>

                </div>


                {/* =========================================
                    JOB DETAILS
                    ========================================= */}

                <div className="recruiter-job-details">

                  {/* EXPERIENCE */}

                  <div className="recruiter-job-detail">

                    <span className="recruiter-job-detail-icon">
                      ◷
                    </span>

                    <div>

                      <span className="recruiter-job-detail-label">
                        EXPERIENCE
                      </span>

                      <strong>
                        {job.minimumExperience !== null &&
                        job.minimumExperience !== undefined &&
                        job.minimumExperience !== ""
                          ? `${job.minimumExperience} years`
                          : "Not specified"}
                      </strong>

                    </div>

                  </div>


                  {/* EDUCATION */}

                  <div className="recruiter-job-detail">

                    <span className="recruiter-job-detail-icon">
                      🎓
                    </span>

                    <div>

                      <span className="recruiter-job-detail-label">
                        EDUCATION
                      </span>

                      <strong>
                        {job.educationRequirement
                          ? job.educationRequirement
                          : "Not specified"}
                      </strong>

                    </div>

                  </div>

                </div>


                {/* =========================================
                    CARD FOOTER
                    ========================================= */}

                <div className="recruiter-job-card-footer">

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/recruiter/applicants/${job.jobId}`
                      )
                    }
                  >

                    <span>
                      👥
                    </span>

                    View Applicants

                    <span className="recruiter-job-arrow">
                      →
                    </span>

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
