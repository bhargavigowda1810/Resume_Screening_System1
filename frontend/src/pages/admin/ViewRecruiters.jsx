import { useEffect, useState } from "react";
import { api } from "../../services/api";

/* =========================================================
   HELPERS
   ========================================================= */

// Adds https:// when the website was saved without a protocol
const getWebsiteUrl = (website) => {
  const value = String(website || "").trim();

  if (!value) {
    return "";
  }

  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString() : "-";

const formatDateTime = (date) =>
  date ? new Date(date).toLocaleString() : "-";

/* =========================================================
   SMALL REUSABLE COMPONENTS
   ========================================================= */

// Email verified / pending pill
function VerificationPill({ verified }) {
  return verified ? (
    <span className="recruiter-pill recruiter-pill-verified">
      ✓ Verified
    </span>
  ) : (
    <span className="recruiter-pill recruiter-pill-pending">! Pending</span>
  );
}

// One "label: value" row inside a recruiter card
function InfoRow({ label, children }) {
  return (
    <>
      <strong>{label}</strong>

      <span>{children}</span>
    </>
  );
}

// One label + value tile in the full-screen details
function DetailField({ label, wide, children }) {
  return (
    <div
      className={
        wide
          ? "recruiter-detail-field recruiter-detail-field-wide"
          : "recruiter-detail-field"
      }
    >
      <span>{label}</span>

      <div>{children}</div>
    </div>
  );
}

/* =========================================================
   FULL-SCREEN RECRUITER DETAILS
   Covers the whole screen. Close it with the button,
   the Back button, or the Escape key.
   ========================================================= */

function RecruiterDetails({ recruiter, onClose }) {
  // Stop the page behind from scrolling while the details are open
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Close with the Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const websiteUrl = getWebsiteUrl(recruiter.companyWebsite);

  return (
    <div
      className="recruiter-detail-screen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recruiter-detail-title"
    >

      {/* ---------- Top bar ---------- */}
      <div className="recruiter-detail-topbar">

        <button
          type="button"
          className="recruiter-detail-back"
          onClick={onClose}
        >
          <span>←</span>
          Back to Recruiters
        </button>

        <button
          type="button"
          className="recruiter-detail-close"
          onClick={onClose}
          aria-label="Close recruiter details"
        >
          ×
        </button>

      </div>

      {/* ---------- Content ---------- */}
      <div className="recruiter-detail-body">

        {/* Hero */}
        <section className="recruiter-detail-hero">

          <div className="recruiter-detail-avatar">
            {recruiter.name ? recruiter.name.charAt(0).toUpperCase() : "R"}
          </div>

          <div className="recruiter-detail-identity">

            <h2 id="recruiter-detail-title">{recruiter.name || "-"}</h2>

            <p>
              {[recruiter.designation || "Recruiter", recruiter.companyName]
                .filter(Boolean)
                .join(" · ")}
            </p>

            <div className="recruiter-detail-badges">

              <VerificationPill verified={recruiter.emailVerified} />

              <span className="recruiter-detail-role">
                {recruiter.role || "RECRUITER"}
              </span>

            </div>

          </div>

        </section>

        {/* Two information cards */}
        <div className="recruiter-detail-grid">

          {/* Recruiter information */}
          <section className="recruiter-detail-card">

            <div className="recruiter-detail-card-header">
              <div className="recruiter-detail-card-icon">👤</div>

              <div>
                <h3>Recruiter Information</h3>

                <p>Account and contact details</p>
              </div>
            </div>

            <div className="recruiter-detail-fields">

              <DetailField label="Full Name">
                {recruiter.name || "-"}
              </DetailField>

              <DetailField label="Email">
                {recruiter.email || "-"}
              </DetailField>

              <DetailField label="Phone">
                {recruiter.phone || "-"}
              </DetailField>

              <DetailField label="Designation">
                {recruiter.designation || "-"}
              </DetailField>

              <DetailField label="Role">
                {recruiter.role || "-"}
              </DetailField>

              <DetailField label="Email Verification">
                <VerificationPill verified={recruiter.emailVerified} />
              </DetailField>

              <DetailField label="Account Created" wide>
                {formatDateTime(recruiter.createdAt)}
              </DetailField>

            </div>

          </section>

          {/* Company information */}
          <section className="recruiter-detail-card">

            <div className="recruiter-detail-card-header">
              <div className="recruiter-detail-card-icon">🏢</div>

              <div>
                <h3>Company Information</h3>

                <p>The company this recruiter hires for</p>
              </div>
            </div>

            <div className="recruiter-detail-fields">

              <DetailField label="Company Name">
                {recruiter.companyName || "-"}
              </DetailField>

              <DetailField label="Company Email">
                {recruiter.companyEmail || "-"}
              </DetailField>

              <DetailField label="Company Phone">
                {recruiter.companyPhone || "-"}
              </DetailField>

              <DetailField label="Company Website">
                {websiteUrl ? (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {recruiter.companyWebsite}
                  </a>
                ) : (
                  "-"
                )}
              </DetailField>

              <DetailField label="Industry">
                {recruiter.industry || "-"}
              </DetailField>

              <DetailField label="Company Size">
                {recruiter.companySize || "-"}
              </DetailField>

              <DetailField label="Company Address" wide>
                <span className="recruiter-detail-address">
                  {recruiter.companyAddress || "-"}
                </span>
              </DetailField>

            </div>

          </section>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   VIEW RECRUITERS PAGE
   ========================================================= */

function ViewRecruiters() {
  // =========================
  // Recruiter List
  // =========================
  const [recruiters, setRecruiters] = useState([]);
  const [loadingRecruiters, setLoadingRecruiters] = useState(false);
  const [recruiterListError, setRecruiterListError] = useState("");

  // =========================
  // Selected Recruiter
  // =========================
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);

  // =========================
  // Load Recruiters
  // =========================
  const loadRecruiters = async () => {
    setLoadingRecruiters(true);
    setRecruiterListError("");

    try {
      const response = await api.get("/users/admin/recruiters");

      setRecruiters(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Failed to load recruiters:", error);

      setRecruiterListError(
        error?.message || "Unable to load recruiter accounts."
      );
    } finally {
      setLoadingRecruiters(false);
    }
  };

  // =========================
  // Load On Page Open
  // =========================
  useEffect(() => {
    loadRecruiters();
  }, []);

  return (
    <div className="view-recruiters-page">

      <main className="view-recruiters-container">

        {/* ================= PAGE HEADER ================= */}

        <header className="view-recruiters-header">

          <div>

            <span className="view-recruiters-eyebrow">Administration</span>

            <h1>View Recruiters</h1>

            <p>
              View recruiter accounts and their associated company
              information.
            </p>

          </div>

          <button
            type="button"
            className="view-recruiters-refresh"
            onClick={loadRecruiters}
            disabled={loadingRecruiters}
          >
            {loadingRecruiters ? "Refreshing..." : "↻ Refresh"}
          </button>

        </header>

        {/* ===================== ERROR ===================== */}

        {recruiterListError && (
          <div className="view-recruiters-alert" role="alert">

            <span>!</span>

            <p>{recruiterListError}</p>

          </div>
        )}

        {/* ================= RECRUITER LIST ================= */}

        <section className="view-recruiters-section">

          <div className="view-recruiters-section-header">

            <div>
              <h2>Recruiter Management</h2>

              <p>
                All recruiter and company information created by the
                Administrator.
              </p>
            </div>

            {recruiters.length > 0 && (
              <span className="view-recruiters-count">
                {recruiters.length}{" "}
                {recruiters.length === 1 ? "Recruiter" : "Recruiters"}
              </span>
            )}

          </div>

          {/* Loading */}
          {loadingRecruiters && (
            <div className="view-recruiters-loading">
              <span className="view-recruiters-spinner"></span>
              Loading recruiters...
            </div>
          )}

          {/* Empty */}
          {!loadingRecruiters &&
            !recruiterListError &&
            recruiters.length === 0 && (
              <div className="view-recruiters-empty">
                No recruiter accounts have been created yet.
              </div>
            )}

          {/* Recruiter cards */}
          {!loadingRecruiters && recruiters.length > 0 && (
            <div className="view-recruiters-grid">

              {recruiters.map((recruiter) => (
                <article
                  key={recruiter.userUuid}
                  className="recruiter-card"
                >

                  {/* Header */}
                  <div className="recruiter-card-header">

                    <div className="recruiter-card-identity">

                      <div className="recruiter-card-avatar">
                        {recruiter.name
                          ? recruiter.name.charAt(0).toUpperCase()
                          : "R"}
                      </div>

                      <div>
                        <strong>{recruiter.name || "-"}</strong>

                        <span>{recruiter.designation || "Recruiter"}</span>
                      </div>

                    </div>

                    <VerificationPill verified={recruiter.emailVerified} />

                  </div>

                  {/* Basic information */}
                  <div className="recruiter-card-info">

                    <InfoRow label="Email">{recruiter.email || "-"}</InfoRow>

                    <InfoRow label="Phone">{recruiter.phone || "-"}</InfoRow>

                    <InfoRow label="Role">
                      {recruiter.role || "RECRUITER"}
                    </InfoRow>

                    <InfoRow label="Created">
                      {formatDate(recruiter.createdAt)}
                    </InfoRow>

                  </div>

                  {/* Company information */}
                  <div className="recruiter-card-company">

                    <h3>Company Information</h3>

                    <div className="recruiter-card-info">

                      <InfoRow label="Company">
                        {recruiter.companyName || "-"}
                      </InfoRow>

                      <InfoRow label="Industry">
                        {recruiter.industry || "-"}
                      </InfoRow>

                      <InfoRow label="Size">
                        {recruiter.companySize || "-"}
                      </InfoRow>

                    </div>

                  </div>

                  {/* Open the full-screen details */}
                  <button
                    type="button"
                    className="recruiter-card-button"
                    onClick={() => setSelectedRecruiter(recruiter)}
                  >
                    View Complete Details
                  </button>

                </article>
              ))}

            </div>
          )}

        </section>

      </main>

      {/* ========== FULL-SCREEN RECRUITER DETAILS ========== */}

      {selectedRecruiter && (
        <RecruiterDetails
          recruiter={selectedRecruiter}
          onClose={() => setSelectedRecruiter(null)}
        />
      )}

    </div>
  );
}

export default ViewRecruiters;