import { useEffect, useState } from "react";
import { api } from "../../services/api";

function ViewApplicants() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [applications, setApplications] = useState([]);
  const [screeningResults, setScreeningResults] = useState([]);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [screeningApplicationId, setScreeningApplicationId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // =========================================================
  // LOAD RECRUITER JOBS
  // =========================================================

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user?.userId) {
          setError("Recruiter information not found. Please login again.");
          return;
        }

        const data = await api.get(`/jobs/recruiter/${user.userId}`);
        setJobs(data);
      } catch (error) {
        console.error("Failed to load jobs:", error);
        setError("Failed to load your jobs.");
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  // =========================================================
  // LOAD APPLICATIONS + SCREENING RESULTS
  // =========================================================

  const handleJobChange = async (event) => {
    const jobId = event.target.value;

    setSelectedJobId(jobId);
    setApplications([]);
    setScreeningResults([]);
    setError("");
    setMessage("");

    if (!jobId) {
      return;
    }

    // Load applications
    setLoadingApplications(true);

    try {
      const data = await api.get(`/applications/job/${jobId}`);
      setApplications(data);
    } catch (error) {
      console.error("Failed to load applicants:", error);
      setError("Failed to load applicants for this job.");
    } finally {
      setLoadingApplications(false);
    }

    // Load screening results
    setLoadingResults(true);

    try {
      const results = await api.get(
        `/screening-results/job/${jobId}/ranking`
      );

      setScreeningResults(results);
    } catch (error) {
      console.error("Failed to load screening results:", error);
      setScreeningResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  // =========================================================
  // RUN SCREENING
  // =========================================================

  const handleScreening = async (applicationId) => {
    setScreeningApplicationId(applicationId);
    setError("");
    setMessage("");

    try {
      await api.post(`/screening/application/${applicationId}`, {});

      setMessage(
        `Screening completed successfully for Application ${applicationId}.`
      );

      // Refresh ranking
      if (selectedJobId) {
        const results = await api.get(
          `/screening-results/job/${selectedJobId}/ranking`
        );

        setScreeningResults(results);
      }
    } catch (error) {
      console.error("Screening failed:", error);

      setError(
        `Screening failed for Application ${applicationId}.`
      );
    } finally {
      setScreeningApplicationId(null);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loadingJobs) {
    return (
      <div className="screening-page">
        <div className="screening-loading">
          Loading jobs...
        </div>
      </div>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <div className="screening-page">
        <div className="screening-error">
          {error}
        </div>
      </div>
    );
  }

  // =========================================================
  // HELPERS
  // =========================================================

  const getRecommendationClass = (recommendation) => {
    switch (recommendation) {
      case "STRONG_MATCH":
        return "recommendation strong";

      case "GOOD_MATCH":
        return "recommendation good";

      case "PARTIAL_MATCH":
        return "recommendation partial";

      case "LOW_MATCH":
        return "recommendation low";

      default:
        return "recommendation";
    }
  };

  const getRecommendationLabel = (recommendation) => {
    switch (recommendation) {
      case "STRONG_MATCH":
        return "Strong Match";

      case "GOOD_MATCH":
        return "Good Match";

      case "PARTIAL_MATCH":
        return "Partial Match";

      case "LOW_MATCH":
        return "Low Match";

      default:
        return recommendation || "N/A";
    }
  };

  const getScoreClass = (score) => {
    const value = Number(score);

    if (value >= 80) {
      return "score high";
    }

    if (value >= 60) {
      return "score medium";
    }

    return "score low";
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="screening-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="screening-header">
        <div>
          <h1>Applicant Screening</h1>

          <p>
            Review applicants and rank them based on resume-job
            compatibility.
          </p>
        </div>
      </div>

      {/* =====================================================
          JOB SELECTOR
      ===================================================== */}

      <div className="screening-card job-selector-card">

        <div className="card-title">
          <span className="title-icon">💼</span>

          <div>
            <h2>Select Job</h2>
            <p>Choose a job to view its applicants and rankings.</p>
          </div>
        </div>

        <select
          className="job-select"
          value={selectedJobId}
          onChange={handleJobChange}
        >
          <option value="">
            -- Select a job --
          </option>

          {jobs.map((job) => (
            <option
              key={job.jobId}
              value={job.jobId}
            >
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {message && (
        <div className="screening-message success-message">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="screening-message error-message">
          ⚠ {error}
        </div>
      )}

      {/* =====================================================
          APPLICATIONS
      ===================================================== */}

      {selectedJobId && (
        <>
          <div className="screening-summary">

            <div className="summary-card">
              <span className="summary-label">
                Applications
              </span>

              <strong>
                {applications.length}
              </strong>
            </div>

            <div className="summary-card">
              <span className="summary-label">
                Screened
              </span>

              <strong>
                {screeningResults.length}
              </strong>
            </div>

            <div className="summary-card">
              <span className="summary-label">
                Pending
              </span>

              <strong>
                {Math.max(
                  applications.length - screeningResults.length,
                  0
                )}
              </strong>
            </div>

          </div>

          {/* =================================================
              APPLICANT LIST
              ================================================= */}

          <div className="screening-card">

            <div className="section-header">
              <div>
                <h2>Applicants</h2>

                <p>
                  Run screening to calculate each applicant's
                  compatibility score.
                </p>
              </div>
            </div>

            {loadingApplications && (
              <div className="table-message">
                Loading applicants...
              </div>
            )}

            {!loadingApplications &&
              applications.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>

                  <h3>No applicants yet</h3>

                  <p>
                    No applicants have applied for this job yet.
                  </p>
                </div>
              )}

            {!loadingApplications &&
              applications.length > 0 && (
                <div className="applicant-list">

                  {applications.map((application) => {

                    const existingResult =
                      screeningResults.find(
                        (result) =>
                          result.applicationId ===
                          application.applicationId
                      );

                    return (
                      <div
                        className="applicant-card"
                        key={application.applicationId}
                      >

                        <div className="applicant-info">

                          <div className="applicant-avatar">
                            👤
                          </div>

                          <div>
                            <h3>
                              Application #
                              {application.applicationId}
                            </h3>

                            <p>
                              Applicant ID:{" "}
                              {application.applicantId}
                            </p>
                          </div>

                        </div>

                        <div className="application-details">

                          <div>
                            <span>Resume ID</span>
                            <strong>
                              {application.resumeId}
                            </strong>
                          </div>

                          <div>
                            <span>Status</span>
                            <strong>
                              {application.status}
                            </strong>
                          </div>

                          <div>
                            <span>Applied</span>
                            <strong>
                              {application.appliedAt
                                ? new Date(
                                    application.appliedAt
                                  ).toLocaleDateString()
                                : "N/A"}
                            </strong>
                          </div>

                        </div>

                        <div className="applicant-action">

                          {existingResult && (
                            <span className="screened-label">
                              ✓ Screened
                            </span>
                          )}

                          <button
                            className="screen-button"
                            onClick={() =>
                              handleScreening(
                                application.applicationId
                              )
                            }
                            disabled={
                              screeningApplicationId ===
                              application.applicationId
                            }
                          >
                            {screeningApplicationId ===
                            application.applicationId
                              ? "Screening..."
                              : existingResult
                              ? "Run Again"
                              : "Run Screening"}
                          </button>

                        </div>

                      </div>
                    );
                  })}

                </div>
              )}

          </div>

          {/* =================================================
              SCREENING RESULTS
              ================================================= */}

          <div className="screening-card ranking-card">

            <div className="section-header">

              <div>
                <h2>Screening Results & Ranking</h2>

                <p>
                  Applicants ranked by their overall resume-job
                  compatibility.
                </p>
              </div>

              {screeningResults.length > 0 && (
                <div className="ranking-count">
                  {screeningResults.length} screened
                </div>
              )}

            </div>

            {loadingResults && (
              <div className="table-message">
                Loading screening results...
              </div>
            )}

            {!loadingResults &&
              screeningResults.length === 0 && (
                <div className="empty-state">

                  <div className="empty-icon">
                    📊
                  </div>

                  <h3>No screening results yet</h3>

                  <p>
                    Click "Run Screening" above to evaluate
                    applicants.
                  </p>

                </div>
              )}

            {!loadingResults &&
              screeningResults.length > 0 && (

                <div className="ranking-table-wrapper">

                  <table className="ranking-table">

                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Applicant</th>
                        <th>Email</th>
                        <th>Resume</th>
                        <th>Similarity</th>
                        <th>Skills</th>
                        <th>Experience</th>
                        <th>Education</th>
                        <th>Final Score</th>
                        <th>Recommendation</th>
                      </tr>
                    </thead>

                    <tbody>

                      {screeningResults.map(
                        (result, index) => (
                          <tr
                            key={result.resultId}
                          >

                            {/* Rank */}

                            <td>
                              <div className="rank-number">
                                #{index + 1}
                              </div>
                            </td>

                            {/* Applicant */}

                            <td>
                              <div className="table-applicant">

                                <div className="table-avatar">
                                  {result.applicantName
                                    ? result.applicantName
                                        .charAt(0)
                                        .toUpperCase()
                                    : "?"}
                                </div>

                                <div>
                                  <strong>
                                    {result.applicantName ||
                                      "N/A"}
                                  </strong>

                                  <small>
                                    ID:{" "}
                                    {result.applicantId ||
                                      "N/A"}
                                  </small>
                                </div>

                              </div>
                            </td>

                            {/* Email */}

                            <td>
                              <span className="email-text">
                                {result.applicantEmail ||
                                  "N/A"}
                              </span>
                            </td>

                            {/* Resume */}

                            <td>
                              <div className="resume-cell">

                                <span className="resume-icon">
                                  📄
                                </span>

                                <div>
                                  <strong>
                                    {result.resumeFileName ||
                                      "N/A"}
                                  </strong>

                                  <small>
                                    Resume ID:{" "}
                                    {result.resumeId ||
                                      "N/A"}
                                  </small>
                                </div>

                              </div>
                            </td>

                            {/* Similarity */}

                            <td>
                              <span
                                className={getScoreClass(
                                  result.similarityScore
                                )}
                              >
                                {Number(
                                  result.similarityScore
                                ).toFixed(2)}
                                %
                              </span>
                            </td>

                            {/* Skills */}

                            <td>
                              <span
                                className={getScoreClass(
                                  result.skillsScore
                                )}
                              >
                                {Number(
                                  result.skillsScore
                                ).toFixed(2)}
                                %
                              </span>
                            </td>

                            {/* Experience */}

                            <td>
                              <span
                                className={getScoreClass(
                                  result.experienceScore
                                )}
                              >
                                {Number(
                                  result.experienceScore
                                ).toFixed(2)}
                                %
                              </span>
                            </td>

                            {/* Education */}

                            <td>
                              <span
                                className={getScoreClass(
                                  result.educationScore
                                )}
                              >
                                {Number(
                                  result.educationScore
                                ).toFixed(2)}
                                %
                              </span>
                            </td>

                            {/* Final Score */}

                            <td>
                              <div className="final-score">
                                {Number(
                                  result.finalScore
                                ).toFixed(2)}
                                <span>%</span>
                              </div>
                            </td>

                            {/* Recommendation */}

                            <td>
                              <span
                                className={getRecommendationClass(
                                  result.recommendation
                                )}
                              >
                                {getRecommendationLabel(
                                  result.recommendation
                                )}
                              </span>
                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

          </div>

        </>
      )}

    </div>
  );
}

export default ViewApplicants;

