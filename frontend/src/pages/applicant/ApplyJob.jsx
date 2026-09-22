import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api";

function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user?.userId) {
          setMessage("User information not found. Please login again.");
          setMessageType("error");
          return;
        }

        const [jobData, resumeData] = await Promise.all([
          api.get("/jobs"),
          api.get(`/resumes/applicant/${user.userId}`),
        ]);

        console.log("Jobs received:", jobData);
        console.log("Resumes received:", resumeData);

        setJobs(jobData);
        setResumes(resumeData);

        const job = jobData.find(
          (item) => String(item.jobId) === String(jobId)
        );

        console.log("Selected job:", job);

        setSelectedJob(job || null);
      } catch (error) {
        console.error("Failed to load application data:", error);

        setMessage("Failed to load job or resume information.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [jobId]);

  const handleApply = async () => {
    if (!selectedResume) {
      setMessage("Please select a resume before submitting your application.");
      setMessageType("error");
      return;
    }

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setMessage("User information not found. Please login again.");
      setMessageType("error");
      return;
    }

    let user;

    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error("Invalid user information:", error);

      setMessage("Invalid user information. Please login again.");
      setMessageType("error");

      return;
    }

    if (!user?.userId) {
      setMessage("User information not found. Please login again.");
      setMessageType("error");
      return;
    }

    const application = {
      applicantId: user.userId,
      jobId: Number(jobId),
      resumeId: Number(selectedResume),
    };

    console.log("Application being submitted:", application);

    setSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      const result = await api.post("/applications", application);

      console.log("Application submitted:", result);

      setMessage("Application submitted successfully!");
      setMessageType("success");

      setTimeout(() => {
        navigate("/applicant");
      }, 1500);
    } catch (error) {
      console.error("Application failed:", error);

      setMessage(
        "Application failed. You may have already applied for this job."
      );

      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="applicant-apply-page">
        <div className="applicant-apply-loading">
          <div className="applicant-apply-spinner"></div>
          <h2>Loading job details</h2>
          <p>Please wait while we prepare the application.</p>
        </div>
      </div>
    );
  }

  if (!selectedJob) {
    return (
      <div className="applicant-apply-page">
        <div className="applicant-apply-not-found">
          <div className="applicant-apply-not-found-icon">!</div>

          <span className="applicant-apply-eyebrow">
            APPLICATION
          </span>

          <h1>Job Not Found</h1>

          <p>
            The job you are trying to apply for could not be found.
            It may have been removed or is no longer available.
          </p>

          <button
            type="button"
            className="applicant-apply-primary-btn"
            onClick={() => navigate("/applicant/jobs")}
          >
            <span>←</span>
            Back to Available Jobs
          </button>
        </div>
      </div>
    );
  }

  const selectedResumeData = resumes.find(
    (resume) =>
      String(resume.resumeId) === String(selectedResume)
  );

  return (
    <div className="applicant-apply-page">

      {/* ================= TOP HEADER ================= */}

      <header className="applicant-apply-header">

        <div className="applicant-apply-header-content">
          <span className="applicant-apply-eyebrow">
            JOB APPLICATION
          </span>

          <h1>Apply for Job</h1>

          <p>
            Review the opportunity and choose the resume you want
            to submit.
          </p>
        </div>

        <button
          type="button"
          className="applicant-apply-back-btn"
          onClick={() => navigate("/applicant/jobs")}
        >
          <span>←</span>
          Available Jobs
        </button>

      </header>


      {/* ================= JOB SUMMARY BAR ================= */}

      <div className="applicant-apply-job-banner">

        <div className="applicant-apply-banner-icon">
          💼
        </div>

        <div className="applicant-apply-banner-content">

          <span>JOB OPENING #{selectedJob.jobId}</span>

          <h2>{selectedJob.title}</h2>

          <p>
            📍 {selectedJob.location || "Location not specified"}
          </p>

        </div>

        <div className="applicant-apply-banner-status">
          <span className="applicant-apply-status-dot"></span>
          Open Position
        </div>

      </div>


      {/* ================= MAIN CONTENT ================= */}

      <main className="applicant-apply-layout">

        {/* ================= LEFT: JOB DETAILS ================= */}

        <section className="applicant-apply-job-card">

          <div className="applicant-apply-section-heading">
            <div>
              <span>POSITION DETAILS</span>
              <h2>About this opportunity</h2>
            </div>
          </div>


          {/* DESCRIPTION */}

          <div className="applicant-apply-section">

            <h3>
              <span className="applicant-apply-section-icon">
                ≡
              </span>
              Job Description
            </h3>

            <p className="applicant-apply-description">
              {selectedJob.description ||
                "No description available."}
            </p>

          </div>


          {/* SKILLS */}

          <div className="applicant-apply-section">

            <h3>
              <span className="applicant-apply-section-icon">
                ✓
              </span>
              Required Skills
            </h3>

            <div className="applicant-apply-skills">

              {selectedJob.requiredSkills ? (
                selectedJob.requiredSkills
                  .split(",")
                  .map((skill, index) => (
                    <span key={index}>
                      {skill.trim()}
                    </span>
                  ))
              ) : (
                <span className="applicant-apply-no-skill">
                  No specific skills listed
                </span>
              )}

            </div>

          </div>


          {/* JOB INFORMATION */}

          <div className="applicant-apply-info-grid">

            <div className="applicant-apply-info-item">
              <div className="applicant-apply-info-icon">
                🎓
              </div>

              <div>
                <span>Education</span>
                <strong>
                  {selectedJob.educationRequirement ||
                    "Not specified"}
                </strong>
              </div>
            </div>


            <div className="applicant-apply-info-item">
              <div className="applicant-apply-info-icon">
                💼
              </div>

              <div>
                <span>Experience</span>
                <strong>
                  {selectedJob.minimumExperience !== null &&
                  selectedJob.minimumExperience !== undefined &&
                  selectedJob.minimumExperience !== ""
                    ? `${selectedJob.minimumExperience} years`
                    : "Not specified"}
                </strong>
              </div>
            </div>


            <div className="applicant-apply-info-item">
              <div className="applicant-apply-info-icon">
                📍
              </div>

              <div>
                <span>Location</span>
                <strong>
                  {selectedJob.location ||
                    "Not specified"}
                </strong>
              </div>
            </div>

          </div>

        </section>


        {/* ================= RIGHT: APPLICATION ================= */}

        <aside className="applicant-apply-form-card">

          <div className="applicant-apply-form-header">

            <div className="applicant-apply-form-icon">
              📄
            </div>

            <div>
              <span>APPLICATION</span>
              <h2>Your Application</h2>
              <p>
                Select the resume you want to submit.
              </p>
            </div>

          </div>


          {/* ================= NO RESUME ================= */}

          {resumes.length === 0 ? (

            <div className="applicant-apply-no-resume">

              <div className="applicant-apply-no-resume-icon">
                📄
              </div>

              <h3>No Resume Found</h3>

              <p>
                Upload a resume before applying for this
                position.
              </p>

              <button
                type="button"
                className="applicant-apply-primary-btn"
                onClick={() =>
                  navigate("/applicant/upload-resume")
                }
              >
                Upload Resume
                <span>→</span>
              </button>

            </div>

          ) : (

            <div className="applicant-apply-form-body">

              {/* RESUME SELECT */}

              <div className="applicant-apply-resume-field">

                <label htmlFor="resume">
                  Select Resume
                </label>

                <div className="applicant-apply-select-wrapper">

                  <span className="applicant-apply-select-icon">
                    📄
                  </span>

                  <select
                    id="resume"
                    value={selectedResume}
                    onChange={(event) => {
                      setSelectedResume(
                        event.target.value
                      );

                      setMessage("");
                      setMessageType("");
                    }}
                    disabled={submitting}
                  >

                    <option value="">
                      -- Select a resume --
                    </option>

                    {resumes.map((resume) => (
                      <option
                        key={resume.resumeId}
                        value={resume.resumeId}
                      >
                        {resume.fileName}
                      </option>
                    ))}

                  </select>

                </div>

              </div>


              {/* SELECTED RESUME */}

              {selectedResume && (

                <div className="applicant-apply-selected-resume">

                  <div className="applicant-apply-selected-icon">
                    ✓
                  </div>

                  <div className="applicant-apply-selected-content">
                    <span>Selected Resume</span>

                    <strong>
                      {selectedResumeData?.fileName ||
                        "Resume"}
                    </strong>
                  </div>

                </div>

              )}


              {/* SCREENING NOTE */}

              <div className="applicant-apply-note">

                <div className="applicant-apply-note-icon">
                  ⓘ
                </div>

                <div>
                  <strong>Resume Screening</strong>

                  <p>
                    Your selected resume will be used
                    for screening against this job's
                    requirements.
                  </p>
                </div>

              </div>


              {/* MESSAGE */}

              {message && (

                <div
                  className={`applicant-apply-message ${
                    messageType === "success"
                      ? "applicant-apply-success"
                      : "applicant-apply-error"
                  }`}
                >

                  <span>
                    {messageType === "success"
                      ? "✓"
                      : "!"}
                  </span>

                  <p>{message}</p>

                </div>

              )}


              {/* SUBMIT */}

              <button
                type="button"
                className="applicant-apply-submit-btn"
                onClick={handleApply}
                disabled={
                  submitting ||
                  !selectedResume
                }
              >

                {submitting ? (

                  <>
                    <span className="applicant-apply-button-spinner"></span>
                    Submitting Application...
                  </>

                ) : (

                  <>
                    Submit Application
                    <span>→</span>
                  </>

                )}

              </button>


              <p className="applicant-apply-security-note">
                🔒 Your application information is handled
                securely.
              </p>

            </div>

          )}

        </aside>

      </main>

    </div>
  );
}

export default ApplyJob;

