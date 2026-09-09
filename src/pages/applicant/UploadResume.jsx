import { useState } from "react";

function UploadResume() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a resume.");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user?.userId) {
      setMessage("User information not found. Please login again.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("applicantId", user.userId);

    setLoading(true);
    setMessage("");

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
        throw new Error(result);
      }

      setMessage("Resume uploaded and processed successfully!");
      console.log("Resume processing result:", result);
    } catch (error) {
      console.error("Upload failed:", error);
      setMessage("Resume upload failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Upload Resume</h1>

      <p>Select your resume in PDF, DOCX, or TXT format.</p>

      <input
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleFileChange}
      />

      {file && (
        <p>
          Selected file: <strong>{file.name}</strong>
        </p>
      )}

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload Resume"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default UploadResume;