import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../services/api";

function MyProfile() {
  const navigate = useNavigate();
const location = useLocation();

  const [user, setUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [newSkill, setNewSkill] = useState("");
  
  // Profile Autofill state
  const [autofillFile, setAutofillFile] = useState(null);
  const [autofillLoading, setAutofillLoading] = useState(false);
  const [autofillError, setAutofillError] = useState("");
  const [autofillSuggestions, setAutofillSuggestions] = useState(null);
  const [autofillFileName, setAutofillFileName] = useState("");

  useEffect(() => {
  console.log(
    "EDIT USER ACHIEVEMENTS CHANGED:",
    editUser?.achievements
  );
}, [editUser?.achievements]);


const handleProfileAutofill = async () => {
  if (!autofillFile) {
    setAutofillError("Please select a resume file first.");
    return;
  }

  setAutofillLoading(true);
  setAutofillError("");
  setAutofillSuggestions(null);
  setAutofillFileName("");

  try {
    const formData = new FormData();
    formData.append("file", autofillFile);

    const response = await api.upload(
      "/resumes/profile-autofill",
      formData
    );

    setAutofillSuggestions(response.profile);
    setAutofillFileName(response.fileName || autofillFile.name);
  } catch (error) {
    setAutofillError(
      error.message || "Unable to extract profile information."
    );
  } finally {
    setAutofillLoading(false);
  }
};

  /*
   * =========================================================
   * Contact information
   * =========================================================
   */
  const [isContactEditing, setIsContactEditing] =
    useState(false);

  const [contactSaving, setContactSaving] =
    useState(false);

  const [contactError, setContactError] =
    useState("");

  const [contactSuccess, setContactSuccess] =
    useState("");

  /*
   * =========================================================
   * Education Information
   * =========================================================
   */
  const [isEducationEditing, setIsEducationEditing] =
    useState(false);

  const [educationSaving, setEducationSaving] =
    useState(false);

  const [educationError, setEducationError] =
    useState("");

  const [educationSuccess, setEducationSuccess] =
    useState("");

  /*
   * =========================================================
   * Experience Information
   * =========================================================
   */
  const [isExperienceEditing, setIsExperienceEditing] =
    useState(false);

  const [experienceSaving, setExperienceSaving] =
    useState(false);

  const [experienceError, setExperienceError] =
    useState("");

  const [experienceSuccess, setExperienceSuccess] =
    useState("");

  /*
   * =========================================================
   * Skills Information
   * =========================================================
   */
  const [isSkillsEditing, setIsSkillsEditing] =
    useState(false);

  const [skillsSaving, setSkillsSaving] =
    useState(false);

  const [skillsError, setSkillsError] =
    useState("");

  const [skillsSuccess, setSkillsSuccess] =
    useState("");

  /*
   * =========================================================
   * Projects Information
   * =========================================================
   */
  const [isProjectsEditing, setIsProjectsEditing] =
    useState(false);

  const [projectsSaving, setProjectsSaving] =
    useState(false);

  const [projectsError, setProjectsError] =
    useState("");

  const [projectsSuccess, setProjectsSuccess] =
    useState("");

  const [isCertificationsEditing, setIsCertificationsEditing] = useState(false);
  const [certificationsSaving, setCertificationsSaving] = useState(false);
  const [certificationsError, setCertificationsError] = useState("");
  const [certificationsSuccess, setCertificationsSuccess] = useState("");

  const [isAchievementsEditing, setIsAchievementsEditing] = useState(false);
  const [achievementsSaving, setAchievementsSaving] = useState(false);
  const [achievementsError, setAchievementsError] = useState("");
  const [achievementsSuccess, setAchievementsSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentUser = await api.get(
          "/users/me/profile"
        );

        console.log(
          "Complete applicant profile:",
          currentUser
        );
        console.log(
  "BACKEND EXPERIENCE DATA:",
  JSON.stringify(currentUser.experience, null, 2)
);

        if (!currentUser) {
          setUser(null);
          return;
        }

        console.log(
  "PROFILE LOADED FROM BACKEND:",
  currentUser.achievements
);
console.log(
  "NAVIGATION STATE AT PROFILE LOAD:",
  location.state
);

        setUser(currentUser);
        console.log(
  "EXPERIENCE FROM BACKEND BEFORE SETEDITUSER:",
  JSON.stringify(currentUser.experience, null, 2)
);

setEditUser((previousUser) => {
  // Preserve the user's current edits if they already exist.
  if (previousUser) {
    return {
      ...currentUser,
      ...previousUser,
      achievements:
        previousUser.achievements?.length
          ? previousUser.achievements
          : currentUser.achievements ?? [],
    };
  }

  return {
    ...currentUser,
    achievements: currentUser.achievements ?? [],
  };
});
      } catch (error) {
        console.error(
          "Failed to load applicant profile:",
          error
        );

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

useEffect(() => {
  const extracted = location.state?.autofillProfile;

  console.log("PROFILE NAVIGATION STATE:", location.state);
console.log("EXTRACTED PROFILE:", extracted);
  console.log("AUTOFILL ACHIEVEMENTS:", extracted?.achievements);
console.log("CURRENT PROFILE ACHIEVEMENTS:", user?.achievements);


  if (!user || !extracted) {
    return;
  }
console.log(
  "ACHIEVEMENTS BEFORE MAPPING:",
  extracted?.achievements
);

const current = user;
const mappedExperience = [
  ...(extracted.workExperience ?? []),
  ...(extracted.internships ?? []),
]
  .filter(
    (item, index, array) =>
      array.findIndex(
        (other) =>
          other.company === item.company &&
          other.jobTitle === item.jobTitle &&
          other.startDate === item.startDate
      ) === index
  )
  .map((item) => {
    const normalizeDate = (value) => {
      if (!value) return "";

      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
      }

      const match = value.trim().match(/^([A-Za-z]+)\s+(\d{4})$/);

      if (match) {
        const months = [
          "jan", "feb", "mar", "apr", "may", "jun",
          "jul", "aug", "sep", "oct", "nov", "dec",
        ];

        const monthIndex = months.findIndex(
          (month) => month === match[1].slice(0, 3).toLowerCase()
        );

        if (monthIndex !== -1) {
          return `${match[2]}-${String(monthIndex + 1).padStart(2, "0")}-01`;
        }
      }

      return "";
    };

    return {
      ...item,
      experienceId: item.experienceId ?? item.id ?? null,
      resumeId: user.resumeId,
      company: item.company ?? "",
      jobTitle: item.jobTitle ?? "",
      startDate: normalizeDate(item.startDate),
      endDate: normalizeDate(item.endDate),
      description: item.description ?? "",
      isNew: item.isNew ?? true,
    };
  });

console.log(
  "MAPPED EXPERIENCE:",
  JSON.stringify(mappedExperience, null, 2)
);

console.log("EXTRACTED INTERNSHIPS:", extracted?.internships);
console.log("EXTRACTED WORK EXPERIENCE:", extracted?.workExperience);
  setEditUser({
    ...current,

    phone: extracted.phone ?? current.phone ?? "",
    linkedin: extracted.linkedin ?? current.linkedin ?? "",
    github: extracted.github ?? current.github ?? "",
    portfolio: extracted.portfolio ?? current.portfolio ?? "",

    education: (extracted.education ?? current.education ?? []).map(
      (item) => ({
        ...item,
educationId: item.educationId ?? item.id ?? null,
degree: item.degree ?? "",
        institution: item.institution ?? "",
        fieldOfStudy: item.fieldOfStudy ?? "",
        startYear: item.startYear ?? "",
        endYear: item.endYear ?? "",
        grade: item.grade ?? "",
        isNew: item.isNew ?? true,
      })
    ),
    experience: mappedExperience,

    skills: [
      ...new Map(
        [
          ...(extracted.technicalSkills ?? []),
          ...(extracted.softSkills ?? []),
        ].map((skill) => {
          const value =
            typeof skill === "string" ? skill : skill.name;

          return [value?.toLowerCase(), value];
        })
      ).values(),
    ].filter(Boolean),

    projects: (extracted.projects ?? current.projects ?? []).map(
      (item) => ({
        ...item,
        title: item.title ?? "",
        description: item.description ?? "",
        year: item.year ?? "",
        technologies: item.technologies ?? [],
        isNew: item.isNew ?? true,
      })
    ),

    certifications: (
      extracted.certifications ?? current.certifications ?? []
    ).map((item) => ({
      ...item,
      name: item.name ?? "",
      isNew: item.isNew ?? true,
    })),

    achievements: (
  extracted.achievements ?? current.achievements ?? []
).map((item) => {
  if (typeof item === "string") {
    return {
      achievementId: null,
      title: item,
      description: "",
      date: "",
      issuer: "",
      isNew: true,
    };
  }

  return {
    ...item,
    title: item.title ?? "",
    description: item.description ?? "",
    date: item.date ?? "",
    issuer: item.issuer ?? "",
    isNew: item.isNew ?? true,
  };
}),
  } );

  setIsEditing(true);
  setIsContactEditing(true);
  setIsEducationEditing(true);
  setIsExperienceEditing(true);
  setIsSkillsEditing(true);
  setIsProjectsEditing(true);
  setIsCertificationsEditing(true);

  console.log(
  "AUTOFILL MAPPED ACHIEVEMENTS:",
  editUser?.achievements
);
  setIsAchievementsEditing(true);

  navigate(location.pathname, {
    replace: true,
    state: null,
  });
}, [user, location.state, location.pathname, navigate]); 
  /*
   * =========================================================
   * MAIN PROFILE EDIT
   * =========================================================
   */

  const handleEditProfile = () => {
    setSaveError("");

    setEditUser({
      ...user,
      education: Array.isArray(user.education)
        ? user.education.map((item) => ({
            ...item,
          }))
        : [],
      experience: Array.isArray(user.experience)
        ? user.experience.map((item) => ({
            ...item,
          }))
        : [],
      skills: Array.isArray(user.skills)
        ? [...user.skills]
        : [],
      projects: Array.isArray(user.projects)
        ? user.projects.map((project) => ({
            ...project,
            technologies: Array.isArray(
              project.technologies
            )
              ? [...project.technologies]
              : [],
          }))
        : [],
        certifications: Array.isArray(user.certifications)
  ? user.certifications.map((item) => ({ ...item }))
  : [],
achievements: Array.isArray(editUser?.achievements)
  ? editUser.achievements.map((item) => ({ ...item }))
  : Array.isArray(user.achievements)
    ? user.achievements.map((item) => ({ ...item }))
    : [],
    });

    setIsEditing(true);

setIsContactEditing(true);
setIsEducationEditing(true);
setIsExperienceEditing(true);
setIsSkillsEditing(true);
setIsProjectsEditing(true);
setIsCertificationsEditing(true);
setIsAchievementsEditing(true);
  };

  const handleCancelEdit = () => {
    setSaveError("");

    setEditUser({
      ...user,
      education: Array.isArray(user.education)
        ? user.education.map((item) => ({
            ...item,
          }))
        : [],
      experience: Array.isArray(user.experience)
        ? user.experience.map((item) => ({
            ...item,
          }))
        : [],
      skills: Array.isArray(user.skills)
        ? [...user.skills]
        : [],
      projects: Array.isArray(user.projects)
        ? user.projects.map((project) => ({
            ...project,
            technologies: Array.isArray(
              project.technologies
            )
              ? [...project.technologies]
              : [],
          }))
        : [],
    });

    setIsEditing(false);
  };

  /*
   * =========================================================
   * CONTACT HANDLERS
   * =========================================================
   */

  const handleContactChange = (field, value) => {
    setEditUser((previousUser) => ({
      ...previousUser,
      [field]: value,
    }));
  };

  const handleEditContact = () => {
    setContactError("");
    setContactSuccess("");

    setEditUser((previousUser) => ({
      ...previousUser,
      phone: user.phone || "",
      linkedin: user.linkedin || "",
      github: user.github || "",
      portfolio: user.portfolio || "",
    }));

    setIsContactEditing(true);
  };

  const handleCancelContact = () => {
    setContactError("");
    setContactSuccess("");

    setEditUser((previousUser) => ({
      ...previousUser,
      phone: user.phone || "",
      linkedin: user.linkedin || "",
      github: user.github || "",
      portfolio: user.portfolio || "",
    }));

    setIsContactEditing(false);
  };

  const handleSaveContact = async () => {
    if (!user?.resumeId) {
      const message =
        "Resume information is not available.";

      setContactError(message);
      window.alert(message);

      return;
    }

    setContactSaving(true);
    setContactError("");
    setContactSuccess("");

    try {
      const resumeProfile = await api.get(
        `/resume-profiles/resume/${user.resumeId}`
      );

      if (!resumeProfile?.profileId) {
        throw new Error(
          "Resume profile information is not available."
        );
      }

      const updatedProfile = await api.put(
        `/resume-profiles/${resumeProfile.profileId}`,
        {
          phone:
            editUser?.phone?.trim() || null,

          linkedin:
            editUser?.linkedin?.trim() || null,

          github:
            editUser?.github?.trim() || null,

          portfolio:
            editUser?.portfolio?.trim() || null,
        }
      );

      const updatedUser = {
        ...user,

        phone: updatedProfile.phone,
        linkedin: updatedProfile.linkedin,
        github: updatedProfile.github,
        portfolio: updatedProfile.portfolio,
      };

      setUser(updatedUser);
      setEditUser(updatedUser);

      setIsContactEditing(false);

      setContactSuccess(
        "Contact information saved successfully."
      );
    } catch (error) {
      console.error(
        "Failed to save contact information:",
        error
      );

      const errorMessage =
        error?.message ||
        "Unable to save contact information.";

      setContactError(errorMessage);

      window.alert(errorMessage);
    } finally {
      setContactSaving(false);
    }
  };

  /*
   * =========================================================
   * EDUCATION HANDLERS
   * =========================================================
   */

  const handleEditEducation = () => {
    setEducationError("");
    setEducationSuccess("");

    setEditUser((previousUser) => ({
      ...previousUser,
      education: (user.education || []).map(
        (educationItem) => ({
          ...educationItem,
        })
      ),
    }));

    setIsEducationEditing(true);
  };

  const handleCancelEducation = () => {
    setEducationError("");
    setEducationSuccess("");

    setEditUser((previousUser) => ({
      ...previousUser,
      education: (user.education || []).map(
        (educationItem) => ({
          ...educationItem,
        })
      ),
    }));

    setIsEducationEditing(false);
  };

  const handleAddEducation = () => {
    setEducationError("");
    setEducationSuccess("");

    setEditUser((previousUser) => ({
      ...previousUser,
      education: [
        ...(previousUser.education || []),
        {
          educationId: null,
          degree: "",
          institution: "",
          fieldOfStudy: "",
          startYear: "",
          endYear: "",
          grade: "",
          isNew: true,
        },
      ],
    }));

    setIsEducationEditing(true);
  };

  const handleSaveEducation = async () => {
    setEducationSaving(true);
    setEducationError("");
    setEducationSuccess("");

    try {
      const updatedEducation = [];

      for (
        const educationItem of editUser?.education || []
      ) {
        const startYear =
          educationItem.startYear
            ? Number(educationItem.startYear)
            : null;

        const endYear =
          educationItem.endYear
            ? Number(educationItem.endYear)
            : null;

        if (
          startYear !== null &&
          endYear !== null &&
          endYear < startYear
        ) {
          throw new Error(
            "End year cannot be earlier than start year."
          );
        }

        const educationPayload = {
          degree:
            educationItem.degree?.trim() || "",

          institution:
            educationItem.institution?.trim() || "",

          fieldOfStudy:
            educationItem.fieldOfStudy?.trim() || "",

          startYear: startYear,

          endYear: endYear,

          grade:
            educationItem.grade?.trim() || null,
        };

        let updatedEducationItem;
if (educationItem.educationId) {
  updatedEducationItem = await api.put(
    `/educations/${educationItem.educationId}`,
    educationPayload
  );
} else {
  updatedEducationItem = await api.post(
    "/educations",
    {
      ...educationPayload,
      resumeId: user.resumeId,
    }
  );
}

        updatedEducation.push(
          updatedEducationItem
        );
      }

      const updatedUser = {
        ...user,
        education: updatedEducation,
      };

      setUser(updatedUser);
      setEditUser(updatedUser);

      setIsEducationEditing(false);

      setEducationSuccess(
        "Education information saved successfully."
      );
    } catch (error) {
      console.error(
        "Failed to save education information:",
        error
      );

      const errorMessage =
        error?.message ||
        "Unable to save education information.";

      setEducationError(errorMessage);

      window.alert(errorMessage);
    } finally {
      setEducationSaving(false);
    }
  };

  const handleEducationChange = (
    educationIndex,
    field,
    value
  ) => {
    setEditUser((previousUser) => {
      const updatedEducation = [
        ...(previousUser.education || []),
      ];

      updatedEducation[educationIndex] = {
        ...updatedEducation[educationIndex],
        [field]: value,
      };

      return {
        ...previousUser,
        education: updatedEducation,
      };
    });
  };

  /*
   * =========================================================
   * EXPERIENCE HANDLERS
   * =========================================================
   */

  const handleEditExperience = () => {
    setExperienceError("");
    setExperienceSuccess("");

    setEditUser((previousUser) => ({
      ...previousUser,
      experience: (previousUser?.experience || []).map(
  (experienceItem) => ({ ...experienceItem })
),
    }));

    setIsExperienceEditing(true);
  };

  const handleCancelExperience = () => {
    setExperienceError("");
    setExperienceSuccess("");

    setEditUser((previousUser) => ({
      ...previousUser,
      experience: (user.experience || []).map(
        (experienceItem) => ({
          ...experienceItem,
        })
      ),
    }));

    setIsExperienceEditing(false);
  };

  /*
   * ADD NEW EXPERIENCE
   */
  const handleAddExperience = () => {
    setExperienceError("");
    setExperienceSuccess("");

    setEditUser((previousUser) => ({
      ...previousUser,

      experience: [
        ...(previousUser.experience || []),

        {
          experienceId: null,
          resumeId: user.resumeId,
          company: "",
          jobTitle: "",
          startDate: "",
          endDate: "",
          description: "",
          isNew: true,
        },
      ],
    }));
  };

  const handleDeleteExperience = async (
    experienceItem,
    experienceIndex
  ) => {
    setExperienceError("");
    setExperienceSuccess("");

    // =========================================================
    // NEW / UNSAVED EXPERIENCE
    // =========================================================

    if (!experienceItem?.experienceId) {
      setEditUser((previousUser) => ({
        ...previousUser,
        experience: (
          previousUser.experience || []
        ).filter(
          (_, index) => index !== experienceIndex
        ),
      }));

      setExperienceSuccess(
        "New experience removed."
      );

      return;
    }

    // =========================================================
    // CONFIRM DATABASE DELETION
    // =========================================================

    const confirmed = window.confirm(
      "Are you sure you want to delete this experience? This will permanently remove it from your profile."
    );

    if (!confirmed) {
      return;
    }

    setExperienceSaving(true);

    try {
      // =======================================================
      // DELETE FROM DATABASE
      // =======================================================
await api.delete(
  `/experiences/${experienceItem.experienceId}`
);
      // =======================================================
      // UPDATE FRONTEND STATE
      // =======================================================

      const updatedExperience =
        (user.experience || []).filter(
          (item) =>
            item.experienceId !==
            experienceItem.experienceId
        );

      setUser((previousUser) => ({
  ...previousUser,
  experience: updatedExperience,
}));

setEditUser((previousUser) => ({
  ...previousUser,
  experience: updatedExperience,
}));

      setExperienceSuccess(
        "Experience deleted successfully."
      );
    } catch (error) {
      console.error(
        "Failed to delete experience:",
        error
      );

      setExperienceError(
        error?.message ||
        "Unable to delete experience."
      );
    } finally {
      setExperienceSaving(false);
    }
  };

  const handleExperienceChange = (
  experienceIndex,
  field,
  value
) => {
  setEditUser((previousUser) => {
    const updatedExperience = [
      ...(previousUser.experience || []),
    ];

    updatedExperience[experienceIndex] = {
      ...updatedExperience[experienceIndex],
      [field]: value,
    };

    console.log(
      "EXPERIENCE FIELD CHANGED:",
      field,
      "=",
      value
    );

    console.log(
      "EXPERIENCE AFTER CHANGE:",
      JSON.stringify(updatedExperience, null, 2)
    );

    return {
      ...previousUser,
      experience: updatedExperience,
    };
  });
};

  const handleSaveExperience = async () => {
    console.log(
  "DEDICATED EXPERIENCE SAVE CLICKED",
  JSON.stringify(editUser?.experience, null, 2)
);
    setExperienceSaving(true);
    setExperienceError("");
    setExperienceSuccess("");

    try {
      await validateExperienceDates();

console.log(
  "EXPERIENCE STATE BEFORE SAVE:",
  JSON.stringify(editUser?.experience, null, 2)
);

const updatedExperience = [];

      for (const experienceItem of editUser?.experience || []) {
        const experiencePayload = {
          company: experienceItem.company?.trim() || "",
          jobTitle: experienceItem.jobTitle?.trim() || "",
          startDate: experienceItem.startDate || null,
          endDate: experienceItem.endDate || null,
          description: experienceItem.description?.trim() || null,
        };

        console.log(
  "EXPERIENCE PAYLOAD BEING SAVED:",
  JSON.stringify(experiencePayload, null, 2)
);

        if (!experienceItem.experienceId) {
          if (!experiencePayload.company) {
            throw new Error(
              "Company name is required for every new experience."
            );
          }

          if (!experiencePayload.jobTitle) {
            throw new Error(
              "Job title is required for every new experience."
            );
          }

          if (!experiencePayload.startDate) {
            throw new Error(
              "Start date is required for every new experience."
            );
          }

          if (
            experiencePayload.endDate &&
            experiencePayload.endDate < experiencePayload.startDate
          ) {
            throw new Error(
              "End date cannot be earlier than start date."
            );
          }

         const newExperience = await api.post(
  "/experiences",
  {
    ...experiencePayload,
    resumeId: user.resumeId,
  }
);

updatedExperience.push(newExperience);
continue;
}

const updatedExperienceItem = await api.put(
  `/experiences/${experienceItem.experienceId}`,
  experiencePayload
);

updatedExperience.push(updatedExperienceItem);
}

const existingExperienceIds = new Set(
  (user?.experience || [])
    .map((item) => item.experienceId)
    .filter(Boolean)
);

const currentExperienceIds = new Set(
  updatedExperience
    .map((item) => item?.experienceId)
    .filter(Boolean)
);

for (const experienceId of existingExperienceIds) {
  if (!currentExperienceIds.has(experienceId)) {
    await api.delete(
      `/experiences/${experienceId}`
    );
  }
}

      setUser((previousUser) => ({
  ...previousUser,
  experience: updatedExperience,
}));

setEditUser((previousUser) => ({
  ...previousUser,
  experience: updatedExperience,
}));
      setIsExperienceEditing(false);
      setExperienceSuccess(
        "Experience information saved successfully."
      );
    } catch (error) {
      console.error(
        "Failed to save experience information:",
        error
      );

      setExperienceError(
        error?.message ||
          "Unable to save experience information."
      );
    } finally {
      setExperienceSaving(false);
    }
  };

  /*
   * =========================================================
   * SKILLS HANDLERS
   * =========================================================
   */

  const handleEditSkills = () => {
    setSkillsError("");
    setSkillsSuccess("");

    setEditUser((previousUser) => ({
      ...previousUser,
      skills: Array.isArray(user.skills)
        ? [...user.skills]
        : [],
    }));

    setIsSkillsEditing(true);
  };

  const handleCancelSkills = () => {
    setSkillsError("");
    setSkillsSuccess("");

    setEditUser((previousUser) => ({
      ...previousUser,
      skills: Array.isArray(user.skills)
        ? [...user.skills]
        : [],
    }));

    setIsSkillsEditing(false);
  };

  const handleSkillsChange = (value) => {
    const updatedSkills = value
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    setEditUser((previousUser) => ({
      ...previousUser,
      skills: updatedSkills,
    }));
  };

  const handleAddSkill = () => {
    const skill = newSkill.trim();

    if (!skill) {
      return;
    }

    const currentSkills = Array.isArray(
      editUser?.skills
    )
      ? editUser.skills
      : [];

    const alreadyExists = currentSkills.some(
      (existingSkill) =>
        existingSkill.toLowerCase() ===
        skill.toLowerCase()
    );

    if (alreadyExists) {
      setSkillsError(
        "This skill has already been added."
      );

      return;
    }

    setEditUser((previousUser) => ({
      ...previousUser,

      skills: [
        ...(previousUser.skills || []),
        skill,
      ],
    }));

    setNewSkill("");
    setSkillsError("");
  };

  const handleRemoveSkill = (skillIndex) => {
    setEditUser((previousUser) => ({
      ...previousUser,

      skills: (previousUser.skills || []).filter(
        (_, index) => index !== skillIndex
      ),
    }));

    setSkillsError("");
  };

  const handleSaveSkills = async () => {
    if (!user?.resumeId) {
      setSkillsError(
        "Resume information is not available."
      );

      return;
    }

    setSkillsSaving(true);
    setSkillsError("");
    setSkillsSuccess("");

    try {
      const skillsToSave = (
        editUser?.skills || []
      )
        .map((skill) =>
          typeof skill === "string"
            ? skill.trim()
            : ""
        )
        .filter(Boolean)
        .filter(
          (skill, index, array) =>
            array.findIndex(
              (existingSkill) =>
                existingSkill.toLowerCase() ===
                skill.toLowerCase()
            ) === index
        );

      const updatedSkills = await api.put(
        `/resume-skills/resume/${user.resumeId}`,
        skillsToSave
      );

      const finalSkills =
        Array.isArray(updatedSkills)
          ? updatedSkills
          : skillsToSave;

      const updatedUser = {
        ...user,
        skills: finalSkills,
      };

      setUser(updatedUser);
      setEditUser(updatedUser);

      setIsSkillsEditing(false);

      setSkillsSuccess(
        "Skills information saved successfully."
      );
    } catch (error) {
      console.error(
        "Failed to save skills information:",
        error
      );

      setSkillsError(
        error?.message ||
        "Unable to save skills information."
      );
    } finally {
      setSkillsSaving(false);
    }
  };

  /*
   * =========================================================
   * CERTIFICATIONS HANDLERS
   * =========================================================
   */

  const handleEditCertifications = () => {
    setCertificationsError("");
    setCertificationsSuccess("");
    setEditUser((previousUser) => ({
      ...previousUser,
      certifications: (user.certifications || []).map((item) => ({ ...item })),
    }));
    setIsCertificationsEditing(true);
  };

  const handleCancelCertifications = () => {
    setCertificationsError("");
    setCertificationsSuccess("");
    setEditUser((previousUser) => ({
      ...previousUser,
      certifications: (user.certifications || []).map((item) => ({ ...item })),
    }));
    setIsCertificationsEditing(false);
  };

  const handleAddCertification = () => {
    setCertificationsError("");
    setCertificationsSuccess("");
    setEditUser((previousUser) => ({
      ...previousUser,
      certifications: [
        ...(previousUser.certifications || []),
        {
          certificationId: null,
          name: "",
          issuingOrganization: "",
          issueDate: "",
          expiryDate: "",
          credentialId: "",
          credentialUrl: "",
          isNew: true,
        },
      ],
    }));
    setIsCertificationsEditing(true);
  };

  const handleCertificationChange = (index, field, value) => {
    setEditUser((previousUser) => {
      const items = [...(previousUser.certifications || [])];
      items[index] = { ...items[index], [field]: value };
      return { ...previousUser, certifications: items };
    });
  };

  const handleDeleteCertification = async (item, index) => {
    setCertificationsError("");
    setCertificationsSuccess("");

    if (!item?.certificationId) {
      setEditUser((previousUser) => ({
        ...previousUser,
        certifications: (previousUser.certifications || []).filter(
          (_, itemIndex) => itemIndex !== index
        ),
      }));
      return;
    }

    if (!window.confirm("Are you sure you want to delete this certification?")) {
      return;
    }

    setCertificationsSaving(true);
    try {
      await api.delete(
        `/applicant-profile/certifications/${item.certificationId}`
      );

      const updated = (user.certifications || []).filter(
        (existing) =>
          existing.certificationId !== item.certificationId
      );

      const updatedUser = { ...user, certifications: updated };
      setUser(updatedUser);
      setEditUser(updatedUser);
      setCertificationsSuccess("Certification deleted successfully.");
    } catch (error) {
      console.error("Failed to delete certification:", error);
      setCertificationsError(
        error?.message || "Unable to delete certification."
      );
    } finally {
      setCertificationsSaving(false);
    }
  };

  const handleSaveCertifications = async () => {
    setCertificationsSaving(true);
    setCertificationsError("");
    setCertificationsSuccess("");

    try {
      const updated = [];

      for (const item of editUser?.certifications || []) {
        const payload = {
          name: item.name?.trim() || "",
          issuingOrganization: item.issuingOrganization?.trim() || "",
          issueDate: item.issueDate || null,
          expiryDate: item.expiryDate || null,
          credentialId: item.credentialId?.trim() || null,
          credentialUrl: item.credentialUrl?.trim() || null,
        };

        if (!payload.name) {
          throw new Error(
            "Certification name is required for every certification."
          );
        }

        if (
          payload.issueDate &&
          payload.expiryDate &&
          payload.expiryDate < payload.issueDate
        ) {
          throw new Error(
            "Expiry date cannot be earlier than issue date."
          );
        }

        console.log("Saving certification:", item);
        const saved = item.certificationId
          ? await api.put(
              `/applicant-profile/certifications/${item.certificationId}`,
              payload
            )
          : await api.post(
              "/applicant-profile/certifications",
              payload
            );

        if (Array.isArray(saved)) {
  const savedItem = saved.find(
    (cert) => cert.certificationId === item.certificationId
  );

  updated.push(savedItem || { ...item, ...payload });
} else {
  updated.push(saved);
}

console.log("Saved certification response:", saved);
      }

      const updatedUser = { ...user, certifications: updated };
      setUser(updatedUser);
      setEditUser(updatedUser);
      setIsCertificationsEditing(false);
      setCertificationsSuccess(
        "Certifications information saved successfully."
      );
    } catch (error) {
      console.error("Failed to save certifications:", error);
      const message =
        error?.message || "Unable to save certifications information.";
      setCertificationsError(message);
      window.alert(message);
    } finally {
      setCertificationsSaving(false);
    }
  };

  /*
   * =========================================================
   * ACHIEVEMENTS HANDLERS
   * =========================================================
   */

  
const handleEditAchievements = () => {
  setAchievementsError("");
  setAchievementsSuccess("");

  setEditUser((previousUser) => ({
    ...previousUser,
    achievements: (previousUser?.achievements || []).map(
      (item) => ({ ...item })
    ),
  }));

  setIsAchievementsEditing(true);
};


  const handleCancelAchievements = () => {
  setAchievementsError("");
  setAchievementsSuccess("");

  setEditUser((previousUser) => ({
    ...previousUser,
    achievements: (user.achievements || []).map((item) => ({
      ...item,
    })),
  }));

  setIsAchievementsEditing(false);
};

  const handleAddAchievement = () => {
    setAchievementsError("");
    setAchievementsSuccess("");
    setEditUser((previousUser) => ({
      ...previousUser,
      achievements: [
        ...(previousUser.achievements || []),
        {
          achievementId: null,
          title: "",
          description: "",
          date: "",
          issuer: "",
          isNew: true,
        },
      ],
    }));
    setIsAchievementsEditing(true);
  };

  const handleAchievementChange = (index, field, value) => {
    setEditUser((previousUser) => {
      const items = [...(previousUser.achievements || [])];
      items[index] = { ...items[index], [field]: value };
      return { ...previousUser, achievements: items };
    });
  };

  const handleDeleteAchievement = async (item, index) => {
    setAchievementsError("");
    setAchievementsSuccess("");

    if (!item?.achievementId) {
      setEditUser((previousUser) => ({
        ...previousUser,
        achievements: (previousUser.achievements || []).filter(
          (_, itemIndex) => itemIndex !== index
        ),
      }));
      return;
    }

    if (!window.confirm("Are you sure you want to delete this achievement?")) {
      return;
    }

    setAchievementsSaving(true);
    try {
      await api.delete(
        `/applicant-profile/achievements/${item.achievementId}`
      );

      const updated = (user.achievements || []).filter(
        (existing) =>
          existing.achievementId !== item.achievementId
      );

      const updatedUser = { ...user, achievements: updated };
      setUser(updatedUser);
      setEditUser(updatedUser);
      setAchievementsSuccess("Achievement deleted successfully.");
    } catch (error) {
      console.error("Failed to delete achievement:", error);
      setAchievementsError(
        error?.message || "Unable to delete achievement."
      );
    } finally {
      setAchievementsSaving(false);
    }
  };

   const handleSaveAchievements = async () => {
  setAchievementsSaving(true);
  setAchievementsError("");
  setAchievementsSuccess("");

  try {

console.log(
  "ACHIEVEMENTS BEFORE SAVE:",
  (editUser?.achievements || []).map((item) => ({
    id: item.achievementId,
    title: item.title,
    isNew: item.isNew,
  }))
);

    const updated = [];

    for (const item of editUser?.achievements || []) {
      const payload = {
        title: item.title?.trim() || "",
        description: item.description?.trim() || null,
        date: item.date || null,
        issuer: item.issuer?.trim() || null,
      };

      if (!payload.title) {
        throw new Error(
          "Achievement title is required for every achievement."
        );
      }

      const saved = item.achievementId
        ? await api.put(
            `/applicant-profile/achievements/${item.achievementId}`,
            payload
          )
        : await api.post(
            "/applicant-profile/achievements",
            payload
          );

      // Keep the saved achievement, including its ID.
      // Fall back to the submitted item if the API response
      // does not contain the saved object.
      const savedAchievement =
        saved &&
        typeof saved === "object" &&
        !Array.isArray(saved) &&
        saved.achievementId
          ? saved
          : {
              ...item,
              ...payload,
              achievementId:
                item.achievementId ?? saved?.achievementId ?? null,
            };

      updated.push(savedAchievement);

      console.log(
        "Saved achievement:",
        savedAchievement
      );
    }

    setUser((previousUser) => ({
  ...previousUser,
  achievements: updated,
}));

setEditUser((previousUser) => ({
  ...previousUser,
  achievements: updated,
}));
    setIsAchievementsEditing(false);

    setAchievementsSuccess(
      "Achievements information saved successfully."
    );
  } catch (error) {
    console.error(
      "Failed to save achievements:",
      error
    );

    const message =
      error?.message ||
      "Unable to save achievements information.";

    setAchievementsError(message);
    window.alert(message);
  } finally {
    setAchievementsSaving(false);
  }
};

  /*
   * =========================================================
   * PROJECT HANDLERS
   * =========================================================
   */

  const handleEditProjects = () => {
  setProjectsError("");
  setProjectsSuccess("");

  const projectsToEdit = (user?.projects || []).map((project) => ({
    ...project,

    title:
      project.title ||
      project.name ||
      project.projectTitle ||
      project.projectName ||
      "",

    description:
      project.description ||
      project.projectDescription ||
      "",

    year:
      project.year ||
      project.projectYear ||
      "",

    technologies: Array.isArray(project.technologies)
      ? [...project.technologies]
      : typeof project.technologies === "string"
        ? project.technologies
        : Array.isArray(project.techStack)
          ? [...project.techStack]
          : typeof project.techStack === "string"
            ? project.techStack
            : [],
  }));

  setEditUser((previousUser) => ({
    ...previousUser,
    projects: projectsToEdit,
  }));

  setIsProjectsEditing(true);
};

  const handleCancelProjects = () => {
    setProjectsError("");
    setProjectsSuccess("");

    setEditUser((previousUser) => ({
      ...previousUser,

      projects: (user.projects || []).map(
        (project) => ({
          ...project,

          technologies:
            Array.isArray(
              project.technologies
            )
              ? [...project.technologies]
              : [],
        })
      ),
    }));

    setIsProjectsEditing(false);
  };

  /*
   * ADD NEW PROJECT
   */
  const handleAddProject = () => {
    setProjectsError("");
    setProjectsSuccess("");

    setEditUser((previousUser) => ({
      ...previousUser,

      projects: [
        ...(previousUser.projects || []),

        {
          title: "",
          description: "",
          year: "",
          technologies: [],
          isNew: true,
        },
      ],
    }));
  };

  const handleProjectChange = (
    projectIndex,
    field,
    value
  ) => {
    setEditUser((previousUser) => {
      const updatedProjects = [
        ...(previousUser.projects || []),
      ];

      updatedProjects[projectIndex] = {
        ...updatedProjects[projectIndex],
        [field]: value,
      };

      return {
        ...previousUser,
        projects: updatedProjects,
      };
    });
  };

  const handleProjectTechnologyChange = (
    projectIndex,
    value
  ) => {
    handleProjectChange(
      projectIndex,
      "technologies",
      value
    );
  };

  const handleDeleteProject = (
    projectIndex
  ) => {
    setProjectsError("");
    setProjectsSuccess("");

    const confirmed = window.confirm(
      "Are you sure you want to delete this project? It will be removed from your profile when you click Save."
    );

    if (!confirmed) {
      return;
    }

    setEditUser((previousUser) => ({
      ...previousUser,
      projects: (previousUser.projects || []).filter(
        (_, index) => index !== projectIndex
      ),
    }));

    setProjectsSuccess(
      "Project removed. Click Save to permanently delete it from your profile."
    );
  };

  const handleSaveProjects = async () => {
  setProjectsSaving(true);
  setProjectsError("");
  setProjectsSuccess("");

  try {
    const currentProjects = editUser?.projects || [];

    // Validate titles before making API requests.
    const projectsToSave = currentProjects.map((project) => {
      const title = (
        project.title ||
        project.name ||
        project.projectTitle ||
        project.projectName ||
        ""
      ).trim();

      if (!title) {
        throw new Error(
          "A project title is missing. Please enter a title for every project."
        );
      }

      const technologies =
        typeof project.technologies === "string"
          ? project.technologies
              .split(",")
              .map((technology) => technology.trim())
              .filter(Boolean)
          : Array.isArray(project.technologies)
            ? project.technologies
            : [];

      return {
        ...project,
        title,
        description:
          project.description ||
          project.projectDescription ||
          "",
        year: project.year ? Number(project.year) : null,
        technologies,
      };
    });

    // Save projects and retain their IDs.
    console.log(
  "PROJECTS BEFORE MAIN SAVE:",
  (editUser?.projects || []).map((project) => ({
    projectId: project.projectId,
    title: project.title,
    name: project.name,
  }))
);
// Save projects and retain their IDs.
    console.log(
  "PROJECTS BEFORE MAIN SAVE:",
  (editUser?.projects || []).map((project) => ({
    projectId: project.projectId,
    title: project.title,
    name: project.name,
  }))
);
    const updatedProjects = [];

    for (let index = 0; index < projectsToSave.length; index += 1) {
      const project = projectsToSave[index];
      const originalProject = currentProjects[index];

      // Do not send frontend-only properties to the backend.
      const projectPayload = {
        title: project.title,
        description: project.description,
        year: project.year,
        technologies: project.technologies,
      };

      let response;

      if (originalProject?.projectId) {
        response = await api.put(
          `/applicant-profile/projects/${originalProject.projectId}`,
          projectPayload
        );
      } else {
        response = await api.post(
          "/applicant-profile/projects",
          projectPayload
        );
      }

      // The backend PUT endpoint returns the entire projects array.
const responseData = response?.data ?? response;

const savedProject = Array.isArray(responseData)
  ? responseData.find(
      (item) => item.projectId === originalProject?.projectId
    ) || project
  : responseData?.project ??
    responseData?.data ??
    responseData;

const savedProjectId =
  savedProject?.projectId ??
  originalProject?.projectId ??
  null;

      updatedProjects.push({
        ...project,
        ...(savedProject || {}),
        title:
          savedProject?.title ||
          savedProject?.name ||
          project.title,
        description:
          savedProject?.description ??
          project.description,
        year:
          savedProject?.year ??
          project.year,
        technologies:
          savedProject?.technologies ??
          project.technologies,
        projectId: savedProjectId,
      });
    }

    // Delete removed projects.
    const originalProjectIds = new Set(
      (user?.projects || [])
        .map((project) => project.projectId)
        .filter(Boolean)
    );

    const currentProjectIds = new Set(
      updatedProjects
        .map((project) => project.projectId)
        .filter(Boolean)
    );

    for (const projectId of originalProjectIds) {
      if (!currentProjectIds.has(projectId)) {
        await api.delete(
          `/applicant-profile/projects/${projectId}`
        );
      }
    }

    const updatedUser = {
      ...user,
      projects: updatedProjects,
    };

    setUser(updatedUser);

    setEditUser((previousUser) => ({
      ...previousUser,
      ...updatedUser,
    }));

    setIsProjectsEditing(false);

    setProjectsSuccess(
      "Projects information saved successfully."
    );
  } catch (error) {
    console.error(
      "Failed to save projects information:",
      error
    );

    setProjectsError(
      error?.response?.data?.message ||
        error?.message ||
        "Unable to save projects information."
    );
  } finally {
    setProjectsSaving(false);
  }
};

  /*
   * =========================================================
   * VALIDATE EXPERIENCE DATES
   * =========================================================
   */

  const validateExperienceDates = async () => {
    const experiences = editUser?.experience || [];

    for (const experienceItem of experiences) {
      const startDate = experienceItem.startDate || null;
      const endDate = experienceItem.endDate || null;

      if (startDate && endDate && endDate < startDate) {
        throw new Error(
          "End date cannot be earlier than start date."
        );
      }
    }

    return true;
  };

  /*
   * =========================================================
   * SAVE COMPLETE PROFILE
   * =========================================================
   */

  const handleSaveProfile = async () => {
    console.log(
      "SAVE BUTTON CLICKED"
    );

    if (!user?.resumeId) {
      const message =
        "Resume information is not available.";

      setSaveError(message);
      window.alert(message);

      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      /*
       * 1. VALIDATE EXPERIENCE DATES
       */
      await validateExperienceDates();

      /*
       * 2. GET RESUME PROFILE
       */
      const resumeProfile =
        await api.get(
          `/resume-profiles/resume/${user.resumeId}`
        );

      if (!resumeProfile?.profileId) {
        throw new Error(
          "Resume profile information is not available."
        );
      }

      /*
       * 3. UPDATE CONTACT
       */
      const updatedProfile =
        await api.put(
          `/resume-profiles/${resumeProfile.profileId}`,
          {
            phone:
              editUser?.phone?.trim() ||
              null,

            linkedin:
              editUser?.linkedin?.trim() ||
              null,

            github:
              editUser?.github?.trim() ||
              null,

            portfolio:
              editUser?.portfolio?.trim() ||
              null,
          }
        );

      /*
       * 4. UPDATE EDUCATION
       */
     const updatedEducation = [];

for (const educationItem of editUser.education || []) {
  const educationPayload = {
    degree: educationItem.degree?.trim() || "",
    institution: educationItem.institution?.trim() || "",
    fieldOfStudy: educationItem.fieldOfStudy?.trim() || "",
    startYear: educationItem.startYear
      ? Number(educationItem.startYear)
      : null,
    endYear: educationItem.endYear
      ? Number(educationItem.endYear)
      : null,
    grade: educationItem.grade?.trim() || null,
  };

  // Skip completely empty new entries.
  if (
    !educationItem.educationId &&
    !educationPayload.degree &&
    !educationPayload.institution &&
    !educationPayload.fieldOfStudy &&
    !educationPayload.startYear &&
    !educationPayload.endYear &&
    !educationPayload.grade
  ) {
    continue;
  }

  let savedEducation;

if (educationItem.educationId) {
  savedEducation = await api.put(
    `/educations/${educationItem.educationId}`,
    educationPayload
  );
} else {
  savedEducation = await api.post(
    "/educations",
    {
      ...educationPayload,
      resumeId: user.resumeId,
    }
  );
}

updatedEducation.push(savedEducation);
}
      /*
       * 5. UPDATE / CREATE EXPERIENCE
       */

      console.log(
  "EXPERIENCE STATE IN MAIN SAVE:",
  JSON.stringify(editUser?.experience, null, 2)
);


      const updatedExperience = [];

for (const experienceItem of editUser?.experience || []) {
  const experiencePayload = {
    company: experienceItem.company?.trim() || "",
    jobTitle: experienceItem.jobTitle?.trim() || "",
    startDate: experienceItem.startDate || null,
    endDate: experienceItem.endDate || null,
    description: experienceItem.description?.trim() || null,
  };

  // Ignore completely empty new entries.
  if (
    !experienceItem.experienceId &&
    !experiencePayload.company &&
    !experiencePayload.jobTitle &&
    !experiencePayload.startDate &&
    !experiencePayload.endDate &&
    !experiencePayload.description
  ) {
    continue;
  }

  if (!experiencePayload.company || !experiencePayload.jobTitle) {
    throw new Error(
      "Company name and job title are required for every experience."
    );
  }

  if (!experienceItem.experienceId && !experiencePayload.startDate) {
    throw new Error(
      `Add a valid start date for ${experiencePayload.company} before saving.`
    );
  }

 let savedExperience;

if (experienceItem.experienceId) {
  savedExperience = await api.put(
    `/experiences/${experienceItem.experienceId}`,
    experiencePayload
  );
} else {
  savedExperience = await api.post(
    "/experiences",
    {
      ...experiencePayload,
      resumeId: user.resumeId,
    }
  );
}

updatedExperience.push(savedExperience);
}

const originalExperienceIds = new Set(
  (user?.experience || [])
    .map((item) => item.experienceId)
    .filter(Boolean)
);

const currentExperienceIds = new Set(
  updatedExperience
    .map((item) => item?.experienceId)
    .filter(Boolean)
);

for (const experienceId of originalExperienceIds) {
  if (!currentExperienceIds.has(experienceId)) {
    await api.delete(
      `/experiences/${experienceId}`
    );
  }
}
     
      /*
 * 6. UPDATE PROJECTS
 */


const updatedProjects = [];
const projectsToSave = editUser?.projects || [];

for (const project of projectsToSave) {
  const title =
    project.title?.trim() ||
    project.name?.trim() ||
    "";

  // Skip completely empty new project entries.
  if (
    !project.projectId &&
    !title &&
    !project.description?.trim()
  ) {
    continue;
  }

  if (!title) {
    throw new Error(
      "Project title is required for every project."
    );
  }

  const projectPayload = {
    title,
    description: project.description?.trim() || "",
    year: project.year ? Number(project.year) : null,
    technologies:
      typeof project.technologies === "string"
        ? project.technologies
            .split(",")
            .map((technology) => technology.trim())
            .filter(Boolean)
        : Array.isArray(project.technologies)
          ? project.technologies
          : [],
  };

  let response;

  if (project.projectId) {
    response = await api.put(
      `/applicant-profile/projects/${project.projectId}`,
      projectPayload
    );
  } else {
    response = await api.post(
      "/applicant-profile/projects",
      projectPayload
    );
  }

  // These endpoints return the complete projects array.
  if (Array.isArray(response)) {
    updatedProjects.splice(0, updatedProjects.length, ...response);
  } else {
    throw new Error(
      "The server returned an unexpected response while saving projects."
    );
  }
}
/*
 * SAVE CERTIFICATIONS
 */
const updatedCertifications = [];

for (const item of editUser?.certifications || []) {
  const payload = {
    name: item.name?.trim() || "",
    issuingOrganization: item.issuingOrganization?.trim() || "",
    issueDate: item.issueDate || null,
    expiryDate: item.expiryDate || null,
    credentialId: item.credentialId?.trim() || null,
    credentialUrl: item.credentialUrl?.trim() || null,
  };

  // Skip completely empty new entries.
  if (
    !item.certificationId &&
    !payload.name &&
    !payload.issuingOrganization &&
    !payload.issueDate &&
    !payload.expiryDate &&
    !payload.credentialId &&
    !payload.credentialUrl
  ) {
    continue;
  }

  if (!payload.name) {
    throw new Error(
      "Certification name is required for every certification."
    );
  }

  if (
    payload.issueDate &&
    payload.expiryDate &&
    payload.expiryDate < payload.issueDate
  ) {
    throw new Error(
      "Expiry date cannot be earlier than issue date."
    );
  }

  const response = item.certificationId
    ? await api.put(
        `/applicant-profile/certifications/${item.certificationId}`,
        payload
      )
    : await api.post(
        "/applicant-profile/certifications",
        payload
      );

  if (!Array.isArray(response)) {
    throw new Error(
      "Unexpected response while saving certifications."
    );
  }

  updatedCertifications.splice(
    0,
    updatedCertifications.length,
    ...response
  );
}

/*
 * SAVE ACHIEVEMENTS
 */
const updatedAchievements = [];

for (const item of editUser?.achievements || []) {
  const payload = {
    title: item.title?.trim() || "",
    description: item.description?.trim() || null,
    date: item.date || null,
    issuer: item.issuer?.trim() || null,
  };

  // Skip completely empty new entries.
  if (
    !item.achievementId &&
    !payload.title &&
    !payload.description &&
    !payload.date &&
    !payload.issuer
  ) {
    continue;
  }

  if (!payload.title) {
    throw new Error(
      "Achievement title is required for every achievement."
    );
  }

  const response = item.achievementId
    ? await api.put(
        `/applicant-profile/achievements/${item.achievementId}`,
        payload
      )
    : await api.post(
        "/applicant-profile/achievements",
        payload
      );

  // Keep the ID returned by the backend.
  const savedAchievement =
    response &&
    typeof response === "object" &&
    !Array.isArray(response)
      ? response
      : {
          ...item,
          ...payload,
          achievementId: item.achievementId ?? null,
        };

  updatedAchievements.push(savedAchievement);
}

      /*
       * 7. UPDATE SKILLS
       */
      const skillsToSave = (
        editUser?.skills || []
      )
        .map((skill) =>
          typeof skill === "string"
            ? skill.trim()
            : ""
        )
        .filter(Boolean)
        .filter(
          (skill, index, array) =>
            array.findIndex(
              (existingSkill) =>
                existingSkill.toLowerCase() ===
                skill.toLowerCase()
            ) === index
        );

      const updatedSkills =
        await api.put(
          `/resume-skills/resume/${user.resumeId}`,
          skillsToSave
        );

      /*
       * 8. UPDATE FRONTEND STATE
       */
      const updatedUser = {
        ...user,

        phone:
          updatedProfile.phone,

        linkedin:
          updatedProfile.linkedin,

        github:
          updatedProfile.github,

        portfolio:
          updatedProfile.portfolio,

        education: updatedEducation,

        experience:
          updatedExperience,

        projects:
          Array.isArray(updatedProjects)
            ? updatedProjects
            : projectsToSave,

        skills:
          Array.isArray(updatedSkills)
            ? updatedSkills
            : skillsToSave,

        certifications: updatedCertifications,
achievements: updatedAchievements,
      };

      setUser((previousUser) => ({
  ...previousUser,
  ...updatedUser,
}));

setEditUser((previousUser) => ({
  ...previousUser,
  ...updatedUser,
}));

      /*
       * 9. EXIT EDIT MODE
       */
      setIsEditing(false);

setIsContactEditing(false);
setIsEducationEditing(false);
setIsExperienceEditing(false);
setIsSkillsEditing(false);
setIsProjectsEditing(false);
setIsCertificationsEditing(false);
setIsAchievementsEditing(false);

setSaveError("");

      console.log(
        "Profile saved successfully."
      );
    } catch (error) {
      console.error(
        "Failed to save profile:",
        error
      );

      const errorMessage =
        error?.message ||
        "Unable to save profile changes.";

      setSaveError(errorMessage);

      window.alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <div className="applicant-profile-page">
        <div className="applicant-profile-error">

          <h2>
            Loading Profile...
          </h2>

          <p>
            Loading your applicant profile information.
          </p>

        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * PROFILE NOT FOUND
   * =========================================================
   */

  if (!user) {
    return (
      <div className="applicant-profile-page">

        <div className="applicant-profile-error">

          <div className="applicant-profile-error-icon">
            !
          </div>

          <h2>
            Profile Not Found
          </h2>

          <p>
            Your applicant information could not be found.
            Please login again.
          </p>

          <button
            type="button"
            className="applicant-profile-primary-btn"
            onClick={() =>
              navigate("/login")
            }
          >
            Go to Login
          </button>

        </div>

      </div>
    );
  }

  /*
   * =========================================================
   * SAFE DEFAULT ARRAYS
   * =========================================================
   */

  const education =
    Array.isArray(user.education)
      ? user.education
      : [];

  const experience =
    Array.isArray(user.experience)
      ? user.experience
      : [];

  const skills =
    Array.isArray(user.skills)
      ? user.skills
      : [];

  const projects =
    Array.isArray(user.projects)
      ? user.projects
      : [];

  const certifications =
    Array.isArray(
      user.certifications
    )
      ? user.certifications
      : [];

  const achievements =
    Array.isArray(
      user.achievements
    )
      ? user.achievements
      : [];

  const displayedEducation =
    isEducationEditing
      ? Array.isArray(
          editUser?.education
        )
        ? editUser.education
        : []
      : education;

  const displayedExperience =
    isExperienceEditing
      ? Array.isArray(
          editUser?.experience
        )
        ? editUser.experience
        : []
      : experience;

  const displayedProjects =
    isProjectsEditing
      ? Array.isArray(
          editUser?.projects
        )
        ? editUser.projects
        : []
      : projects;

  const displayedCertifications =
    isCertificationsEditing
      ? Array.isArray(editUser?.certifications)
        ? editUser.certifications
        : []
      : certifications;

  const displayedAchievements =
    isAchievementsEditing
      ? Array.isArray(editUser?.achievements)
        ? editUser.achievements
        : []
      : achievements;

  const initial =
    user.name
      ? user.name
          .charAt(0)
          .toUpperCase()
      : "A";

  return (
    <div className="applicant-profile-page">


      <div className="applicant-profile-header">

        <div>

          <span className="applicant-profile-eyebrow">
            PROFILE
          </span>

          <h1>
            Profile
          </h1>

          <p>
            View your account information and resume
            profile.
          </p>

        </div>
      </div>
      {/* =========================
          PROFILE HERO
      ========================== */}

      <div className="applicant-profile-hero">

        <div className="applicant-profile-hero-content">

          <div className="applicant-profile-avatar">
            {initial}
          </div>

          <div className="applicant-profile-identity">

            <span className="applicant-profile-role">
              {user.role || "APPLICANT"}
            </span>

            <h2>
              {user.name || "Applicant"}
            </h2>

            <p>
              {user.email ||
                "Email not available"}
            </p>

          </div> 
        </div>

        <div className="applicant-profile-hero-actions">

          {!isEditing ? (

            <button
              type="button"
              className="applicant-profile-primary-btn"
              onClick={
                handleEditProfile
              }
            >
              ✏️ Edit Profile
            </button>

          ) : (

            <>

              <button
                type="button"
                className="applicant-profile-secondary-btn"
                onClick={
                  handleCancelEdit
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="applicant-profile-primary-btn"
                onClick={
                  handleSaveProfile
                }
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </>

          )}

        </div>

      </div>

      {/* =====================================================
          SAVE ERROR
      ====================================================== */}

      {saveError && (
        <div
          className="applicant-profile-error"
          style={{
            marginBottom: "20px",
          }}
        >
          <p>
            {saveError}
          </p>
        </div>
      )}

      {/* =========================
          MAIN CONTENT
      ========================== */}

      <div className="applicant-profile-content">

        {/* =====================================================
            ACCOUNT INFORMATION
        ====================================================== */}

        <section className="applicant-profile-card">

          <div className="applicant-profile-card-header">

            <div className="applicant-profile-section-icon">
              👤
            </div>

            <div>

              <h3>
                Account Information
              </h3>

              <p>
                Your registered account details
              </p>

            </div>

          </div>

          <div className="applicant-profile-grid">

            <div className="applicant-profile-field">

              <span>
                Full Name
              </span>

              <strong>
                {user.name ||
                  "Not available"}
              </strong>

            </div>

            <div className="applicant-profile-field">

              <span>
                Email Address
              </span>

              <strong>
                {user.email ||
                  "Not available"}
              </strong>

            </div>

            <div className="applicant-profile-field">

              <span>
                Account Role
              </span>

              <strong>
                {user.role ||
                  "APPLICANT"}
              </strong>

            </div>

          </div>

        </section>

        {/* =====================================================
            CONTACT INFORMATION
        ====================================================== */}

        <section className="applicant-profile-card">

          <div
            className="applicant-profile-card-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >

              <div className="applicant-profile-section-icon">
                📞
              </div>

              <div>

                <h3>
                  Contact Information
                </h3>

                <p>
                  Contact details extracted from your resume
                </p>

              </div>

            </div>

            {!isContactEditing ? (

              <button
                type="button"
                className="applicant-profile-primary-btn"
                onClick={
                  handleEditContact
                }
              >
                ✏️ Edit
              </button>

            ) : (

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >

                <button
                  type="button"
                  className="applicant-profile-secondary-btn"
                  onClick={
                    handleCancelContact
                  }
                  disabled={contactSaving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="applicant-profile-primary-btn"
                  onClick={
                    handleSaveContact
                  }
                  disabled={contactSaving}
                >
                  {contactSaving
                    ? "Saving..."
                    : "Save"}
                </button>

              </div>

            )}

          </div>

          {contactError && (
            <div
              className="applicant-profile-error"
              style={{
                marginTop: "15px",
                marginBottom: "15px",
              }}
            >
              <p>
                {contactError}
              </p>
            </div>
          )}

          {contactSuccess && (
            <div
              style={{
                marginTop: "15px",
                marginBottom: "15px",
              }}
            >
              <p>
                {contactSuccess}
              </p>
            </div>
          )}

          <div className="applicant-profile-grid">

            <div className="applicant-profile-field">

              <span>
                Phone
              </span>

              {isContactEditing ? (

                <input
                  type="tel"
                  value={
                    editUser?.phone ||
                    ""
                  }
                  onChange={(event) =>
                    handleContactChange(
                      "phone",
                      event.target.value
                    )
                  }
                  placeholder="Enter phone number"
                  className="applicant-profile-input"
                />

              ) : (

                <strong>
                  {user.phone ||
                    "Not available"}
                </strong>

              )}

            </div>

            <div className="applicant-profile-field">

              <span>
                LinkedIn
              </span>

              {isContactEditing ? (

                <input
                  type="url"
                  value={
                    editUser?.linkedin ||
                    ""
                  }
                  onChange={(event) =>
                    handleContactChange(
                      "linkedin",
                      event.target.value
                    )
                  }
                  placeholder="https://linkedin.com/in/your-profile"
                  className="applicant-profile-input"
                />

              ) : (

                <strong>
                  {user.linkedin ||
                    "Not available"}
                </strong>

              )}

            </div>

            <div className="applicant-profile-field">

              <span>
                GitHub
              </span>

              {isContactEditing ? (

                <input
                  type="url"
                  value={
                    editUser?.github ||
                    ""
                  }
                  onChange={(event) =>
                    handleContactChange(
                      "github",
                      event.target.value
                    )
                  }
                  placeholder="https://github.com/your-profile"
                  className="applicant-profile-input"
                />

              ) : (

                <strong>
                  {user.github ||
                    "Not available"}
                </strong>

              )}

            </div>

            <div className="applicant-profile-field">

              <span>
                Portfolio
              </span>

              {isContactEditing ? (

                <input
                  type="url"
                  value={
                    editUser?.portfolio ||
                    ""
                  }
                  onChange={(event) =>
                    handleContactChange(
                      "portfolio",
                      event.target.value
                    )
                  }
                  placeholder="https://your-portfolio.com"
                  className="applicant-profile-input"
                />

              ) : (

                <strong>
                  {user.portfolio ||
                    "Not available"}
                </strong>

              )}

            </div>

          </div>

        </section>

        {/* =====================================================
            EDUCATION
        ====================================================== */}

        <section className="applicant-profile-card">

          <div
            className="applicant-profile-card-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >

              <div className="applicant-profile-section-icon">
                🎓
              </div>

              <div>

                <h3>
                  Education
                </h3>

                <p>
                  Your educational background
                </p>

              </div>

            </div>

            {!isEducationEditing ? (

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  className="applicant-profile-secondary-btn"
                  onClick={
                    handleAddEducation
                  }
                >
                  + Add
                </button>

                <button
                  type="button"
                  className="applicant-profile-primary-btn"
                  onClick={
                    handleEditEducation
                  }
                >
                  ✏️ Edit
                </button>
              </div>

            ) : (

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >

                <button
                  type="button"
                  className="applicant-profile-secondary-btn"
                  onClick={
                    handleAddEducation
                  }
                  disabled={educationSaving}
                >
                  + Add
                </button>

                <button
                  type="button"
                  className="applicant-profile-secondary-btn"
                  onClick={
                    handleCancelEducation
                  }
                  disabled={educationSaving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="applicant-profile-primary-btn"
                  onClick={
                    handleSaveEducation
                  }
                  disabled={educationSaving}
                >
                  {educationSaving
                    ? "Saving..."
                    : "Save"}
                </button>

              </div>

            )}

          </div>

          {educationError && (
            <div
              className="applicant-profile-error"
              style={{
                marginTop: "15px",
                marginBottom: "15px",
              }}
            >
              <p>
                {educationError}
              </p>
            </div>
          )}

          {educationSuccess && (
            <div
              style={{
                marginTop: "15px",
                marginBottom: "15px",
              }}
            >
              <p>
                {educationSuccess}
              </p>
            </div>
          )}

          {displayedEducation.length > 0 ? (

            <div className="applicant-profile-list">

              {displayedEducation.map(
                (item, index) => {

                  const editEducation =
                    isEducationEditing
                      ? item
                      : editUser?.education?.[
                          index
                        ] || item;
console.log(
  "CURRENT EDIT EXPERIENCE:",
  JSON.stringify(editUser?.experience, null, 2)
);
                  return (
                    <div
                      className="applicant-profile-list-item"
                      key={
                        item.educationId ||
                        `education-${index}`
                      }
                    >

                      {isEducationEditing ? (

                        <>

                          <div className="applicant-profile-field">

                            <span>
                              Degree
                            </span>

                            <input
                              type="text"
                              value={
                                editEducation.degree ||
                                ""
                              }
                              onChange={(event) =>
                                handleEducationChange(
                                  index,
                                  "degree",
                                  event.target.value
                                )
                              }
                              placeholder="Enter degree"
                              className="applicant-profile-input"
                            />

                          </div>

                          <div className="applicant-profile-field">

                            <span>
                              Institution
                            </span>

                            <input
                              type="text"
                              value={
                                editEducation.institution ||
                                ""
                              }
                              onChange={(event) =>
                                handleEducationChange(
                                  index,
                                  "institution",
                                  event.target.value
                                )
                              }
                              placeholder="Enter institution"
                              className="applicant-profile-input"
                            />

                          </div>

                          <div className="applicant-profile-field">

                            <span>
                              Field of Study
                            </span>

                            <input
                              type="text"
                              value={
                                editEducation.fieldOfStudy ||
                                ""
                              }
                              onChange={(event) =>
                                handleEducationChange(
                                  index,
                                  "fieldOfStudy",
                                  event.target.value
                                )
                              }
                              placeholder="Enter field of study"
                              className="applicant-profile-input"
                            />

                          </div>

                          <div className="applicant-profile-grid">

                            <div className="applicant-profile-field">

                              <span>
                                Start Year
                              </span>

                              <input
                                type="number"
                                value={
                                  editEducation.startYear ||
                                  ""
                                }
                                onChange={(event) =>
                                  handleEducationChange(
                                    index,
                                    "startYear",
                                    event.target.value
                                  )
                                }
                                placeholder="Start year"
                                className="applicant-profile-input"
                              />

                            </div>

                            <div className="applicant-profile-field">

                              <span>
                                End Year
                              </span>

                              <input
                                type="number"
                                value={
                                  editEducation.endYear ||
                                  ""
                                }
                                onChange={(event) =>
                                  handleEducationChange(
                                    index,
                                    "endYear",
                                    event.target.value
                                  )
                                }
                                placeholder="End year"
                                className="applicant-profile-input"
                              />

                            </div>

                          </div>

                          <div className="applicant-profile-field">

                            <span>
                              Grade
                            </span>

                            <input
                              type="text"
                              value={
                                editEducation.grade ||
                                ""
                              }
                              onChange={(event) =>
                                handleEducationChange(
                                  index,
                                  "grade",
                                  event.target.value
                                )
                              }
                              placeholder="Enter grade / CGPA"
                              className="applicant-profile-input"
                            />

                          </div>

                        </>

                      ) : (

                        <>

                          <h4>
                            {item.degree ||
                              "Degree not available"}
                          </h4>

                          <p>
                            {item.institution ||
                              "Institution not available"}
                          </p>

                          {item.fieldOfStudy && (
                            <p>
                              {item.fieldOfStudy}
                            </p>
                          )}

                          <span>
                            {item.startYear ||
                              "N/A"}
                            {" - "}
                            {item.endYear ||
                              "Present"}
                          </span>

                          {item.grade && (
                            <strong>
                              {item.grade}
                            </strong>
                          )}

                        </>

                      )}

                    </div>
                  );
                }
              )}

            </div>

          ) : (

            <p className="applicant-profile-empty">
              No education information available.
            </p>

          )}

        </section>

        {/* =====================================================
                EXPERIENCE
            ====================================================== */}

            <section className="applicant-profile-card">

              <div
                className="applicant-profile-card-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >

                  <div className="applicant-profile-section-icon">
                    💼
                  </div>

                  <div>
                    <h3>Experience</h3>

                    <p>
                      Your professional experience
                    </p>
                  </div>

                </div>

                {!isExperienceEditing ? (

                  <button
                    type="button"
                    className="applicant-profile-primary-btn"
                    onClick={handleEditExperience}
                  >
                    ✏️ Edit
                  </button>

                ) : (

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >

                    <button
                      type="button"
                      className="applicant-profile-secondary-btn"
                      onClick={handleCancelExperience}
                      disabled={experienceSaving}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="applicant-profile-primary-btn"
                      onClick={handleAddExperience}
                      disabled={experienceSaving}
                    >
                      + Add Experience
                    </button>

                    <button
                      type="button"
                      className="applicant-profile-primary-btn"
                      onClick={handleSaveExperience}
                      disabled={experienceSaving}
                    >
                      {experienceSaving
                        ? "Saving..."
                        : "Save"}
                    </button>

                  </div>

                )}

              </div>

              {experienceError && (
                <div
                  className="applicant-profile-error"
                  style={{
                    marginTop: "15px",
                    marginBottom: "15px",
                  }}
                >
                  <p>
                    {experienceError}
                  </p>
                </div>
              )}

              {experienceSuccess && (
                <div
                  style={{
                    marginTop: "15px",
                    marginBottom: "15px",
                  }}
                >
                  <p>
                    {experienceSuccess}
                  </p>
                </div>
              )}

              {/* ===================================================
                  EDIT MODE
              ==================================================== */}

              {isExperienceEditing ? (

                editUser?.experience &&
                editUser.experience.length > 0 ? (

                  <div className="applicant-profile-list">

                    {editUser.experience.map(
                      (item, index) => (

                        <div
                          className="applicant-profile-list-item"
                          key={
                            item.experienceId ||
                            `new-experience-${index}`
                          }
                        >

                          {/* =========================================
                              DELETE BUTTON
                          ========================================== */}

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              marginBottom: "15px",
                            }}
                          >

                            <button
                              type="button"
                              className="applicant-profile-secondary-btn"
                              onClick={() =>
                                handleDeleteExperience(
                                  item,
                                  index
                                )
                              }
                              disabled={experienceSaving}
                              style={{
                                color: "#b42318",
                                borderColor: "#f1b5b0",
                              }}
                            >
                              🗑️ Delete
                            </button>

                          </div>

                          {/* =========================================
                              JOB TITLE
                          ========================================== */}

                          <div className="applicant-profile-field">

                            <span>
                              Job Title
                            </span>

                            <input
                              type="text"
                              value={
                                item.jobTitle || ""
                              }
                              onChange={(event) =>
                                handleExperienceChange(
                                  index,
                                  "jobTitle",
                                  event.target.value
                                )
                              }
                              placeholder="Enter job title"
                              className="applicant-profile-input"
                            />

                          </div>

                          {/* =========================================
                              COMPANY
                          ========================================== */}

                          <div className="applicant-profile-field">

                            <span>
                              Company
                            </span>

                            <input
                              type="text"
                               
                              value={
                                item.company || ""
                              }
                              onChange={(event) =>
                                handleExperienceChange(
                                  index,
                                  "company",
                                  event.target.value
                                )
                              }
                              placeholder="Enter company name"
                              className="applicant-profile-input"
                            />

                          </div>

                          {/* =========================================
                              DATES
                          ========================================== */}

                          <div className="applicant-profile-grid">

                            <div className="applicant-profile-field">

                              <span>
                                Start Date
                              </span>

                              <input
                                type="date"
                                value={
                                  item.startDate || ""
                                }
                                onChange={(event) =>
                                  handleExperienceChange(
                                    index,
                                    "startDate",
                                    event.target.value
                                  )
                                }
                                className="applicant-profile-input"
                              />

                            </div>

                            <div className="applicant-profile-field">

                              <span>
                                End Date
                              </span>

                              <input
                                type="date"
                                value={
                                  item.endDate || ""
                                }
                                onChange={(event) =>
                                  handleExperienceChange(
                                    index,
                                    "endDate",
                                    event.target.value
                                  )
                                }
                                className="applicant-profile-input"
                              />

                            </div>

                          </div>

                          {/* =========================================
                              DESCRIPTION
                          ========================================== */}

                          <div className="applicant-profile-field">

                            <span>
                              Description
                            </span>

                            <textarea
                              value={
                                item.description || ""
                              }
                              onChange={(event) =>
                                handleExperienceChange(
                                  index,
                                  "description",
                                  event.target.value
                                )
                              }
                              placeholder="Describe your responsibilities and work"
                              className="applicant-profile-input"
                              rows="4"
                            />

                          </div>

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <p className="applicant-profile-empty">
                    No experience information available.
                    Click "+ Add Experience" to add your first experience.
                  </p>

                )

              ) : (

                /* =================================================
                  VIEW MODE
                ================================================== */

                experience.length > 0 ? (

                  <div className="applicant-profile-list">

                    {experience.map(
                      (item, index) => (

                        <div
                          className="applicant-profile-list-item"
                          key={
                            item.experienceId ||
                            index
                          }
                        >

                          <h4>
                            {item.jobTitle ||
                              "Job title not available"}
                          </h4>

                          <p>
                            {item.company ||
                              "Company not available"}
                          </p>

                          <span>
                            {item.startDate ||
                              "N/A"}

                            {" - "}

                            {item.endDate ||
                              "Present"}
                          </span>

                          {item.description && (
                            <p>
                              {item.description}
                            </p>
                          )}

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <p className="applicant-profile-empty">
                    No experience information available.
                  </p>

                )

              )}

            </section>

        {/* =====================================================
            SKILLS
        ====================================================== */}

        <section className="applicant-profile-card">

          <div
            className="applicant-profile-card-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >

              <div className="applicant-profile-section-icon">
                🛠️
              </div>

              <div>

                <h3>
                  Skills
                </h3>

                <p>
                  Skills identified from your resume
                </p>

              </div>

            </div>

            {!isSkillsEditing ? (

              <button
                type="button"
                className="applicant-profile-primary-btn"
                onClick={
                  handleEditSkills
                }
              >
                ✏️ Edit
              </button>

            ) : (

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >

                <button
                  type="button"
                  className="applicant-profile-secondary-btn"
                  onClick={
                    handleCancelSkills
                  }
                  disabled={skillsSaving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="applicant-profile-primary-btn"
                  onClick={
                    handleSaveSkills
                  }
                  disabled={skillsSaving}
                >
                  {skillsSaving
                    ? "Saving..."
                    : "Save"}
                </button>

              </div>

            )}

          </div>

          {skillsError && (
            <div
              className="applicant-profile-error"
              style={{
                marginTop: "15px",
                marginBottom: "15px",
              }}
            >
              <p>
                {skillsError}
              </p>
            </div>
          )}

          {skillsSuccess && (
            <div
              style={{
                marginTop: "15px",
                marginBottom: "15px",
              }}
            >
              <p>
                {skillsSuccess}
              </p>
            </div>
          )}

          {isSkillsEditing ? (

            <>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  marginTop: "20px",
                  marginBottom: "20px",
                }}
              >

                <input
                  type="text"
                  value={newSkill}
                  onChange={(event) =>
                    setNewSkill(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {

                    if (
                      event.key ===
                      "Enter"
                    ) {
                      event.preventDefault();
                      handleAddSkill();
                    }

                  }}
                  placeholder="Enter a skill"
                  className="applicant-profile-input"
                  style={{
                    flex: 1,
                  }}
                />

                <button
                  type="button"
                  className="applicant-profile-primary-btn"
                  onClick={
                    handleAddSkill
                  }
                  disabled={
                    !newSkill.trim()
                  }
                >
                  + Add Skill
                </button>

              </div>

              <div className="applicant-profile-field">

                <span>
                  Added Skills
                </span>

                {Array.isArray(
                  editUser?.skills
                ) &&
                editUser.skills.length >
                  0 ? (

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginTop: "10px",
                    }}
                  >

                    {editUser.skills.map(
                      (
                        skill,
                        index
                      ) => (

                        <div
                          key={index}
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            gap: "8px",
                            padding:
                              "8px 10px 8px 14px",
                            borderRadius:
                              "20px",
                            border:
                              "1px solid #d9e2ec",
                            backgroundColor:
                              "#f5f8fc",
                            color:
                              "#243b53",
                            fontSize:
                              "14px",
                            fontWeight:
                              "600",
                          }}
                        >

                          <span>
                            {skill}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveSkill(
                                index
                              )
                            }
                            disabled={
                              skillsSaving
                            }
                            title="Remove skill"
                            style={{
                              border:
                                "none",
                              background:
                                "transparent",
                              cursor:
                                "pointer",
                              fontSize:
                                "16px",
                              fontWeight:
                                "700",
                              padding:
                                "0",
                              lineHeight:
                                "1",
                            }}
                          >
                            ×
                          </button>

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <p
                    className="applicant-profile-empty"
                    style={{
                      marginTop: "10px",
                    }}
                  >
                    No skills added yet.
                    Enter a skill above.
                  </p>

                )}

              </div>

            </>

          ) : (

            skills.length > 0 ? (

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >

                {skills.map(
                  (
                    skill,
                    index
                  ) => (

                    <span
                      key={index}
                      style={{
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        padding:
                          "8px 14px",
                        borderRadius:
                          "20px",
                        border:
                          "1px solid #d9e2ec",
                        backgroundColor:
                          "#f5f8fc",
                        color:
                          "#243b53",
                        fontSize:
                          "14px",
                        fontWeight:
                          "600",
                        lineHeight:
                          "1.2",
                        whiteSpace:
                          "normal",
                        wordBreak:
                          "break-word",
                      }}
                    >
                      {skill}
                    </span>

                  )
                )}

              </div>

            ) : (

              <p className="applicant-profile-empty">
                No skills information available.
              </p>

            )

          )}

        </section>

        {/* =====================================================
            PROJECTS
        ====================================================== */}

        <section className="applicant-profile-card">

          <div
            className="applicant-profile-card-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >

              <div className="applicant-profile-section-icon">
                🚀
              </div>

              <div>

                <h3>
                  Projects
                </h3>

                <p>
                  Projects identified from your resume
                </p>

              </div>

            </div>

            {!isProjectsEditing ? (

              <button
                type="button"
                className="applicant-profile-primary-btn"
                onClick={
                  handleEditProjects
                }
              >
                ✏️ Edit
              </button>

            ) : (

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >

                <button
                  type="button"
                  className="applicant-profile-primary-btn"
                  onClick={
                    handleAddProject
                  }
                  disabled={projectsSaving}
                >
                  + Add Project
                </button>

                <button
                  type="button"
                  className="applicant-profile-secondary-btn"
                  onClick={
                    handleCancelProjects
                  }
                  disabled={projectsSaving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="applicant-profile-primary-btn"
                  onClick={
                    handleSaveProjects
                  }
                  disabled={projectsSaving}
                >
                  {projectsSaving
                    ? "Saving..."
                    : "Save"}
                </button>

              </div>

            )}

          </div>

          {projectsError && (
            <div
              className="applicant-profile-error"
              style={{
                marginTop: "15px",
                marginBottom: "15px",
              }}
            >
              <p>
                {projectsError}
              </p>
            </div>
          )}

          {projectsSuccess && (
            <div
              style={{
                marginTop: "15px",
                marginBottom: "15px",
              }}
            >
              <p>
                {projectsSuccess}
              </p>
            </div>
          )}

          {displayedProjects.length > 0 ? (

            <div className="applicant-profile-list">

              {displayedProjects.map(
                (
                  project,
                  index
                ) => {

                  const editProject =
                    isProjectsEditing
                      ? editUser?.projects?.[index] || project
                      : project;

                  return (
                    <div
                      className="applicant-profile-list-item"
                      key={
                        `project-${index}`
                      }
                    >

                      {isProjectsEditing ? (

                        <>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              marginBottom: "15px",
                            }}
                          >

                            <button
                              type="button"
                              className="applicant-profile-secondary-btn"
                              onClick={() =>
                                handleDeleteProject(index)
                              }
                              disabled={projectsSaving}
                              style={{
                                color: "#b42318",
                                borderColor: "#f1b5b0",
                              }}
                            >
                              🗑️ Delete
                            </button>

                          </div>

                          <div className="applicant-profile-field">

                            <span>
                              Project Title
                            </span>

                            <input
                              type="text"
                              value={
                                editProject.title ||
                                editProject.name ||
                                ""
                              }
                              onChange={(event) =>
                                handleProjectChange(
                                  index,
                                  "title",
                                  event.target.value
                                )
                              }
                              placeholder="Enter project title"
                              className="applicant-profile-input"
                            />

                          </div>

                          <div className="applicant-profile-field">

                            <span>
                              Year
                            </span>

                            <input
                              type="number"
                              value={
                                editProject.year ||
                                ""
                              }
                              onChange={(event) =>
                                handleProjectChange(
                                  index,
                                  "year",
                                  event.target.value
                                )
                              }
                              placeholder="Enter project year"
                              className="applicant-profile-input"
                            />

                          </div>

                          <div className="applicant-profile-field">

                            <span>
                              Description
                            </span>

                            <textarea
                              value={
                                editProject.description ||
                                ""
                              }
                              onChange={(event) =>
                                handleProjectChange(
                                  index,
                                  "description",
                                  event.target.value
                                )
                              }
                              placeholder="Describe your project"
                              className="applicant-profile-input"
                              rows="4"
                            />

                          </div>

                          <div className="applicant-profile-field">

                            <span>
                              Technologies
                            </span>

                            <input
                              type="text"
                              value={
                                typeof editProject.technologies ===
                                "string"
                                  ? editProject.technologies
                                  : Array.isArray(
                                        editProject.technologies
                                    )
                                    ? editProject.technologies.join(
                                        ", "
                                      )
                                    : ""
                              }
                              onChange={(event) =>
                                handleProjectTechnologyChange(
                                  index,
                                  event.target.value
                                )
                              }
                              placeholder="Example: Java, Spring Boot, MySQL"
                              className="applicant-profile-input"
                            />

                            <small>
                              Separate technologies with commas.
                            </small>

                          </div>

                        </>

                      ) : (

  <>

    {/* Project Title */}
    <h4>
      {project.title ||
        project.name ||
        project.projectTitle ||
        project.projectName ||
        "Untitled Project"}
    </h4>

    {/* Project Year */}
    {(project.year || project.projectYear) && (
      <p>
        <strong>Year:</strong>{" "}
        {project.year || project.projectYear}
      </p>
    )}

    {/* Project Description */}
    {(project.description ||
      project.projectDescription) && (
      <p>
        <strong>Description:</strong>{" "}
        {project.description ||
          project.projectDescription}
      </p>
    )}

    {/* Technologies */}
    {(() => {
      const technologies =
        project.technologies ??
        project.technology ??
        project.techStack;

      const technologyText = Array.isArray(technologies)
        ? technologies.join(", ")
        : typeof technologies === "string"
          ? technologies
          : "";

      return technologyText.trim() ? (
        <div className="applicant-profile-project-tech">
          <strong>Technologies:</strong>{" "}
          <span>{technologyText}</span>
        </div>
      ) : null;
    })()}

    {/* Project URL */}
    {(project.projectUrl ||
      project.projectLink ||
      project.url ||
      project.link) && (
      <p>
        <strong>Project Link:</strong>{" "}
        <a
          href={
            project.projectUrl ||
            project.projectLink ||
            project.url ||
            project.link
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          View Project
        </a>
      </p>
    )}

  </>

)}
                    </div>
                  );
                }
              )}

            </div>

          ) : (

            <div>

              <p className="applicant-profile-empty">
                No project information available.
              </p>

              {isProjectsEditing && (
                <button
                  type="button"
                  className="applicant-profile-primary-btn"
                  onClick={
                    handleAddProject
                  }
                  disabled={projectsSaving}
                  style={{
                    marginTop: "15px",
                  }}
                >
                  + Add Project
                </button>
              )}

            </div>

          )}

        </section>

        {/* =====================================================
            CERTIFICATIONS
        ====================================================== */}

        <section className="applicant-profile-card">

          <div
            className="applicant-profile-card-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div className="applicant-profile-section-icon">
                📜
              </div>

              <div>
                <h3>Certifications</h3>
                <p>
                  Add and manage your certifications
                </p>
              </div>
            </div>

            {!isCertificationsEditing ? (
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="applicant-profile-secondary-btn"
                  onClick={handleAddCertification}
                >
                  + Add
                </button>

                <button
                  type="button"
                  className="applicant-profile-primary-btn"
                  onClick={handleEditCertifications}
                >
                  ✏️ Edit
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="applicant-profile-secondary-btn"
                  onClick={handleAddCertification}
                  disabled={certificationsSaving}
                >
                  + Add
                </button>

                <button
                  type="button"
                  className="applicant-profile-secondary-btn"
                  onClick={handleCancelCertifications}
                  disabled={certificationsSaving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="applicant-profile-primary-btn"
                  onClick={handleSaveCertifications}
                  disabled={certificationsSaving}
                >
                  {certificationsSaving ? "Saving..." : "Save"}
                </button>
              </div>
            )}

          </div>

          {certificationsError && (
            <div
              className="applicant-profile-error"
              style={{
                marginTop: "15px",
                marginBottom: "15px",
              }}
            >
              <p>{certificationsError}</p>
            </div>
          )}

          {certificationsSuccess && (
            <div
              style={{
                marginTop: "15px",
                marginBottom: "15px",
              }}
            >
              <p>{certificationsSuccess}</p>
            </div>
          )}

          {displayedCertifications.length > 0 ? (
  <div className="applicant-profile-list">
    {displayedCertifications.map((certification, index) => (
      <div
        className="applicant-profile-list-item"
        key={
          certification.certificationId ||
          `certification-${index}`
        }
      >
        {isCertificationsEditing ? (
          <>
            <div className="applicant-profile-field">
              <span>Name</span>
              <input
                type="text"
                value={certification.name || ""}
                onChange={(event) =>
                  handleCertificationChange(
                    index,
                    "name",
                    event.target.value
                  )
                }
                placeholder="e.g. AWS Certified Cloud Practitioner"
                className="applicant-profile-input"
              />
            </div>

            <div className="applicant-profile-field">
              <span>Issuing Organization</span>
              <input
                type="text"
                value={certification.issuingOrganization || ""}
                onChange={(event) =>
                  handleCertificationChange(
                    index,
                    "issuingOrganization",
                    event.target.value
                  )
                }
                placeholder="e.g. Amazon Web Services"
                className="applicant-profile-input"
              />
            </div>

            <div className="applicant-profile-field">
              <span>Issue Date</span>
              <input
                type="month"
                value={(certification.issueDate || "").slice(0, 7)}
                onChange={(event) =>
                  handleCertificationChange(
                    index,
                    "issueDate",
                    event.target.value
                  )
                }
                className="applicant-profile-input"
              />
            </div>

            <div className="applicant-profile-field">
              <span>Expiry Date</span>
              <input
                type="month"
                value={(certification.expiryDate || "").slice(0, 7)}
                onChange={(event) =>
                  handleCertificationChange(
                    index,
                    "expiryDate",
                    event.target.value
                  )
                }
                className="applicant-profile-input"
              />
            </div>

            <div className="applicant-profile-field">
              <span>Credential ID</span>
              <input
                type="text"
                value={certification.credentialId || ""}
                onChange={(event) =>
                  handleCertificationChange(
                    index,
                    "credentialId",
                    event.target.value
                  )
                }
                placeholder="Credential ID"
                className="applicant-profile-input"
              />
            </div>

            <div className="applicant-profile-field">
              <span>Credential URL</span>
              <input
                type="url"
                value={certification.credentialUrl || ""}
                onChange={(event) =>
                  handleCertificationChange(
                    index,
                    "credentialUrl",
                    event.target.value
                  )
                }
                placeholder="https://..."
                className="applicant-profile-input"
              />
            </div>

            <button
              type="button"
              className="applicant-profile-secondary-btn"
              onClick={() =>
                handleDeleteCertification(certification, index)
              }
              disabled={certificationsSaving}
              style={{ marginTop: "10px" }}
            >
              🗑️ Delete
            </button>
          </>
        ) : (
          <>
            <h4>
              {certification.name ||
                certification.title ||
                certification.certificationName ||
                "Untitled Certification"}
            </h4>

            {(certification.issuingOrganization ||
              certification.issuer ||
              certification.organization) && (
              <p>
                <strong>Issuing Organization:</strong>{" "}
                {certification.issuingOrganization ||
                  certification.issuer ||
                  certification.organization}
              </p>
            )}

            {(certification.issueDate || certification.issue_date) && (
              <p>
                <strong>Issue Date:</strong>{" "}
                {certification.issueDate || certification.issue_date}
              </p>
            )}

            {(certification.expiryDate || certification.expiry_date) && (
              <p>
                <strong>Expiry Date:</strong>{" "}
                {certification.expiryDate || certification.expiry_date}
              </p>
            )}

            {(certification.credentialId ||
              certification.credential_id) && (
              <p>
                <strong>Credential ID:</strong>{" "}
                {certification.credentialId ||
                  certification.credential_id}
              </p>
            )}

            {(certification.credentialUrl ||
              certification.credential_url) && (
              <p>
                <strong>Credential URL:</strong>{" "}
                <a
                  href={
                    certification.credentialUrl ||
                    certification.credential_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Credential
                </a>
              </p>
            )}
          </>
        )}
      </div>
    ))}
  </div>
) : (
  <div>
    <p className="applicant-profile-empty">
      No certifications available.
    </p>

    {isCertificationsEditing && (
      <button
        type="button"
        className="applicant-profile-primary-btn"
        onClick={handleAddCertification}
        disabled={certificationsSaving}
        style={{ marginTop: "15px" }}
      >
        + Add Certification
      </button>
    )}
  </div>
)}
        </section>

        {/* =====================================================
            ACHIEVEMENTS
        ====================================================== */}

        <section className="applicant-profile-card">

          <div
            className="applicant-profile-card-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div className="applicant-profile-section-icon">
                🏆
              </div>

              <div>
                <h3>Achievements</h3>
                <p>
                  Add and manage your achievements
                </p>
              </div>
            </div>

            {!isAchievementsEditing ? (
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="applicant-profile-secondary-btn"
                  onClick={handleAddAchievement}
                >
                  + Add
                </button>

                <button
                  type="button"
                  className="applicant-profile-primary-btn"
                  onClick={handleEditAchievements}
                >
                  ✏️ Edit
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="applicant-profile-secondary-btn"
                  onClick={handleAddAchievement}
                  disabled={achievementsSaving}
                >
                  + Add
                </button>

                <button
                  type="button"
                  className="applicant-profile-secondary-btn"
                  onClick={handleCancelAchievements}
                  disabled={achievementsSaving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="applicant-profile-primary-btn"
                  onClick={handleSaveAchievements}
                  disabled={achievementsSaving}
                >
                  {achievementsSaving ? "Saving..." : "Save"}
                </button>
              </div>
            )}

          </div>

          {achievementsError && (
            <div
              className="applicant-profile-error"
              style={{
                marginTop: "15px",
                marginBottom: "15px",
              }}
            >
              <p>{achievementsError}</p>
            </div>
          )}

          {achievementsSuccess && (
            <div
              style={{
                marginTop: "15px",
                marginBottom: "15px",
              }}
            >
              <p>{achievementsSuccess}</p>
            </div>
          )}

          {displayedAchievements.length > 0 ? (
            <div className="applicant-profile-list">

              {displayedAchievements.map(
                (achievement, index) => (
                  <div
                    className="applicant-profile-list-item"
                    key={
                      achievement.achievementId ||
                      `achievement-${index}`
                    }
                  >

                    {isAchievementsEditing ? (
                      <>

                        <div className="applicant-profile-field">
                          <span>Title</span>
                          <input
                            type="text"
                            value={achievement.title || ""}
                            onChange={(event) =>
                              handleAchievementChange(
                                index,
                                "title",
                                event.target.value
                              )
                            }
                            placeholder="e.g. Best Project Award"
                            className="applicant-profile-input"
                          />
                        </div>

                        <div className="applicant-profile-field">
                          <span>Description</span>
                          <textarea
                            value={
                              achievement.description || ""
                            }
                            onChange={(event) =>
                              handleAchievementChange(
                                index,
                                "description",
                                event.target.value
                              )
                            }
                            placeholder="Describe the achievement"
                            className="applicant-profile-input"
                            rows="4"
                          />
                        </div>

                        <div className="applicant-profile-field">
                          <span>Date</span>
                          <input
                            type="month"
                            value={achievement.date || ""}
                            onChange={(event) =>
                              handleAchievementChange(
                                index,
                                "date",
                                event.target.value
                              )
                            }
                            className="applicant-profile-input"
                          />
                        </div>

                        <div className="applicant-profile-field">
                          <span>Issuer</span>
                          <input
                            type="text"
                            value={achievement.issuer || ""}
                            onChange={(event) =>
                              handleAchievementChange(
                                index,
                                "issuer",
                                event.target.value
                              )
                            }
                            placeholder="e.g. Presidency College"
                            className="applicant-profile-input"
                          />
                        </div>

                        <button
                          type="button"
                          className="applicant-profile-secondary-btn"
                          onClick={() =>
                            handleDeleteAchievement(
                              achievement,
                              index
                            )
                          }
                          disabled={achievementsSaving}
                          style={{ marginTop: "10px" }}
                        >
                          🗑️ Delete
                        </button>

                      </>
                    ) : (
                      <>

                        <h4>
                          {achievement.title ||
                            achievement.name ||
                            "Achievement"}
                        </h4>

                        {achievement.description && (
                          <p>
                            {achievement.description}
                          </p>
                        )}

                        {achievement.date && (
                          <span>
                            {achievement.date}
                          </span>
                        )}

                        {achievement.issuer && (
                          <p>
                            {achievement.issuer}
                          </p>
                        )}

                      </>
                    )}

                  </div>
                )
              )}

            </div>
          ) : (
            <div>
              <p className="applicant-profile-empty">
                No achievements available.
              </p>

              {isAchievementsEditing && (
                <button
                  type="button"
                  className="applicant-profile-primary-btn"
                  onClick={handleAddAchievement}
                  disabled={achievementsSaving}
                  style={{ marginTop: "15px" }}
                >
                  + Add Achievement
                </button>
              )}
            </div>
          )}

               </section>
      </div>

    </div>
  );
}

export default MyProfile;