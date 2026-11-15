import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ResumeViewer() {
  const { resumeId } = useParams();

  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResume = async () => {
      if (!resumeId) {
        setError("Resume ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError(
            "Your session has expired. Please log in again."
          );
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:8081/api/resumes/${resumeId}/file`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();

          throw new Error(
            errorText || "Unable to load the resume."
          );
        }

        const blob = await response.blob();

        const url = URL.createObjectURL(blob);

        setFileUrl(url);
      } catch (error) {
        console.error(
          "Failed to load resume:",
          error
        );

        setError(
          error?.message ||
            "Failed to load the resume."
        );
      } finally {
        setLoading(false);
      }
    };

    loadResume();

    return () => {
      setFileUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }

        return "";
      });
    };
  }, [resumeId]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <h2>Loading Resume...</h2>

        <p>
          Please wait while the resume is being loaded.
        </p>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "12px",
          padding: "30px",
          textAlign: "center",
        }}
      >
        <h2>Unable to Open Resume</h2>

        <p>{error}</p>
      </div>
    );
  }

  // =========================================================
  // RESUME
  // =========================================================

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <iframe
        src={fileUrl}
        title={`Resume ${resumeId}`}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
      />
    </div>
  );
}

export default ResumeViewer;