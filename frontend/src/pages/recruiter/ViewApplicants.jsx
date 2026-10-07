import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../services/api";

/* =========================================================
   HELPERS
   ========================================================= */

const getRecommendationClass = (recommendation) => {
  switch (recommendation) {
    case "STRONG_MATCH":
      return "applicant-recommendation strong";

    case "GOOD_MATCH":
      return "applicant-recommendation good";

    case "PARTIAL_MATCH":
      return "applicant-recommendation partial";

    case "LOW_MATCH":
      return "applicant-recommendation low";

    default:
      return "applicant-recommendation";
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
    return "applicant-score high";
  }

  if (value >= 60) {
    return "applicant-score medium";
  }

  return "applicant-score low";
};

const getInitial = (name) => {
  if (!name) {
    return "?";
  }

  return name.charAt(0).toUpperCase();
};

// "SHORTLISTED" -> "Shortlisted"
const getStatusLabel = (status) => {
  if (!status) {
    return "N/A";
  }

  return String(status)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getStatusClass = (status) => {
  const value = String(status || "").toUpperCase();

  if (value === "SHORTLISTED") {
    return "recruiter-status-pill shortlisted";
  }

  if (value === "REJECTED") {
    return "recruiter-status-pill rejected";
  }

  if (value === "SUBMITTED") {
    return "recruiter-status-pill submitted";
  }

  return "recruiter-status-pill";
};

const isSubmittedStatus = (status) =>
  String(status || "").toUpperCase() === "SUBMITTED";

/* =========================================================
   VIEW APPLICANTS PAGE
   ========================================================= */

function ViewApplicants() {
  const { jobId } = useParams();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(jobId || "");
  const [applications, setApplications] = useState([]);
  const [screeningResults, setScreeningResults] = useState([]);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [screeningAll, setScreeningAll] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  const [shortlistingApplicationId, setShortlistingApplicationId] =
    useState(null);

  const [rejectingApplicationId, setRejectingApplicationId] =
    useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Values used by the handlers and the page below
  const selectedJob = jobs.find(
    (job) => String(job.jobId) === String(selectedJobId)
  );

  const submittedApplications = applications.filter((application) =>
    isSubmittedStatus(application.status)
  );

  // =========================================================
  // LOAD RECRUITER JOBS
  // =========================================================

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Authentication is handled by the JWT token.
        // The backend identifies the logged-in recruiter
        // automatically through /jobs/me.
        const data = await api.get("/jobs/me");

        const recruiterJobs = Array.isArray(data) ? data : [];

        console.log("My jobs received from backend:", recruiterJobs);

        setJobs(recruiterJobs);

        // If a jobId is present in the URL,
        // automatically select that job.
        if (jobId) {
          const jobExists = recruiterJobs.some(
            (job) => String(job.jobId) === String(jobId)
          );

          if (jobExists) {
            setSelectedJobId(String(jobId));
          } else {
            setError("The selected job was not found in your job postings.");
            setSelectedJobId("");
          }
        }
      } catch (error) {
        console.error("Failed to load jobs:", error);

        setError(error?.message || "Failed to load your jobs.");
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, [jobId]);

  // =========================================================
  // LOAD APPLICATIONS + SCREENING RESULTS
  // =========================================================

  const loadJobData = async (selectedId) => {
    if (!selectedId) {
      setApplications([]);
      setScreeningResults([]);
      return;
    }

    setApplications([]);
    setScreeningResults([]);
    setError("");
    setMessage("");

    // ----- Load applications -----
    setLoadingApplications(true);

    try {
      const data = await api.get(`/applications/job/${selectedId}`);

      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load applicants:", error);

      setError("Failed to load applicants for this job.");
    } finally {
      setLoadingApplications(false);
    }

    // ----- Load screening results -----
    setLoadingResults(true);

    try {
      const results = await api.get(
        `/screening-results/job/${selectedId}/ranking`
      );

      setScreeningResults(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error("Failed to load screening results:", error);

      setScreeningResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  // =========================================================
  // AUTOMATICALLY LOAD JOB FROM URL
  // =========================================================

  useEffect(() => {
    if (!loadingJobs && selectedJobId) {
      loadJobData(selectedJobId);
    }
  }, [loadingJobs, selectedJobId]);

  // =========================================================
  // MANUAL JOB CHANGE
  // =========================================================

  const handleJobChange = async (event) => {
    const newJobId = event.target.value;

    setSelectedJobId(newJobId);

    if (!newJobId) {
      setApplications([]);
      setScreeningResults([]);
      setError("");
      setMessage("");
      return;
    }

    await loadJobData(newJobId);
  };

  // =========================================================
  // SHORTLIST APPLICATION
  // =========================================================

  const handleShortlist = async (applicationId) => {
    if (!applicationId) {
      return;
    }

    setShortlistingApplicationId(applicationId);
    setError("");
    setMessage("");

    try {
      await api.put(`/applications/${applicationId}/shortlist`, {});

      setMessage("Applicant has been shortlisted successfully.");

      // Refresh applications so the updated
      // SHORTLISTED status is displayed immediately.
      const data = await api.get(`/applications/job/${selectedJobId}`);

      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to shortlist application:", error);

      setError(
        error?.message ||
          "Failed to shortlist the applicant. Please try again."
      );
    } finally {
      setShortlistingApplicationId(null);
    }
  };

  // =========================================================
  // REJECT APPLICATION
  // =========================================================

  const handleReject = async (applicationId) => {
    if (!applicationId) {
      return;
    }

    setRejectingApplicationId(applicationId);
    setError("");
    setMessage("");

    try {
      await api.put(`/applications/${applicationId}/reject`, {});

      setMessage("Applicant has been rejected successfully.");

      // Refresh applications so the updated
      // REJECTED status is displayed immediately.
      const data = await api.get(`/applications/job/${selectedJobId}`);

      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to reject application:", error);

      setError(
        error?.message ||
          "Failed to reject the applicant. Please try again."
      );
    } finally {
      setRejectingApplicationId(null);
    }
  };

  // =========================================================
  // RUN SCREENING FOR ALL SUBMITTED APPLICATIONS
  // =========================================================

  const handleScreenAll = async () => {
    if (!selectedJobId) {
      setError("Please select a job before running screening.");

      return;
    }

    if (submittedApplications.length === 0) {
      setError(
        "There are no submitted applications available for screening."
      );

      return;
    }

    setScreeningAll(true);
    setError("");
    setMessage("");

    try {
      await api.post(`/screening-results/job/${selectedJobId}/screen`, {});

      setMessage(
        `Screening completed successfully for ${
          submittedApplications.length
        } submitted application${
          submittedApplications.length !== 1 ? "s" : ""
        }.`
      );

      // ----- Refresh screening results -----
      setLoadingResults(true);

      try {
        const results = await api.get(
          `/screening-results/job/${selectedJobId}/ranking`
        );

        setScreeningResults(Array.isArray(results) ? results : []);
      } finally {
        setLoadingResults(false);
      }
    } catch (error) {
      console.error("Screening failed:", error);

      setError(error?.message || "Screening failed. Please try again.");
    } finally {
      setScreeningAll(false);
    }
  };

  // =========================================================
  // DOWNLOAD SCREENING RESULTS AS EXCEL
  // =========================================================

  const handleDownloadExcel = async () => {
    if (!selectedJobId) {
      setError("Please select a job before downloading screening results.");

      return;
    }

    if (screeningResults.length === 0) {
      setError("There are no screening results available to download.");

      return;
    }

    setDownloadingExcel(true);
    setError("");
    setMessage("");

    try {
      const blob = await api.download(
        `/screening-results/job/${selectedJobId}/export`
      );

      // Create a temporary URL for the downloaded Excel file.
      const fileUrl = URL.createObjectURL(blob);

      // Create a temporary download link.
      const link = document.createElement("a");

      link.href = fileUrl;

      // Create a safe filename from the selected job title.
      const jobTitle = selectedJob?.title || "Job";

      const safeJobTitle = jobTitle
        .replace(/[^a-z0-9]/gi, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");

      link.download = `${safeJobTitle || "Job"}_Screening_Results.xlsx`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      // Release the temporary object URL.
      setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
      }, 1000);

      setMessage("Screening results downloaded successfully.");
    } catch (error) {
      console.error("Failed to download screening results:", error);

      setError(error?.message || "Failed to download screening results.");
    } finally {
      setDownloadingExcel(false);
    }
  };

  // =========================================================
  // VIEW RESUME
  // =========================================================

  const handleViewResume = async (resumeId) => {
    if (!resumeId) {
      setError("Resume is not available for this applicant.");

      return;
    }

    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Your session has expired. Please log in again.");

        return;
      }

      const response = await fetch(
        `http://localhost:8081/api/resumes/${resumeId}/file`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(errorText || "Unable to open the resume.");
      }

      const blob = await response.blob();

      const fileUrl = URL.createObjectURL(blob);

      window.open(fileUrl, "_blank", "noopener,noreferrer");

      // Give the new tab time to load the file
      // before releasing the temporary object URL.
      setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
      }, 60000);
    } catch (error) {
      console.error("Failed to open resume:", error);

      setError(error?.message || "Failed to open the resume.");
    }
  };

  // =========================================================
  // SHORTLIST / REJECT BUTTONS
  // Used next to the recommendation in the ranking table, and
  // in the applicant list for candidates that are not screened
  // yet (they have no row in the ranking table).
  // =========================================================

  const renderDecisionButtons = (application) => {
    const isShortlisting =
      shortlistingApplicationId === application.applicationId;

    const isRejecting =
      rejectingApplicationId === application.applicationId;

    const busy = isShortlisting || isRejecting;

    return (
      <div className="recruiter-decision-buttons">

        <button
          type="button"
          className="recruiter-decision-button shortlist"
          onClick={() => handleShortlist(application.applicationId)}
          disabled={busy}
        >
          {isShortlisting ? (
            <>
              <span className="button-spinner"></span>
              Shortlisting...
            </>
          ) : (
            <>✓ Shortlist</>
          )}
        </button>

        <button
          type="button"
          className="recruiter-decision-button reject"
          onClick={() => handleReject(application.applicationId)}
          disabled={busy}
        >
          {isRejecting ? (
            <>
              <span className="button-spinner"></span>
              Rejecting...
            </>
          ) : (
            <>✕ Reject</>
          )}
        </button>

      </div>
    );
  };

  // =========================================================
  // LOADING JOBS
  // =========================================================

  if (loadingJobs) {
    return (
      <div className="recruiter-screening-page recruiter-screening-state-page">

        <div className="recruiter-screening-state-card">

          <span className="recruiter-screening-spinner"></span>

          <h2>Loading Your Jobs</h2>

          <p>Please wait while we load your job positions.</p>

        </div>

      </div>
    );
  }

  // =========================================================
  // INITIAL ERROR
  // =========================================================

  if (error && jobs.length === 0) {
    return (
      <div className="recruiter-screening-page recruiter-screening-state-page">

        <div className="recruiter-screening-state-card recruiter-screening-error-card">

          <div className="recruiter-screening-error-icon">!</div>

          <h2>Unable to Load Jobs</h2>

          <p>{error}</p>

        </div>

      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="recruiter-screening-page">

      <div className="recruiter-screening-container">

        {/* =================================================
            HEADER
            ================================================= */}

        <header className="recruiter-screening-header">

          <div className="recruiter-screening-heading">

            <span className="recruiter-screening-eyebrow">
              RECRUITER WORKSPACE
            </span>

            <div className="recruiter-screening-title-row">

              <div className="recruiter-screening-title-icon">👥</div>

              <div>

                <h1>Applicant Screening</h1>

                <p>
                  Review, screen, and rank candidates based on resume
                  compatibility.
                </p>

              </div>

            </div>

          </div>

        </header>

        {/* =================================================
            JOB SELECTOR
            ================================================= */}

        <section className="recruiter-screening-job-selector">

          <div className="recruiter-screening-selector-icon">💼</div>

          <div className="recruiter-screening-selector-content">

            <div>

              <span className="recruiter-screening-section-label">
                JOB POSITION
              </span>

              <h2>{selectedJob ? selectedJob.title : "Select a Job"}</h2>

              <p>
                {selectedJob
                  ? `Viewing applicants for Job #${selectedJob.jobId}.`
                  : "Choose a position to view its applicants and screening results."}
              </p>

            </div>

            <div className="recruiter-screening-select-wrapper">

              <select
                value={selectedJobId}
                onChange={handleJobChange}
                className="recruiter-screening-select"
              >

                <option value="">Select a job position</option>

                {jobs.map((job) => (
                  <option key={job.jobId} value={job.jobId}>
                    {job.title}
                  </option>
                ))}

              </select>

            </div>

          </div>

        </section>

        {/* =================================================
            MESSAGES
            ================================================= */}

        {message && (
          <div className="recruiter-screening-alert recruiter-screening-success">

            <span>✓</span>

            <p>{message}</p>

          </div>
        )}

        {error && (
          <div className="recruiter-screening-alert recruiter-screening-error">

            <span>!</span>

            <p>{error}</p>

          </div>
        )}

        {/* =================================================
            SELECTED JOB CONTENT
            ================================================= */}

        {selectedJobId && (
          <>

            {/* ---------- SUMMARY ---------- */}

            <section className="recruiter-screening-summary">

              <div className="recruiter-screening-summary-card">

                <div className="recruiter-screening-summary-icon applications">
                  👥
                </div>

                <div>
                  <span>Applications</span>

                  <strong>{applications.length}</strong>
                </div>

              </div>

              <div className="recruiter-screening-summary-card">

                <div className="recruiter-screening-summary-icon screened">
                  ✓
                </div>

                <div>
                  <span>Screened</span>

                  <strong>{screeningResults.length}</strong>
                </div>

              </div>

              <div className="recruiter-screening-summary-card">

                <div className="recruiter-screening-summary-icon pending">
                  ⏳
                </div>

                <div>
                  <span>Pending</span>

                  <strong>
                    {Math.max(
                      submittedApplications.length -
                        screeningResults.length,
                      0
                    )}
                  </strong>
                </div>

              </div>

            </section>

            {/* ---------- APPLICANTS ---------- */}

            <section className="recruiter-screening-card">

              <div className="recruiter-screening-card-header">

                <div>

                  <span className="recruiter-screening-section-label">
                    CANDIDATE APPLICATIONS
                  </span>

                  <h2>Applicants</h2>

                  <p>
                    Review candidates and run AI-powered resume screening
                    for this job.
                  </p>

                </div>

                <div className="recruiter-screening-header-actions">

                  {applications.length > 0 && (
                    <span className="recruiter-screening-count">
                      {applications.length} applicant
                      {applications.length !== 1 ? "s" : ""}
                    </span>
                  )}

                  {submittedApplications.length > 0 && (
                    <button
                      type="button"
                      className="recruiter-screen-button"
                      onClick={handleScreenAll}
                      disabled={screeningAll}
                    >
                      {screeningAll ? (
                        <>
                          <span className="button-spinner"></span>
                          Screening All Applicants...
                        </>
                      ) : (
                        <>▶ Run Screening</>
                      )}
                    </button>
                  )}

                </div>

              </div>

              {loadingApplications && (
                <div className="recruiter-screening-loading-inline">

                  <span className="recruiter-screening-spinner small"></span>

                  <span>Loading applicants...</span>

                </div>
              )}

              {!loadingApplications && applications.length === 0 && (
                <div className="recruiter-screening-empty">

                  <div className="recruiter-screening-empty-icon">👥</div>

                  <h3>No Applicants Yet</h3>

                  <p>Applications for this position will appear here.</p>

                </div>
              )}

              {!loadingApplications && applications.length > 0 && (
                <div className="recruiter-applicant-list">

                  {applications.map((application) => {
                    const existingResult = screeningResults.find(
                      (result) =>
                        String(result.applicationId) ===
                        String(application.applicationId)
                    );

                    const isSubmitted = isSubmittedStatus(
                      application.status
                    );

                    return (
                      <article
                        key={application.applicationId}
                        className="recruiter-applicant-card"
                      >

                        {/* Applicant */}
                        <div className="recruiter-applicant-main">

                          <div className="recruiter-applicant-avatar">
                            👤
                          </div>

                          <div className="recruiter-applicant-identity">

                            <span>
                              APPLICATION #{application.applicationId}
                            </span>

                          </div>

                        </div>

                        {/* Details */}
                        <div className="recruiter-applicant-details">

                          <div>
                            <span>RESUME</span>

                            <strong>#{application.resumeId}</strong>
                          </div>

                          <div>
                            <span>STATUS</span>

                            <span className={getStatusClass(application.status)}>
                              {getStatusLabel(application.status)}
                            </span>
                          </div>

                          <div>
                            <span>APPLIED</span>

                            <strong>
                              {application.appliedAt
                                ? new Date(
                                    application.appliedAt
                                  ).toLocaleDateString()
                                : "N/A"}
                            </strong>
                          </div>

                        </div>

                        {/* Actions */}
                        <div className="recruiter-applicant-actions">

                          {application.resumeId && (
                            <button
                              type="button"
                              className="recruiter-screening-outline-button"
                              onClick={() =>
                                handleViewResume(application.resumeId)
                              }
                            >
                              📄 View Resume
                            </button>
                          )}

                          {existingResult && (
                            <span className="recruiter-screened-badge">
                              ✓ Screened
                            </span>
                          )}

                          {!existingResult && isSubmitted && (
                            <span className="recruiter-screening-pending-badge">
                              Pending Screening
                            </span>
                          )}

                          {/* Candidates that are not screened yet have no
                              row in the ranking table, so their Shortlist /
                              Reject buttons stay here. Screened candidates
                              have them next to the recommendation below. */}
                          {isSubmitted &&
                            !existingResult &&
                            renderDecisionButtons(application)}

                        </div>

                      </article>
                    );
                  })}

                </div>
              )}

            </section>

            {/* ---------- SCREENING RESULTS ---------- */}

            <section className="recruiter-screening-card recruiter-ranking-card">

              <div className="recruiter-screening-card-header">

                <div>

                  <span className="recruiter-screening-section-label">
                    AI SCREENING
                  </span>

                  <h2>Screening Results & Ranking</h2>

                  <p>
                    Candidates ranked according to their overall
                    resume-job compatibility.
                  </p>

                </div>

                <div className="recruiter-screening-header-actions">

                  {screeningResults.length > 0 && (
                    <span className="recruiter-ranking-count">
                      {screeningResults.length} screened
                    </span>
                  )}

                  {screeningResults.length > 0 && (
                    <button
                      type="button"
                      className="recruiter-screening-outline-button"
                      onClick={handleDownloadExcel}
                      disabled={downloadingExcel}
                    >
                      {downloadingExcel ? (
                        <>
                          <span className="button-spinner"></span>
                          Downloading...
                        </>
                      ) : (
                        <>📊 Download Excel</>
                      )}
                    </button>
                  )}

                </div>

              </div>

              {loadingResults && (
                <div className="recruiter-screening-loading-inline">

                  <span className="recruiter-screening-spinner small"></span>

                  <span>Loading screening results...</span>

                </div>
              )}

              {!loadingResults && screeningResults.length === 0 && (
                <div className="recruiter-screening-empty">

                  <div className="recruiter-screening-empty-icon">📊</div>

                  <h3>No Screening Results Yet</h3>

                  <p>
                    Click "Run Screening" above to screen all submitted
                    applicants for this job.
                  </p>

                </div>
              )}

              {!loadingResults && screeningResults.length > 0 && (
                <div className="recruiter-ranking-wrapper">

                  <table className="recruiter-ranking-table">

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

                      {screeningResults.map((result, index) => {
                        // The application this result belongs to
                        const application = applications.find(
                          (item) =>
                            String(item.applicationId) ===
                            String(result.applicationId)
                        );

                        return (
                          <tr key={result.resultId}>

                            {/* RANK */}
                            <td data-label="Rank">

                              <div
                                className={
                                  index === 0
                                    ? "recruiter-rank top"
                                    : "recruiter-rank"
                                }
                              >
                                {index === 0 ? "🥇" : `#${index + 1}`}
                              </div>

                            </td>

                            {/* APPLICANT */}
                            <td data-label="Applicant">

                              <div className="recruiter-ranking-applicant">

                                <div className="recruiter-ranking-avatar">
                                  {getInitial(result.applicantName)}
                                </div>

                                <div>
                                  <strong>
                                    {result.applicantName || "N/A"}
                                  </strong>
                                </div>

                              </div>

                            </td>

                            {/* EMAIL */}
                            <td data-label="Email">

                              <span className="recruiter-ranking-email">
                                {result.applicantEmail || "N/A"}
                              </span>

                            </td>

                            {/* RESUME */}
                            <td data-label="Resume">

                              <div className="recruiter-ranking-resume">

                                <div className="recruiter-ranking-resume-icon">
                                  📄
                                </div>

                                <div>

                                  <strong>
                                    {result.resumeFileName || "N/A"}
                                  </strong>

                                  <small>
                                    Resume ID: {result.resumeId || "N/A"}
                                  </small>

                                  {result.resumeId && (
                                    <button
                                      type="button"
                                      className="recruiter-ranking-resume-button"
                                      onClick={() =>
                                        handleViewResume(result.resumeId)
                                      }
                                    >
                                      View Resume
                                    </button>
                                  )}

                                </div>

                              </div>

                            </td>

                            {/* SIMILARITY */}
                            <td data-label="Similarity">

                              <span
                                className={getScoreClass(
                                  result.similarityScore
                                )}
                              >
                                {Number(result.similarityScore).toFixed(2)}%
                              </span>

                            </td>

                            {/* SKILLS */}
                            <td data-label="Skills">

                              <span
                                className={getScoreClass(result.skillsScore)}
                              >
                                {Number(result.skillsScore).toFixed(2)}%
                              </span>

                            </td>

                            {/* EXPERIENCE */}
                            <td data-label="Experience">

                              <span
                                className={getScoreClass(
                                  result.experienceScore
                                )}
                              >
                                {Number(result.experienceScore).toFixed(2)}%
                              </span>

                            </td>

                            {/* EDUCATION */}
                            <td data-label="Education">

                              <span
                                className={getScoreClass(
                                  result.educationScore
                                )}
                              >
                                {Number(result.educationScore).toFixed(2)}%
                              </span>

                            </td>

                            {/* FINAL SCORE */}
                            <td data-label="Final Score">

                              <div className="recruiter-final-score">
                                {Number(result.finalScore).toFixed(2)}

                                <span>%</span>
                              </div>

                            </td>

                            {/* RECOMMENDATION + SHORTLIST / REJECT */}
                            <td data-label="Recommendation">

                              <div className="recruiter-recommendation-cell">

                                <span
                                  className={getRecommendationClass(
                                    result.recommendation
                                  )}
                                >
                                  {getRecommendationLabel(
                                    result.recommendation
                                  )}
                                </span>

                                {application &&
                                  (isSubmittedStatus(application.status) ? (
                                    renderDecisionButtons(application)
                                  ) : (
                                    <span
                                      className={getStatusClass(
                                        application.status
                                      )}
                                    >
                                      {getStatusLabel(application.status)}
                                    </span>
                                  ))}

                              </div>

                            </td>

                          </tr>
                        );
                      })}

                    </tbody>

                  </table>

                </div>
              )}

            </section>

          </>
        )}

      </div>

    </div>
  );
}

export default ViewApplicants;