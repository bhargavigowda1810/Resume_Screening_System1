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
      setMessage(
        "Recruiter information not found. Please login again."
      );
      return;
    }

    const job = {
      recruiterId: user.userId,
      title,
      description,
      requiredSkills,

      // Send the exact backend field name.
      // 0 is a valid experience value.
      minimumExperience:
        minExperience.trim() === ""
          ? null
          : Number(minExperience),

      // Send the exact backend field name.
      educationRequirement:
        requiredEducation.trim(),

      location,
    };

    console.log("Job data being sent:", job);

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
    <div className="create-job-page">

      {/* =====================================================
          MAIN CONTAINER
          ===================================================== */}
      <div className="create-job-container">

        {/* ===================================================
            PAGE HEADER
            =================================================== */}
        <header className="create-job-header">

          <div className="create-job-header-icon">
            ＋
          </div>

          <div>
            <span className="create-job-eyebrow">
              RECRUITER WORKSPACE
            </span>

            <h1>
              Create New Job
            </h1>

            <p>
              Add the job details to attract and evaluate
              the right candidates.
            </p>
          </div>

        </header>


        {/* ===================================================
            FORM CARD
            =================================================== */}
        <div className="create-job-card">

          <div className="create-job-card-header">

            <div>
              <h2>
                Job Information
              </h2>

              <p>
                Provide accurate details about the position.
              </p>
            </div>

            <span className="create-job-required-note">
              * Required
            </span>

          </div>


          <form
            className="create-job-form"
            onSubmit={handleSubmit}
          >

            {/* =================================================
                JOB TITLE
                ================================================= */}
            <div className="create-job-field">

              <label htmlFor="job-title">
                Job Title
                <span>*</span>
              </label>

              <div className="create-job-input-wrapper">

                <span className="create-job-input-icon">
                  💼
                </span>

                <input
                  id="job-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Software Engineer"
                  required
                  disabled={loading}
                />

              </div>

            </div>


            {/* =================================================
                LOCATION
                ================================================= */}
            <div className="create-job-field">

              <label htmlFor="job-location">
                Location
                <span>*</span>
              </label>

              <div className="create-job-input-wrapper">

                <span className="create-job-input-icon">
                  📍
                </span>

                <input
                  id="job-location"
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="e.g. Bengaluru, Karnataka"
                  required
                  disabled={loading}
                />

              </div>

            </div>


            {/* =================================================
                JOB DESCRIPTION
                ================================================= */}
            <div className="create-job-field create-job-field-full">

              <label htmlFor="job-description">
                Job Description
                <span>*</span>
              </label>

              <textarea
                id="job-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe the role, responsibilities, technical requirements, and other important details..."
                rows={10}
                required
                disabled={loading}
              />

              <small>
                Provide a detailed description of the position
                and its responsibilities.
              </small>

            </div>


            {/* =================================================
                REQUIRED SKILLS
                ================================================= */}
            <div className="create-job-field create-job-field-full">

              <label htmlFor="required-skills">
                Required Skills
                <span>*</span>
              </label>

              <div className="create-job-input-wrapper">

                <span className="create-job-input-icon">
                  ⚙
                </span>

                <input
                  id="required-skills"
                  type="text"
                  value={requiredSkills}
                  onChange={(event) =>
                    setRequiredSkills(event.target.value)
                  }
                  placeholder="Python, Java, SQL, Spring Boot"
                  required
                  disabled={loading}
                />

              </div>

              <small>
                Separate multiple skills using commas.
              </small>

            </div>


            {/* =================================================
                EXPERIENCE
                ================================================= */}
            <div className="create-job-field">

              <label htmlFor="job-experience">

                Experience Required
                <span className="create-job-optional">
                  Optional
                </span>

              </label>

              <div className="create-job-input-wrapper">

                <span className="create-job-input-icon">
                  ◷
                </span>

                <input
                  id="job-experience"
                  type="number"
                  min="0"
                  step="0.1"
                  value={minExperience}
                  onChange={(event) =>
                    setMinExperience(event.target.value)
                  }
                  placeholder="e.g. 2"
                  disabled={loading}
                />

              </div>

              <small>
                Enter 0 for freshers or leave empty if there
                is no minimum experience requirement.
              </small>

            </div>


            {/* =================================================
                EDUCATION
                ================================================= */}
            <div className="create-job-field">

              <label htmlFor="job-education">
                Required Education
                <span>*</span>
              </label>

              <div className="create-job-input-wrapper">

                <span className="create-job-input-icon">
                  🎓
                </span>

                <input
                  id="job-education"
                  type="text"
                  value={requiredEducation}
                  onChange={(event) =>
                    setRequiredEducation(event.target.value)
                  }
                  placeholder="e.g. Bachelor's degree in Computer Science"
                  required
                  disabled={loading}
                />

              </div>

            </div>


            {/* =================================================
                MESSAGE
                ================================================= */}
            {message && (
              <div
                className={
                  message.includes("successfully")
                    ? "create-job-message success"
                    : "create-job-message error"
                }
              >

                <span className="create-job-message-icon">
                  {message.includes("successfully")
                    ? "✓"
                    : "!"}
                </span>

                <p>
                  {message}
                </p>

              </div>
            )}


            {/* =================================================
                FORM FOOTER
                ================================================= */}
            <div className="create-job-form-footer">

              <div className="create-job-form-note">
                <span>
                  ✨
                </span>

                <p>
                  Make sure your job details are accurate before
                  publishing.
                </p>
              </div>


              <button
                type="submit"
                className="create-job-submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="create-job-spinner"></span>
                    Creating Job...
                  </>
                ) : (
                  <>
                    Create Job
                    <span>
                      →
                    </span>
                  </>
                )}

              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default CreateJob;

