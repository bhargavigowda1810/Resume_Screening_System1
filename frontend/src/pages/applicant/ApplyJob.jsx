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

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user?.userId) {
          setMessage("User information not found. Please login again.");
          return;
        }

        const [jobData, resumeData] = await Promise.all([
          api.get("/jobs"),
          api.get(`/resumes/applicant/${user.userId}`),
        ]);

        setJobs(jobData);
        setResumes(resumeData);

        const job = jobData.find(
          (item) => String(item.jobId) === String(jobId)
        );

        setSelectedJob(job || null);
      } catch (error) {
        console.error("Failed to load application data:", error);
        setMessage("Failed to load job or resume information.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [jobId]);

  const handleApply = async () => {
    if (!selectedResume) {
      setMessage("Please select a resume.");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user?.userId) {
      setMessage("User information not found. Please login again.");
      return;
    }

    const application = {
      applicantId: user.userId,
      jobId: Number(jobId),
      resumeId: Number(selectedResume),
    };

    setSubmitting(true);
    setMessage("");

    try {
      const result = await api.post("/applications", application);

      console.log("Application submitted:", result);

      setMessage("Application submitted successfully!");

      setTimeout(() => {
        navigate("/applicant");
      }, 1500);
    } catch (error) {
      console.error("Application failed:", error);
      setMessage(
        "Application failed. You may have already applied for this job."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!selectedJob) {
    return (
      <div>
        <h1>Apply for Job</h1>
        <p>Job not found.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Apply for Job</h1>

      <h2>{selectedJob.title}</h2>

      <p>
        <strong>Description:</strong> {selectedJob.description}
      </p>

      <p>
        <strong>Required Skills:</strong> {selectedJob.requiredSkills}
      </p>

      <p>
        <strong>Minimum Experience:</strong>{" "}
        {selectedJob.minExperience} years
      </p>

      <p>
        <strong>Education:</strong> {selectedJob.requiredEducation}
      </p>

      <p>
        <strong>Location:</strong> {selectedJob.location}
      </p>

      <hr />

      <h3>Select Resume</h3>

      {resumes.length === 0 ? (
        <p>
          No resume found. Please upload a resume before applying.
        </p>
      ) : (
        <>
          <select
            value={selectedResume}
            onChange={(event) => setSelectedResume(event.target.value)}
          >
            <option value="">-- Select a resume --</option>

            {resumes.map((resume) => (
              <option key={resume.resumeId} value={resume.resumeId}>
                {resume.fileName}
              </option>
            ))}
          </select>

          <br />
          <br />

          <button onClick={handleApply} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}

export default ApplyJob;