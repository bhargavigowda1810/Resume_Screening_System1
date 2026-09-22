import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../services/api";

function ViewApplicants() {
  const { jobId } = useParams();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(jobId || "");
  const [applications, setApplications] = useState([]);
  const [screeningResults, setScreeningResults] = useState([]);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [screeningApplicationId, setScreeningApplicationId] =
    useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


  // =========================================================
  // LOAD RECRUITER JOBS
  // =========================================================

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const user = JSON.parse(
          localStorage.getItem("user")
        );

        if (!user?.userId) {
          setError(
            "Recruiter information not found. Please login again."
          );
          return;
        }

        const data = await api.get(
          `/jobs/recruiter/${user.userId}`
        );

        setJobs(data);

        /*
         * If a jobId is present in the URL,
         * automatically select that job.
         */
        if (jobId) {
          const jobExists = data.some(
            (job) => String(job.jobId) === String(jobId)
          );

          if (jobExists) {
            setSelectedJobId(String(jobId));
          } else {
            setError(
              "The selected job was not found in your job postings."
            );
            setSelectedJobId("");
          }
        }
      } catch (error) {
        console.error(
          "Failed to load jobs:",
          error
        );

        setError("Failed to load your jobs.");
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

    // -------------------------------------------------------
    // LOAD APPLICATIONS
    // -------------------------------------------------------

    setLoadingApplications(true);

    try {
      const data = await api.get(
        `/applications/job/${selectedId}`
      );

      setApplications(data);
    } catch (error) {
      console.error(
        "Failed to load applicants:",
        error
      );

      setError(
        "Failed to load applicants for this job."
      );
    } finally {
      setLoadingApplications(false);
    }


    // -------------------------------------------------------
    // LOAD SCREENING RESULTS
    // -------------------------------------------------------

    setLoadingResults(true);

    try {
      const results = await api.get(
        `/screening-results/job/${selectedId}/ranking`
      );

      setScreeningResults(results);
    } catch (error) {
      console.error(
        "Failed to load screening results:",
        error
      );

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
  // RUN SCREENING
  // =========================================================

  const handleScreening = async (applicationId) => {
    setScreeningApplicationId(applicationId);
    setError("");
    setMessage("");

    try {
      await api.post(
        `/screening/application/${applicationId}`,
        {}
      );

      setMessage(
        `Screening completed successfully for Application ${applicationId}.`
      );

      if (selectedJobId) {
        const results = await api.get(
          `/screening-results/job/${selectedJobId}/ranking`
        );

        setScreeningResults(results);
      }
    } catch (error) {
      console.error(
        "Screening failed:",
        error
      );

      setError(
        `Screening failed for Application ${applicationId}.`
      );
    } finally {
      setScreeningApplicationId(null);
    }
  };


  // =========================================================
  // VIEW RESUME
  // =========================================================

  const handleViewResume = (resumeId) => {
    if (!resumeId) {
      setError(
        "Resume is not available for this applicant."
      );

      return;
    }

    const resumeUrl =
      `http://localhost:8081/api/resumes/${resumeId}/file`;

    window.open(
      resumeUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };


  // =========================================================
  // HELPERS
  // =========================================================

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

    return name
      .charAt(0)
      .toUpperCase();
  };


  // =========================================================
  // LOADING JOBS
  // =========================================================

  if (loadingJobs) {
    return (
      <div className="recruiter-screening-page recruiter-screening-state-page">

        <div className="recruiter-screening-state-card">

          <span className="recruiter-screening-spinner"></span>

          <h2>
            Loading Your Jobs
          </h2>

          <p>
            Please wait while we load your job positions.
          </p>

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

          <div className="recruiter-screening-error-icon">
            !
          </div>

          <h2>
            Unable to Load Jobs
          </h2>

          <p>
            {error}
          </p>

        </div>

      </div>
    );
  }


  // =========================================================
  // SELECTED JOB
  // =========================================================

  const selectedJob = jobs.find(
    (job) =>
      String(job.jobId) === String(selectedJobId)
  );


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

              <div className="recruiter-screening-title-icon">
                👥
              </div>

              <div>

                <h1>
                  Applicant Screening
                </h1>

                <p>
                  Review, screen, and rank candidates based
                  on resume compatibility.
                </p>

              </div>

            </div>

          </div>

        </header>


        {/* =================================================
            JOB SELECTOR
            ================================================= */}

        <section className="recruiter-screening-job-selector">

          <div className="recruiter-screening-selector-icon">
            💼
          </div>

          <div className="recruiter-screening-selector-content">

            <div>

              <span className="recruiter-screening-section-label">
                JOB POSITION
              </span>

              <h2>
                {selectedJob
                  ? selectedJob.title
                  : "Select a Job"}
              </h2>

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

                <option value="">
                  Select a job position
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

          </div>

        </section>


        {/* =================================================
            MESSAGES
            ================================================= */}

        {message && (
          <div className="recruiter-screening-alert recruiter-screening-success">

            <span>
              ✓
            </span>

            <p>
              {message}
            </p>

          </div>
        )}

        {error && (
          <div className="recruiter-screening-alert recruiter-screening-error">

            <span>
              !
            </span>

            <p>
              {error}
            </p>

          </div>
        )}


        {/* =================================================
            SELECTED JOB CONTENT
            ================================================= */}

        {selectedJobId && (
          <>

            {/* =================================================
                SUMMARY
                ================================================= */}

            <section className="recruiter-screening-summary">

              <div className="recruiter-screening-summary-card">

                <div className="recruiter-screening-summary-icon applications">
                  👥
                </div>

                <div>

                  <span>
                    Applications
                  </span>

                  <strong>
                    {applications.length}
                  </strong>

                </div>

              </div>


              <div className="recruiter-screening-summary-card">

                <div className="recruiter-screening-summary-icon screened">
                  ✓
                </div>

                <div>

                  <span>
                    Screened
                  </span>

                  <strong>
                    {screeningResults.length}
                  </strong>

                </div>

              </div>


              <div className="recruiter-screening-summary-card">

                <div className="recruiter-screening-summary-icon pending">
                  ⏳
                </div>

                <div>

                  <span>
                    Pending
                  </span>

                  <strong>
                    {Math.max(
                      applications.length -
                        screeningResults.length,
                      0
                    )}
                  </strong>

                </div>

              </div>

            </section>


            {/* =================================================
                APPLICANTS
                ================================================= */}

            <section className="recruiter-screening-card">

              <div className="recruiter-screening-card-header">

                <div>

                  <span className="recruiter-screening-section-label">
                    CANDIDATE APPLICATIONS
                  </span>

                  <h2>
                    Applicants
                  </h2>

                  <p>
                    Review candidates and run AI-powered
                    resume screening.
                  </p>

                </div>

                {applications.length > 0 && (
                  <span className="recruiter-screening-count">

                    {applications.length} applicant
                    {applications.length !== 1
                      ? "s"
                      : ""}

                  </span>
                )}

              </div>


              {loadingApplications && (
                <div className="recruiter-screening-loading-inline">

                  <span className="recruiter-screening-spinner small"></span>

                  <span>
                    Loading applicants...
                  </span>

                </div>
              )}


              {!loadingApplications &&
                applications.length === 0 && (

                  <div className="recruiter-screening-empty">

                    <div className="recruiter-screening-empty-icon">
                      👥
                    </div>

                    <h3>
                      No Applicants Yet
                    </h3>

                    <p>
                      Applications for this position
                      will appear here.
                    </p>

                  </div>

                )}


              {!loadingApplications &&
                applications.length > 0 && (

                  <div className="recruiter-applicant-list">

                    {applications.map((application) => {

                      const existingResult =
                        screeningResults.find(
                          (result) =>
                            result.applicationId ===
                            application.applicationId
                        );

                      return (
                        <article
                          key={application.applicationId}
                          className="recruiter-applicant-card"
                        >

                          {/* =================================
                              APPLICANT
                              ================================= */}

                          <div className="recruiter-applicant-main">

                            <div className="recruiter-applicant-avatar">
                              👤
                            </div>

                            <div className="recruiter-applicant-identity">

                              <span>
                                APPLICATION #
                                {application.applicationId}
                              </span>

                              <h3>
                                Applicant{" "}
                                {application.applicantId}
                              </h3>

                              <p>
                                Applicant ID:{" "}
                                <strong>
                                  {application.applicantId}
                                </strong>
                              </p>

                            </div>

                          </div>


                          {/* =================================
                              DETAILS
                              ================================= */}

                          <div className="recruiter-applicant-details">

                            <div>

                              <span>
                                RESUME
                              </span>

                              <strong>
                                #{application.resumeId}
                              </strong>

                            </div>

                            <div>

                              <span>
                                STATUS
                              </span>

                              <strong className="recruiter-applicant-status">
                                {application.status}
                              </strong>

                            </div>

                            <div>

                              <span>
                                APPLIED
                              </span>

                              <strong>
                                {application.appliedAt
                                  ? new Date(
                                      application.appliedAt
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </strong>

                            </div>

                          </div>


                          {/* =================================
                              ACTIONS
                              ================================= */}

                          <div className="recruiter-applicant-actions">

                            {application.resumeId && (
                              <button
                                type="button"
                                className="recruiter-screening-outline-button"
                                onClick={() =>
                                  handleViewResume(
                                    application.resumeId
                                  )
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

                            <button
                              type="button"
                              className="recruiter-screen-button"
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
                                ? (
                                  <>
                                    <span className="button-spinner"></span>
                                    Screening...
                                  </>
                                )
                                : existingResult
                                ? "Run Again"
                                : "Run Screening"}

                            </button>

                          </div>

                        </article>
                      );
                    })}

                  </div>

                )}

            </section>


            {/* =================================================
                SCREENING RESULTS
                ================================================= */}

            <section className="recruiter-screening-card recruiter-ranking-card">

              <div className="recruiter-screening-card-header">

                <div>

                  <span className="recruiter-screening-section-label">
                    AI SCREENING
                  </span>

                  <h2>
                    Screening Results & Ranking
                  </h2>

                  <p>
                    Candidates ranked according to their
                    overall resume-job compatibility.
                  </p>

                </div>

                {screeningResults.length > 0 && (
                  <span className="recruiter-ranking-count">
                    {screeningResults.length} screened
                  </span>
                )}

              </div>


              {loadingResults && (
                <div className="recruiter-screening-loading-inline">

                  <span className="recruiter-screening-spinner small"></span>

                  <span>
                    Loading screening results...
                  </span>

                </div>
              )}


              {!loadingResults &&
                screeningResults.length === 0 && (

                  <div className="recruiter-screening-empty">

                    <div className="recruiter-screening-empty-icon">
                      📊
                    </div>

                    <h3>
                      No Screening Results Yet
                    </h3>

                    <p>
                      Run screening for an applicant to
                      generate the ranking.
                    </p>

                  </div>

                )}


              {!loadingResults &&
                screeningResults.length > 0 && (

                  <div className="recruiter-ranking-wrapper">

                    <table className="recruiter-ranking-table">

                      <thead>

                        <tr>

                          <th>
                            Rank
                          </th>

                          <th>
                            Applicant
                          </th>

                          <th>
                            Email
                          </th>

                          <th>
                            Resume
                          </th>

                          <th>
                            Similarity
                          </th>

                          <th>
                            Skills
                          </th>

                          <th>
                            Experience
                          </th>

                          <th>
                            Education
                          </th>

                          <th>
                            Final Score
                          </th>

                          <th>
                            Recommendation
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {screeningResults.map(
                          (result, index) => (

                            <tr
                              key={result.resultId}
                            >

                              {/* RANK */}

                              <td>

                                <div
                                  className={
                                    index === 0
                                      ? "recruiter-rank top"
                                      : "recruiter-rank"
                                  }
                                >
                                  {index === 0
                                    ? "🥇"
                                    : `#${index + 1}`}
                                </div>

                              </td>


                              {/* APPLICANT */}

                              <td>

                                <div className="recruiter-ranking-applicant">

                                  <div className="recruiter-ranking-avatar">
                                    {getInitial(
                                      result.applicantName
                                    )}
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


                              {/* EMAIL */}

                              <td>

                                <span className="recruiter-ranking-email">
                                  {result.applicantEmail ||
                                    "N/A"}
                                </span>

                              </td>


                              {/* RESUME */}

                              <td>

                                <div className="recruiter-ranking-resume">

                                  <div className="recruiter-ranking-resume-icon">
                                    📄
                                  </div>

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

                                    {result.resumeId && (
                                      <button
                                        type="button"
                                        className="recruiter-ranking-resume-button"
                                        onClick={() =>
                                          handleViewResume(
                                            result.resumeId
                                          )
                                        }
                                      >
                                        View Resume
                                      </button>
                                    )}

                                  </div>

                                </div>

                              </td>


                              {/* SIMILARITY */}

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


                              {/* SKILLS */}

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


                              {/* EXPERIENCE */}

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


                              {/* EDUCATION */}

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


                              {/* FINAL SCORE */}

                              <td>

                                <div className="recruiter-final-score">

                                  {Number(
                                    result.finalScore
                                  ).toFixed(2)}

                                  <span>
                                    %
                                  </span>

                                </div>

                              </td>


                              {/* RECOMMENDATION */}

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

            </section>

          </>
        )}

      </div>

    </div>
  );
}

export default ViewApplicants;

