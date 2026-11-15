import { useEffect, useRef, useState } from "react";
import { api } from "../../services/api";

import {
  jobTitleOptions,
  locationOptions,
  skillOptions,
  educationOptions,
  experienceOptions,
} from "../../data/jobOptions";

/* =========================================================
   CONSTANTS
   ========================================================= */

// The "Other" option opens a text box for a custom value
const OTHER = "Other";

/* =========================================================
   REUSABLE FIELD: DROPDOWN (single choice)
   options: [{ value, label }]
   ========================================================= */

function SelectField({
  id,
  label,
  icon,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  required,
  optional,
  help,
}) {
  return (
    <div className="create-job-field">

      <label htmlFor={id}>
        {label}

        {optional ? (
          <span className="create-job-optional">Optional</span>
        ) : (
          <span>*</span>
        )}
      </label>

      <div className="create-job-input-wrapper">

        <span className="create-job-input-icon">{icon}</span>

        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          disabled={disabled}
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

      </div>

      {help && <small>{help}</small>}

    </div>
  );
}

/* =========================================================
   REUSABLE FIELD: TEXT INPUT
   ========================================================= */

function TextField({
  id,
  label,
  icon,
  value,
  onChange,
  placeholder,
  disabled,
  required,
}) {
  return (
    <div className="create-job-field">

      <label htmlFor={id}>
        {label}

        <span>*</span>
      </label>

      <div className="create-job-input-wrapper">

        <span className="create-job-input-icon">{icon}</span>

        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />

      </div>

    </div>
  );
}

/* =========================================================
   REUSABLE FIELD: SEARCHABLE MULTI-SELECT
   Used for both "Required Skills" and "Required Education".

   - `selected` is the list of chosen values
   - `onChange` receives the new list
   - choosing "Other" shows a box to add a custom value
   ========================================================= */

function MultiSelectField({
  id,
  label,
  icon,
  options,
  selected,
  onChange,
  disabled,
  wide,
  placeholder,
  countLabel,
  searchPlaceholder,
  emptyText,
  noResultsText,
  help,
  customLabel,
  customPlaceholder,
  customHelp,
  customWide,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customValue, setCustomValue] = useState("");

  const dropdownRef = useRef(null);

  /* ---------- Close when clicking outside ---------- */
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  /* ---------- Clear the search when the list closes ---------- */
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  /* ---------- Derived values ---------- */
  const visibleSelected = selected.filter((item) => item !== OTHER);

  const isOtherSelected = selected.includes(OTHER);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.trim().toLowerCase())
  );

  /* ---------- Handlers ---------- */
  const handleToggle = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleRemove = (itemToRemove) => {
    onChange(selected.filter((item) => item !== itemToRemove));
  };

  const handleAddCustom = () => {
    const value = customValue.trim();

    if (!value) {
      return;
    }

    const alreadyExists = selected.some(
      (item) => item.toLowerCase() === value.toLowerCase()
    );

    if (!alreadyExists) {
      onChange([...selected, value]);
    }

    setCustomValue("");
  };

  /* ---------- UI ---------- */
  return (
    <>
      <div
        className={
          wide
            ? "create-job-field create-job-field-full"
            : "create-job-field"
        }
      >

        <label htmlFor={id}>
          {label}

          <span>*</span>
        </label>

        <div className="create-job-input-wrapper create-job-skills-wrapper">

          <span className="create-job-input-icon">{icon}</span>

          <div ref={dropdownRef} className="create-job-native-dropdown">

            {/* Trigger button */}
            <button
              type="button"
              id={id}
              className="create-job-select-trigger"
              onClick={() => setOpen((current) => !current)}
              disabled={disabled}
              aria-expanded={open}
              aria-haspopup="listbox"
            >
              <div className="create-job-select-trigger-content">

                {visibleSelected.length > 0 ? (
                  <div className="create-job-select-count">
                    <span>{countLabel}</span>

                    <span className="create-job-select-count-number">
                      {visibleSelected.length}
                    </span>
                  </div>
                ) : (
                  <span className="create-job-select-placeholder">
                    {placeholder}
                  </span>
                )}

                <span
                  className={
                    open
                      ? "create-job-select-arrow open"
                      : "create-job-select-arrow"
                  }
                >
                  ▼
                </span>

              </div>
            </button>

            {/* Dropdown list */}
            {open && (
              <div
                className="create-job-dropdown-popup"
                role="listbox"
                aria-multiselectable="true"
              >

                <div className="create-job-dropdown-search">

                  <div className="create-job-dropdown-search-wrapper">

                    <span className="create-job-dropdown-search-icon">
                      🔍
                    </span>

                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          setOpen(false);
                        }

                        event.stopPropagation();
                      }}
                      placeholder={searchPlaceholder}
                      autoComplete="off"
                      autoFocus
                    />

                  </div>

                </div>

                <div className="create-job-dropdown-list">

                  {filteredOptions.length === 0 ? (
                    <div className="create-job-no-results">
                      {noResultsText}
                    </div>
                  ) : (
                    filteredOptions.map((option) => {
                      const isSelected = selected.includes(option);

                      return (
                        <button
                          type="button"
                          key={option}
                          className={
                            isSelected
                              ? "create-job-dropdown-option selected"
                              : "create-job-dropdown-option"
                          }
                          onClick={() => handleToggle(option)}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <span className="create-job-dropdown-check">
                            {isSelected ? "✓" : ""}
                          </span>

                          <span className="create-job-dropdown-option-text">
                            {option}
                          </span>
                        </button>
                      );
                    })
                  )}

                </div>

              </div>
            )}

          </div>

        </div>

        {/* Selected chips */}
        {visibleSelected.length === 0 ? (
          <div className="create-job-empty-selection">{emptyText}</div>
        ) : (
          <div className="create-job-selected-items">
            {visibleSelected.map((item) => (
              <div key={item} className="create-job-selection-chip">

                <span className="create-job-chip-label">{item}</span>

                <button
                  type="button"
                  aria-label={`Remove ${item}`}
                  onClick={() => handleRemove(item)}
                  className="create-job-chip-remove"
                  disabled={disabled}
                >
                  ×
                </button>

              </div>
            ))}
          </div>
        )}

        <small>{help}</small>

      </div>

      {/* Custom value (only after choosing "Other") */}
      {isOtherSelected && (
        <div
          className={
            customWide
              ? "create-job-field create-job-field-full"
              : "create-job-field"
          }
        >

          <label htmlFor={`${id}-custom`}>
            {customLabel}

            <span>*</span>
          </label>

          <div className="create-job-custom-input-row">

            <div className="create-job-input-wrapper">

              <span className="create-job-input-icon">✏️</span>

              <input
                id={`${id}-custom`}
                type="text"
                value={customValue}
                onChange={(event) => setCustomValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();

                    handleAddCustom();
                  }
                }}
                placeholder={customPlaceholder}
                disabled={disabled}
              />

            </div>

            <button
              type="button"
              onClick={handleAddCustom}
              disabled={disabled || !customValue.trim()}
              className="create-job-custom-add-button"
            >
              Add
            </button>

          </div>

          <small>{customHelp}</small>

        </div>
      )}
    </>
  );
}

