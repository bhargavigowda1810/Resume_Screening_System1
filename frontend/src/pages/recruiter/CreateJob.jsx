import { useState } from "react";
import { api } from "../../services/api";

function CreateJob() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [minExperience, setMinExperience] = useState("");
  const [requiredEducation, setRequiredEducation] = useState("");
  const [location, setLocation] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user?.userId) {
      setMessage("Recruiter information not found. Please login again.");
      return;
    }

    const job = {
      recruiterId: user.userId,
      title,
      description,
      requiredSkills,
      minExperience: Number(minExperience),
      requiredEducation,
      location,
    };

    setLoading(true);
    setMessage("");

    try {
      const result = await api.post("/jobs", job);

      console.log("Job created:", result);

      setMessage("Job created successfully!");

      setTitle("");
      setDescription("");
      setRequiredSkills("");
      setMinExperience("");
      setRequiredEducation("");
      setLocation("");
    } catch (error) {
      console.error("Job creation failed:", error);
      setMessage("Failed to create job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create Job</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Job Title</label>
          <br />
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter job title"
            required
          />
        </div>

        <br />

        <div>
          <label>Job Description</label>
          <br />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Enter job description"
            rows="5"
            required
          />
        </div>

        <br />

        <div>
          <label>Required Skills</label>
          <br />
          <input
            type="text"
            value={requiredSkills}
            onChange={(event) => setRequiredSkills(event.target.value)}
            placeholder="Python, SQL, PostgreSQL, Excel"
            required
          />
        </div>

        <br />

        <div>
          <label>Minimum Experience (years)</label>
          <br />
          <input
            type="number"
            min="0"
            step="0.1"
            value={minExperience}
            onChange={(event) => setMinExperience(event.target.value)}
            placeholder="0"
            required
          />
        </div>

        <br />

        <div>
          <label>Required Education</label>
          <br />
          <input
            type="text"
            value={requiredEducation}
            onChange={(event) => setRequiredEducation(event.target.value)}
            placeholder="Bachelor degree"
            required
          />
        </div>

        <br />

        <div>
          <label>Location</label>
          <br />
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Bengaluru"
            required
          />
        </div>

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Job"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default CreateJob;