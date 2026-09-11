import { useEffect, useState } from "react";
import { api } from "../../services/api";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user?.userId) {
          setError("User information not found. Please login again.");
          return;
        }

        const data = await api.get(
          `/applications/applicant/${user.userId}`
        );

        setApplications(data);
      } catch (error) {
        console.error("Failed to load applications:", error);
        setError("Failed to load applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return <p>Loading applications...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>My Applications</h1>

      {applications.length === 0 ? (
        <p>You have not applied for any jobs yet.</p>
      ) : (
        applications.map((application) => (
          <div key={application.applicationId}>
            <hr />

            <h2>
              Application #{application.applicationId}
            </h2>

            <p>
              <strong>Job ID:</strong> {application.jobId}
            </p>

            <p>
              <strong>Resume ID:</strong> {application.resumeId}
            </p>

            <p>
              <strong>Status:</strong> {application.status}
            </p>

            <p>
              <strong>Applied At:</strong>{" "}
              {application.appliedAt
                ? new Date(application.appliedAt).toLocaleString()
                : "N/A"}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default MyApplications;