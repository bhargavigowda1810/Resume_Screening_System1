import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

function AvailableJobs() {
  const navigate = useNavigate(); 
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return <p>Loading jobs...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Available Jobs</h1>

      {jobs.length === 0 ? (
        <p>No jobs available.</p>
      ) : (
        jobs.map((job) => (
          <div key={job.jobId}>
            <hr />

            <h2>{job.title}</h2>

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
              <strong>Education:</strong> {job.requiredEducation}
            </p>

            <p>
              <strong>Location:</strong> {job.location}
            </p>

            <button onClick={() => navigate(`/applicant/apply/${job.jobId}`)}>
                Apply
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default AvailableJobs;