/* =========================================================
   CREATE JOB PAGE
   ========================================================= */

function CreateJob() {
  const [title, setTitle] = useState("");
  const [customTitle, setCustomTitle] = useState("");

  const [description, setDescription] = useState("");

  const [requiredSkills, setRequiredSkills] = useState([]);

  const [minExperience, setMinExperience] = useState("");

  const [requiredEducation, setRequiredEducation] = useState([]);

  const [location, setLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dropdown options in { value, label } form
  const toOptions = (list) =>
    list.map((item) => ({ value: item, label: item }));

  const showError = (text) => {
    setIsSuccess(false);
    setMessage(text);
  };

  /* =========================================================
     HANDLE SUBMIT
     ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    // ----- Job title -----
    if (!title) {
      showError("Please select a job title.");
      return;
    }

    if (title === OTHER && !customTitle.trim()) {
      showError("Please enter the custom job title.");
      return;
    }

    // ----- Location -----
    if (!location) {
      showError("Please select a job location.");
      return;
    }

    if (location === OTHER && !customLocation.trim()) {
      showError("Please enter the custom job location.");
      return;
    }

    // ----- Description -----
    if (!description.trim()) {
      showError("Please enter the job description.");
      return;
    }

    // ----- Skills -----
    if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      showError("Please select at least one required skill.");
      return;
    }

    const finalSkills = requiredSkills.filter((skill) => skill !== OTHER);

    if (finalSkills.length === 0) {
      showError("Please select or enter at least one required skill.");
      return;
    }

    // ----- Education -----
    if (
      !Array.isArray(requiredEducation) ||
      requiredEducation.length === 0
    ) {
      showError("Please select at least one required education.");
      return;
    }

    const finalEducation = requiredEducation.filter(
      (education) => education !== OTHER
    );

    if (finalEducation.length === 0) {
      showError("Please select or enter at least one required education.");
      return;
    }

    // ----- Build the backend-compatible job object -----
    const job = {
      title: title === OTHER ? customTitle.trim() : title,

      description: description.trim(),

      requiredSkills: finalSkills.join(", "),

      minimumExperience:
        minExperience === "" ? null : Number(minExperience),

      educationRequirement: finalEducation.join(", "),

      location: location === OTHER ? customLocation.trim() : location,
    };

    console.log("Job data being sent:", job);

    setLoading(true);

    try {
      const result = await api.post("/jobs", job);

      console.log("Job created:", result);

      setIsSuccess(true);
      setMessage("Job created successfully!");

      // ----- Reset the form -----
      setTitle("");
      setCustomTitle("");

      setDescription("");

      setRequiredSkills([]);

      setMinExperience("");

      setRequiredEducation([]);

      setLocation("");
      setCustomLocation("");
    } catch (error) {
      console.error("Job creation failed:", error);

      showError(error?.message || "Failed to create job.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     UI
     ========================================================= */

  return (
    <div className="create-job-page">

      <div className="create-job-container">

        {/* ===================== PAGE HEADER ===================== */}

        <header className="create-job-header">

          <div className="create-job-header-icon">＋</div>

          <div>

            <span className="create-job-eyebrow">RECRUITER WORKSPACE</span>

            <h1>Create New Job</h1>

            <p>
              Add the job details to attract and evaluate the right
              candidates.
            </p>

          </div>

        </header>

        {/* ======================= FORM CARD ======================= */}

        <div className="create-job-card">

          <div className="create-job-card-header">

            <div>

              <h2>Job Information</h2>

              <p>Provide accurate details about the position.</p>

            </div>

            <span className="create-job-required-note">* Required</span>

          </div>

          <form className="create-job-form" onSubmit={handleSubmit}>

            {/* ----- Job title ----- */}
            <SelectField
              id="job-title"
              label="Job Title"
              icon="💼"
              value={title}
              onChange={setTitle}
              options={toOptions(jobTitleOptions)}
              placeholder="Select Job Title"
              required
              disabled={loading}
            />

            {/* ----- Location ----- */}
            <SelectField
              id="job-location"
              label="Location"
              icon="📍"
              value={location}
              onChange={setLocation}
              options={toOptions(locationOptions)}
              placeholder="Select Location"
              required
              disabled={loading}
            />

            {/* ----- Custom job title ----- */}
            {title === OTHER && (
              <TextField
                id="custom-job-title"
                label="Enter Job Title"
                icon="✏️"
                value={customTitle}
                onChange={setCustomTitle}
                placeholder="Enter the job title"
                required
                disabled={loading}
              />
            )}

            {/* ----- Custom location ----- */}
            {location === OTHER && (
              <TextField
                id="custom-location"
                label="Enter Location"
                icon="✏️"
                value={customLocation}
                onChange={setCustomLocation}
                placeholder="Enter city, state, country or remote location"
                required
                disabled={loading}
              />
            )}

            {/* ----- Job description ----- */}
            <div className="create-job-field create-job-field-full">

              <label htmlFor="job-description">
                Job Description

                <span>*</span>
              </label>

              <textarea
                id="job-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the role, responsibilities, technical requirements, and other important details..."
                rows={8}
                required
                disabled={loading}
              />

              <small>
                Provide a detailed description of the position and its
                responsibilities.
              </small>

            </div>

            {/* ----- Required skills ----- */}
            <MultiSelectField
              id="required-skills"
              label="Required Skills"
              icon="⚙"
              options={skillOptions}
              selected={requiredSkills}
              onChange={setRequiredSkills}
              disabled={loading}
              wide
              placeholder="Select required skills"
              countLabel="Skills selected"
              searchPlaceholder="Search skills..."
              emptyText="No skills selected yet"
              noResultsText="No skills found."
              help="Search and select multiple skills. Selected skills appear below and can be removed individually."
              customLabel="Add Custom Skill"
              customPlaceholder="Enter a skill not listed above"
              customHelp="Add the custom skill, then continue selecting other skills if required."
              customWide
            />

            {/* ----- Experience ----- */}
            <SelectField
              id="job-experience"
              label="Experience Required"
              icon="◷"
              value={minExperience}
              onChange={setMinExperience}
              options={experienceOptions}
              placeholder="Select Experience"
              disabled={loading}
              optional
              help="Select the minimum experience required for this position."
            />

            {/* ----- Required education ----- */}
            <MultiSelectField
              id="job-education"
              label="Required Education"
              icon="🎓"
              options={educationOptions}
              selected={requiredEducation}
              onChange={setRequiredEducation}
              disabled={loading}
              placeholder="Select required education"
              countLabel="Education selected"
              searchPlaceholder="Search education..."
              emptyText="No education selected yet"
              noResultsText="No education options found."
              help="Search and select one or more acceptable education qualifications."
              customLabel="Add Custom Education"
              customPlaceholder="Enter a qualification not listed above"
              customHelp="You can add a custom qualification and still select other education options."
            />

            {/* ----- Message ----- */}
            {message && (
              <div
                className={
                  isSuccess
                    ? "create-job-message success"
                    : "create-job-message error"
                }
              >

                <span className="create-job-message-icon">
                  {isSuccess ? "✓" : "!"}
                </span>

                <p>{message}</p>

              </div>
            )}

            {/* ----- Form footer ----- */}
            <div className="create-job-form-footer">

              <div className="create-job-form-note">

                <span>✨</span>

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
                    <span>→</span>
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