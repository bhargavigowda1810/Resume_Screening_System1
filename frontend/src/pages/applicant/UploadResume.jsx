import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function UploadResume() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [existingResume, setExistingResume] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingResume, setLoadingResume] = useState(true);

  // =========================================================
  // LOAD EXISTING RESUME
  // =========================================================

  useEffect(() => {
    const loadExistingResume = async () => {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setMessage("User information not found. Please login again.");
        setMessageType("error");
        setLoadingResume(false);
        return;
      }

      let user;

      try {
        user = JSON.parse(storedUser);
      } catch (error) {
        console.error("Invalid user information:", error);

        setMessage("Invalid user information. Please login again.");
        setMessageType("error");
        setLoadingResume(false);
        return;
      }

      if (!user?.userId) {
        setMessage("User information not found. Please login again.");
        setMessageType("error");
        setLoadingResume(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8081/api/resumes/applicant/${user.userId}`
        );

        if (!response.ok) {
          throw new Error("Unable to load resume.");
        }

        const resumes = await response.json();

        console.log("Existing resumes:", resumes);

        if (Array.isArray(resumes) && resumes.length > 0) {
          setExistingResume(resumes[resumes.length - 1]);
        } else {
          setExistingResume(null);
        }
      } catch (error) {
        console.error("Failed to load existing resume:", error);

        setExistingResume(null);
      } finally {
        setLoadingResume(false);
      }
    };

    loadExistingResume();
  }, []);

  // =========================================================
  // FILE SELECTION
  // =========================================================

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    setMessage("");
    setMessageType("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const allowedExtensions = [".pdf", ".docx", ".txt"];

    const fileName = selectedFile.name.toLowerCase();

    const validExtension = allowedExtensions.some((extension) =>
      fileName.endsWith(extension)
    );

    if (!allowedTypes.includes(selectedFile.type) && !validExtension) {
      setFile(null);

      setMessage("Please select a PDF, DOCX, or TXT file.");
      setMessageType("error");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setFile(selectedFile);
  };

  // =========================================================
  // UPLOAD RESUME
  // =========================================================

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a resume before uploading.");
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

    const formData = new FormData();

    formData.append("file", file);
    formData.append("applicantId", user.userId);

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(
        "http://localhost:8081/api/resumes/parse",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.text();

      if (!response.ok) {
        throw new Error(result || "Unable to process the resume.");
      }

      setMessage("Resume uploaded and processed successfully!");
      setMessageType("success");

      console.log("Resume processing result:", result);

      // -----------------------------------------------------
      // Reload existing resume after successful upload
      // -----------------------------------------------------

      try {
        const resumeResponse = await fetch(
          `http://localhost:8081/api/resumes/applicant/${user.userId}`
        );

        if (resumeResponse.ok) {
          const resumes = await resumeResponse.json();

          if (Array.isArray(resumes) && resumes.length > 0) {
            setExistingResume(resumes[resumes.length - 1]);
          }
        }
      } catch (error) {
        console.error(
          "Could not refresh existing resume:",
          error
        );
      }

      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (error) {
      console.error("Upload failed:", error);

      setMessage(
        "Resume upload failed. Please try again."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // REMOVE SELECTED FILE
  // =========================================================

  const removeFile = () => {
    setFile(null);
    setMessage("");
    setMessageType("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="applicant-upload-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="applicant-upload-header">

        <div>
          <span className="applicant-upload-eyebrow">
            RESUME
          </span>

          <h1>Upload Resume</h1>

          <p>
            Upload your latest resume to use it for job
            applications and AI-powered screening.
          </p>
        </div>

        <button
          type="button"
          className="applicant-upload-back-btn"
          onClick={() => navigate("/applicant")}
        >
          ← Dashboard
        </button>

      </div>


      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <div className="applicant-upload-content">

        {/* ===================================================
            CURRENT RESUME
        =================================================== */}

        {!loadingResume && existingResume && (
          <div className="applicant-existing-resume">

            <div className="existing-resume-left">

              <div className="existing-resume-icon">
                📄
              </div>

              <div className="existing-resume-info">

                <span className="existing-resume-label">
                  CURRENT RESUME
                </span>

                <h3>
                  {existingResume.fileName ||
                    existingResume.filename ||
                    existingResume.originalFileName ||
                    "Resume uploaded"}
                </h3>

                <p>
                  Resume ID:
                  <strong>
                    {" "}
                    {existingResume.resumeId || "N/A"}
                  </strong>
                </p>

              </div>

            </div>

            <div className="existing-resume-status">
              <span>✓</span>
              Uploaded
            </div>

          </div>
        )}


        {/* ===================================================
            UPLOAD CARD
        =================================================== */}

        <div className="applicant-upload-card">

          {/* Card Header */}

          <div className="applicant-upload-card-header">

            <div className="applicant-upload-icon">
              ↑
            </div>

            <div>
              <h2>
                {existingResume
                  ? "Upload a new resume"
                  : "Upload your resume"}
              </h2>

              <p>
                {existingResume
                  ? "Upload an updated version of your resume."
                  : "Choose your latest resume from your computer."}
              </p>
            </div>

          </div>


          {/* Supported Formats */}

          <div className="applicant-upload-formats">

            <span className="upload-format-label">
              Supported formats
            </span>

            <div className="upload-format-list">
              <span>PDF</span>
              <span>DOCX</span>
              <span>TXT</span>
            </div>

          </div>


          {/* =================================================
              FILE SELECTION
          ================================================= */}

          {!file ? (

            <div
              className="applicant-upload-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >

              <div className="applicant-upload-file-icon">
                📄
              </div>

              <h3>
                Select your resume
              </h3>

              <p>
                Click to browse files from your computer
              </p>

              <button
                type="button"
                className="applicant-upload-select-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Choose File
              </button>

              <span className="upload-dropzone-hint">
                PDF, DOCX or TXT
              </span>

            </div>

          ) : (

            <div className="applicant-upload-selected">

              <div className="applicant-upload-selected-icon">
                📄
              </div>

              <div className="applicant-upload-file-info">

                <strong>
                  {file.name}
                </strong>

                <span>
                  {(file.size / 1024).toFixed(1)} KB
                </span>

              </div>

              <button
                type="button"
                className="applicant-upload-remove-btn"
                onClick={removeFile}
                disabled={loading}
              >
                Remove
              </button>

            </div>

          )}


          {/* Hidden Input */}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="applicant-upload-hidden-input"
          />


          {/* =================================================
              UPLOAD BUTTON
          ================================================= */}

          <button
            type="button"
            className="applicant-upload-submit-btn"
            onClick={handleUpload}
            disabled={loading || !file}
          >

            {loading ? (
              <>
                <span className="applicant-upload-spinner"></span>
                Processing Resume...
              </>
            ) : (
              <>
                Upload & Process Resume
              </>
            )}

          </button>


          {/* =================================================
              MESSAGE
          ================================================= */}

          {message && (
            <div
              className={`applicant-upload-message ${
                messageType === "success"
                  ? "applicant-upload-success"
                  : "applicant-upload-error"
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


          {/* =================================================
              INFORMATION
          ================================================= */}

          <div className="applicant-upload-note">

            <span>ⓘ</span>

            <div>
              <strong>
                How your resume is used
              </strong>

              <p>
                Your resume will be processed by the screening
                system and used to match your profile with
                available job opportunities.
              </p>
            </div>

          </div>

        </div>


        {/* ===================================================
            PROCESSING STEPS
        =================================================== */}

        <div className="applicant-upload-process">

          <div className="upload-process-item">

            <div className="upload-process-number">
              1
            </div>

            <div>
              <strong>Upload</strong>
              <p>Select your resume file.</p>
            </div>

          </div>

          <div className="upload-process-line"></div>

          <div className="upload-process-item">

            <div className="upload-process-number">
              2
            </div>

            <div>
              <strong>Process</strong>
              <p>Our system extracts resume information.</p>
            </div>

          </div>

          <div className="upload-process-line"></div>

          <div className="upload-process-item">

            <div className="upload-process-number">
              3
            </div>

            <div>
              <strong>Match</strong>
              <p>Your profile can be matched with jobs.</p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default UploadResume;

