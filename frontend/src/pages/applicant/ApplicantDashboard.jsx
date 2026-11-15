import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

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

// Groups an application status into: success | danger | info | pending
const getStatusGroup = (status) => {
  const value = String(status || "").toLowerCase();

  if (
    value.includes("accept") ||
    value.includes("selected") ||
    value.includes("shortlist")
  ) {
    return "success";
  }

  if (value.includes("reject") || value.includes("declin")) {
    return "danger";
  }

  if (value.includes("review") || value.includes("screen")) {
    return "info";
  }

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

const formatExperience = (job) => {
  const value = job?.minimumExperience;

  return value !== null && value !== undefined && value !== ""
    ? `${value} yrs exp`
    : "Any experience";
};

const getFirstSkills = (skills, count) =>
  String(skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, count);

const SESSION_KEYS = ["token", "userUuid", "role", "name", "email"];

/* =========================================================
   APPLICANT HOME (DASHBOARD)
   ========================================================= */

function ApplicantDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  /* ---------- Load everything the home page needs ---------- */
  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        // The logged-in user is required
        const currentUser = await api.get("/users/me");

        // Everything else is optional: if one request fails,
        // that section simply stays empty.
        const [applicationResult, jobResult, resumeResult, profileResult] =
          await Promise.allSettled([
            api.get("/applications/me"),
            api.get("/jobs"),
            api.get("/resumes/me"),
            api.get("/users/me/profile"),
          ]);

        if (!mounted) {
          return;
        }

        const valueOf = (result) =>
          result.status === "fulfilled" ? result.value : null;

        const jobList = Array.isArray(valueOf(jobResult))
          ? valueOf(jobResult)
          : [];

        const applicationList = Array.isArray(valueOf(applicationResult))
          ? valueOf(applicationResult)
          : [];

        // Add the job title / location to every application
        const applicationsWithJobs = applicationList.map((application) => {
          const matchingJob = jobList.find(
            (job) => Number(job.jobId) === Number(application.jobId)
          );

          return {
            ...application,
            jobTitle:
              matchingJob?.title || matchingJob?.jobTitle || "Job Not Found",
            jobLocation: matchingJob?.location || "",
          };
        });

        setUser(currentUser);
        setJobs(jobList);
        setApplications(applicationsWithJobs);
        setResumes(
          Array.isArray(valueOf(resumeResult)) ? valueOf(resumeResult) : []
        );
        setProfile(valueOf(profileResult));
      } catch (error) {
        if (mounted) {
          setUser(null);
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
      <div className="applicant-home">
        <div className="home-loading">
          <div className="home-spinner"></div>
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

  const firstName = (user.name || "Applicant").trim().split(" ")[0];

  const latestResume =
    resumes.length > 0 ? resumes[resumes.length - 1] : null;

  // Applications: newest first
  const sortedApplications = [...applications].sort((a, b) => {
    const dateA = new Date(a.appliedAt).getTime() || 0;
    const dateB = new Date(b.appliedAt).getTime() || 0;

    return dateB - dateA || Number(b.applicationId) - Number(a.applicationId);
  });

  const recentApplications = sortedApplications.slice(0, 5);

  const shortlistedCount = applications.filter(
    (application) => getStatusGroup(application.status) === "success"
  ).length;

  const inProgressCount = applications.filter((application) => {
    const group = getStatusGroup(application.status);

    return group === "info" || group === "pending";
  }).length;

  // Jobs: newest first, skip the ones already applied for
  const appliedJobIds = new Set(
    applications.map((application) => Number(application.jobId))
  );

  const latestJobs = [...jobs]
    .sort((a, b) => Number(b.jobId) - Number(a.jobId))
    .slice(0, 4);

  /* ---------- Profile strength ---------- */
  const hasItems = (value) => Array.isArray(value) && value.length > 0;

  const profileChecklist = [
    {
      key: "resume",
      label: "Upload your resume",
      done: Boolean(latestResume),
      path: "/applicant/upload-resume",
    },
    {
      key: "contact",
      label: "Add contact details",
      done: Boolean(profile?.phone),
      path: "/applicant/profile",
    },
    {
      key: "education",
      label: "Add education",
      done: hasItems(profile?.education),
      path: "/applicant/profile",
    },
    {
      key: "experience",
      label: "Add work experience",
      done: hasItems(profile?.experience),
      path: "/applicant/profile",
    },
    {
      key: "skills",
      label: "Add your skills",
      done: hasItems(profile?.skills),
      path: "/applicant/profile",
    },
    {
      key: "projects",
      label: "Add projects",
      done: hasItems(profile?.projects),
      path: "/applicant/profile",
    },
  ];

  const completedCount = profileChecklist.filter((item) => item.done).length;

  const profilePercent = Math.round(
    (completedCount / profileChecklist.length) * 100
  );

  const nextStep = profileChecklist.find((item) => !item.done);

  /* ---------- Hero message ---------- */
  let heroMessage;

  if (!latestResume) {
    heroMessage =
      "Upload your resume to get started. It is used to build your profile and screen you for jobs.";
  } else if (applications.length === 0) {
    heroMessage =
      "Your resume is ready. Browse the latest openings and submit your first application.";
  } else {
    heroMessage = `You have ${applications.length} ${
      applications.length === 1 ? "application" : "applications"
    } so far. Keep exploring new openings.`;
  }

  /* =========================================================
     UI
     ========================================================= */

  return (
    <div className="applicant-home">

      {/* ==================== WELCOME ==================== */}
      <section className="home-hero">

        <div className="home-hero-text">
          <span className="home-hero-badge">{getGreeting()}</span>

          <h1>Welcome back, {firstName}!</h1>

          <p>{heroMessage}</p>
        </div>

        <div className="home-hero-actions">
          {latestResume ? (
            <button
              type="button"
              className="home-primary-btn"
              onClick={() => navigate("/applicant/jobs")}
            >
              Browse Jobs
              <span>→</span>
            </button>
          ) : (
            <button
              type="button"
              className="home-primary-btn"
              onClick={() => navigate("/applicant/upload-resume")}
            >
              Upload Resume
              <span>→</span>
            </button>
          )}
        </div>

      </section>

      {/* ==================== STATS ==================== */}
      <section className="home-stats">

        <button
          type="button"
          className="home-stat-card"
          onClick={() => navigate("/applicant/applications")}
        >
          <span className="home-stat-icon home-stat-total">▤</span>

          <div>
            <strong>{applications.length}</strong>
            <span>Applications</span>
          </div>
        </button>

        <button
          type="button"
          className="home-stat-card"
          onClick={() => navigate("/applicant/applications")}
        >
          <span className="home-stat-icon home-stat-progress">◷</span>

          <div>
            <strong>{inProgressCount}</strong>
            <span>In Progress</span>
          </div>
        </button>

        <button
          type="button"
          className="home-stat-card"
          onClick={() => navigate("/applicant/applications")}
        >
          <span className="home-stat-icon home-stat-success">✓</span>

          <div>
            <strong>{shortlistedCount}</strong>
            <span>Shortlisted</span>
          </div>
        </button>

        <button
          type="button"
          className="home-stat-card"
          onClick={() => navigate("/applicant/jobs")}
        >
          <span className="home-stat-icon home-stat-jobs">💼</span>

          <div>
            <strong>{jobs.length}</strong>
            <span>Open Jobs</span>
          </div>
        </button>

      </section>

      {/* ==================== MAIN GRID ==================== */}
      <div className="home-grid">

        {/* ---------- LEFT COLUMN ---------- */}
        <div className="home-main">

          {/* Recent applications */}
          <section className="home-card">

            <div className="home-card-header">
              <div>
                <h2>Recent Applications</h2>
                <p>Your latest submitted applications</p>
              </div>

              {applications.length > 0 && (
                <button
                  type="button"
                  className="home-link-btn"
                  onClick={() => navigate("/applicant/applications")}
                >
                  View all →
                </button>
              )}
            </div>

            {recentApplications.length === 0 ? (
              <div className="home-empty">
                <p>You haven't applied for any jobs yet.</p>

                <button
                  type="button"
                  className="home-secondary-btn"
                  onClick={() => navigate("/applicant/jobs")}
                >
                  Find a job to apply
                </button>
              </div>
            ) : (
              <ul className="home-application-list">
                {recentApplications.map((application) => (
                  <li
                    className="home-application-item"
                    key={application.applicationId}
                  >
                    <div className="home-application-avatar">
                      {application.jobTitle.charAt(0).toUpperCase()}
                    </div>

                    <div className="home-application-info">
                      <strong>{application.jobTitle}</strong>

                      <span>
                        {application.jobLocation
                          ? `${application.jobLocation} · `
                          : ""}
                        Applied {formatDate(application.appliedAt)}
                      </span>
                    </div>

                    <span
                      className={`home-status home-status-${getStatusGroup(
                        application.status
                      )}`}
                    >
                      <span className="home-status-dot"></span>
                      {getStatusLabel(application.status)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

          </section>

          {/* Latest jobs */}
          <section className="home-card">

            <div className="home-card-header">
              <div>
                <h2>Latest Jobs</h2>
                <p>Newly posted openings</p>
              </div>

              {jobs.length > 0 && (
                <button
                  type="button"
                  className="home-link-btn"
                  onClick={() => navigate("/applicant/jobs")}
                >
                  View all →
                </button>
              )}
            </div>

            {latestJobs.length === 0 ? (
              <div className="home-empty">
                <p>No job openings are available right now.</p>
              </div>
            ) : (
              <ul className="home-job-list">
                {latestJobs.map((job) => {
                  const alreadyApplied = appliedJobIds.has(
                    Number(job.jobId)
                  );

                  return (
                    <li className="home-job-item" key={job.jobId}>
                      <div className="home-job-info">
                        <strong>{job.title}</strong>

                        <span>
                          {job.location || "Location not specified"} ·{" "}
                          {formatExperience(job)}
                        </span>

                        <div className="home-job-skills">
                          {getFirstSkills(job.requiredSkills, 3).map(
                            (skill, index) => (
                              <span key={`${skill}-${index}`}>{skill}</span>
                            )
                          )}
                        </div>
                      </div>

                      {alreadyApplied ? (
                        <span className="home-applied-tag">✓ Applied</span>
                      ) : (
                        <button
                          type="button"
                          className="home-secondary-btn"
                          onClick={() =>
                            navigate(`/applicant/apply/${job.jobId}`)
                          }
                        >
                          Apply
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

          </section>

        </div>

        {/* ---------- RIGHT COLUMN ---------- */}
        <aside className="home-side">

          {/* Profile strength */}
          <section className="home-card">

            <div className="home-card-header">
              <div>
                <h2>Profile Strength</h2>
                <p>
                  {profilePercent === 100
                    ? "Your profile is complete"
                    : "Complete your profile to stand out"}
                </p>
              </div>

              <strong className="home-percent">{profilePercent}%</strong>
            </div>

            <div
              className="home-progress"
              role="progressbar"
              aria-valuenow={profilePercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="home-progress-fill"
                style={{ width: `${profilePercent}%` }}
              ></div>
            </div>

            <ul className="home-checklist">
              {profileChecklist.map((item) => (
                <li
                  key={item.key}
                  className={item.done ? "home-check done" : "home-check"}
                >
                  <span className="home-check-mark">
                    {item.done ? "✓" : ""}
                  </span>

                  <span className="home-check-label">{item.label}</span>

                  {!item.done && (
                    <button
                      type="button"
                      className="home-link-btn"
                      onClick={() => navigate(item.path)}
                    >
                      Add
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {nextStep && (
              <button
                type="button"
                className="home-primary-btn home-block-btn"
                onClick={() => navigate(nextStep.path)}
              >
                {nextStep.label}
                <span>→</span>
              </button>
            )}

          </section>

          {/* Resume */}
          <section className="home-card">

            <div className="home-card-header">
              <div>
                <h2>Your Resume</h2>
                <p>Used for job applications and screening</p>
              </div>
            </div>

            {latestResume ? (
              <div className="home-resume">
                <div className="home-resume-icon">📄</div>

                <div className="home-resume-info">
                  <strong>
                    {latestResume.fileName ||
                      latestResume.filename ||
                      latestResume.originalFileName ||
                      "Resume uploaded"}
                  </strong>

                  <span>
                    Uploaded{" "}
                    {formatDate(
                      latestResume.uploadedAt || profile?.uploadedAt
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div className="home-empty">
                <p>No resume uploaded yet.</p>
              </div>
            )}

            <button
              type="button"
              className="home-secondary-btn home-block-btn"
              onClick={() => navigate("/applicant/upload-resume")}
            >
              {latestResume ? "Update resume" : "Upload resume"}
            </button>

          </section>

        </aside>

      </div>

    </div>
  );
}

export default ApplicantDashboard;