import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

function UploadResume() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [existingResume, setExistingResume] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingResume, setLoadingResume] = useState(true);

  // Controls whether the applicant is currently replacing the resume
  const [isReuploading, setIsReuploading] = useState(false);

  // =========================================================
  // LOAD LOGGED-IN USER AND EXISTING RESUME
  // =========================================================

  useEffect(() => {
    const loadUserAndResume = async () => {
      try {
        // -----------------------------------------------------
        // Verify logged-in user
        // -----------------------------------------------------

        const currentUser = await api.get("/users/me");

        console.log("Logged-in user:", currentUser);

        if (!currentUser?.userUuid) {
          setMessage(
            "User information not found. Please login again."
          );
          setMessageType("error");
          return;
        }

        // -----------------------------------------------------
        // Load existing resumes using authenticated user
        // -----------------------------------------------------

        const resumes = await api.get("/resumes/me");

        console.log("Existing resumes:", resumes);

        if (Array.isArray(resumes) && resumes.length > 0) {
          setExistingResume(resumes[resumes.length - 1]);
        } else {
          setExistingResume(null);
        }
      } catch (error) {
        console.error(
          "Failed to load user or existing resume:",
          error
        );

        setExistingResume(null);

        setMessage(
          error?.message ||
            "Unable to load your resume information. Please try again."
        );

        setMessageType("error");
      } finally {
        setLoadingResume(false);
      }
    };

    loadUserAndResume();
  }, []);

  // =========================================================
  // START RE-UPLOAD
  // =========================================================

  const handleReupload = () => {
    setIsReuploading(true);
    setFile(null);
    setMessage("");
    setMessageType("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================================================
  // CANCEL RE-UPLOAD
  // =========================================================

  const handleCancelReupload = () => {
    setIsReuploading(false);
    setFile(null);
    setMessage("");
    setMessageType("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

    if (
      !allowedTypes.includes(selectedFile.type) &&
      !validExtension
    ) {
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
  // UPLOAD / REPLACE RESUME
  // =========================================================

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a resume before uploading.");
      setMessageType("error");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage(
        "Authentication token not found. Please login again."
      );
      setMessageType("error");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      // -----------------------------------------------------
      // Upload / replace resume
      // -----------------------------------------------------

      const response = await fetch(
        "http://localhost:8081/api/resumes/parse",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let result;

      if (contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = await response.text();
      }

      if (!response.ok) {
        const errorMessage =
          typeof result === "string"
            ? result
            : result?.message ||
              "Unable to process the resume.";

        throw new Error(errorMessage);
      }

      console.log("Resume processing result:", result);

      // -----------------------------------------------------
      // Success message
      // -----------------------------------------------------

      setMessage(
        existingResume
          ? "Resume replaced and processed successfully!"
          : "Resume uploaded and processed successfully!"
      );

      setMessageType("success");

      // -----------------------------------------------------
      // Reload existing resume after successful upload
      // -----------------------------------------------------

      try {
        const resumes = await api.get("/resumes/me");

        console.log(
          "Updated resumes after upload:",
          resumes
        );

        if (Array.isArray(resumes) && resumes.length > 0) {
          setExistingResume(resumes[resumes.length - 1]);
        } else {
          setExistingResume(null);
        }
      } catch (error) {
        console.error(
          "Could not refresh existing resume:",
          error
        );
      }

      // -----------------------------------------------------
      // Clear selected file
      // -----------------------------------------------------

      setFile(null);
      setIsReuploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload failed:", error);

      setMessage(
        error?.message ||
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

          <h1>Resume</h1>

          <p>
            Upload your latest resume to use it for job
            applications and AI-powered screening.
          </p>
        </div>
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

              </div>

            </div>

            <div className="existing-resume-status">
              <span>✓</span>
              Uploaded
            </div>

          </div>
        )}


        {/* ===================================================
            RE-UPLOAD ACTION
        =================================================== */}

        {!loadingResume && existingResume && !isReuploading && (
          <div className="applicant-upload-card">

            <div className="applicant-upload-card-header">

              <div className="applicant-upload-icon">
                ↑
              </div>

              <div>
                <h2>
                  Update your resume
                </h2>

                <p>
                  Keep your profile up to date by uploading
                  your latest resume.
                </p>
              </div>

            </div>


            {/* Re-upload information */}

            <div className="applicant-upload-note">

              <span>ⓘ</span>

              <div>
                <strong>
                  Replace your current resume
                </strong>

                <p>
                  Your new resume will replace the current
                  resume and its extracted profile information.
                </p>
              </div>

            </div>


            {/* Re-upload button */}

            <button
              type="button"
              className="applicant-upload-submit-btn"
              onClick={handleReupload}
            >
              Re-upload Resume
            </button>


            {/* Message */}

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

          </div>
        )}


        {/* ===================================================
            UPLOAD CARD
        =================================================== */}

        {(!existingResume || isReuploading) && (
          <div className="applicant-upload-card">

            {/* Card Header */}

            <div className="applicant-upload-card-header">

              <div className="applicant-upload-icon">
                ↑
              </div>

              <div>
                <h2>
                  {existingResume
                    ? "Replace your resume"
                    : "Upload your resume"}
                </h2>

                <p>
                  {existingResume
                    ? "Select your updated resume to replace the current one."
                    : "Choose your latest resume from your computer."}
                </p>
              </div>

            </div>


            {/* =================================================
                REPLACEMENT WARNING
            ================================================= */}

            {existingResume && (
              <div className="applicant-upload-note">

                <span>ⓘ</span>

                <div>
                  <strong>
                    Your current resume will be replaced
                  </strong>

                  <p>
                    The new resume will become your current
                    resume and will be used for future job
                    applications and screening.
                  </p>
                </div>

              </div>
            )}


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
                  {existingResume
                    ? "Select your new resume"
                    : "Select your resume"}
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
                ACTION BUTTONS
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
                  {existingResume
                    ? "Replace & Process Resume"
                    : "Upload & Process Resume"}
                </>
              )}

            </button>


            {/* Cancel Re-upload */}

            {existingResume && !loading && (
              <button
                type="button"
                className="applicant-upload-remove-btn"
                onClick={handleCancelReupload}
              >
                Cancel
              </button>
            )}


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
        )}


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