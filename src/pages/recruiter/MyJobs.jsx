import { useEffect, useState } from "react";
import { api } from "../../services/api";

function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyJobs = async () => {
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
        setLoading(false);
      }
    };

    fetchMyJobs();
  }, []);

  if (loading) {
    return <p>Loading your jobs...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>My Jobs</h1>

      {jobs.length === 0 ? (
        <p>You have not created any jobs yet.</p>
      ) : (
        jobs.map((job) => (
          <div key={job.jobId}>
            <hr />

            <h2>{job.title}</h2>

            <p>
              <strong>Job ID:</strong> {job.jobId}
            </p>

            <p>
              <strong>Description:</strong> {job.description}
            </p>

            <p>
              <strong>Required Skills:</strong> {job.requiredSkills}
            </p>

            <p>
              <strong>Minimum Experience:</strong>{" "}
              {job.minExperience} years
            </p>

            <p>
              <strong>Required Education:</strong>{" "}
              {job.requiredEducation}
            </p>

            <p>
              <strong>Location:</strong> {job.location}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default MyJobs;