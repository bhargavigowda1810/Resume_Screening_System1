package resume_screening_backend.dto;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalDateTime;
import java.util.List;

public class ApplicantProfileResponse {

    private Long userId;
    private String name;
    private String email;
    private String role;

    private Long resumeId;
    private String fileName;
    private String fileType;
    private LocalDateTime uploadedAt;

    private String phone;
    private String linkedin;
    private String github;
    private String portfolio;

    @JsonRawValue
    private String projects;

    @JsonRawValue
    private String certifications;

    @JsonRawValue
    private String achievements;

    private List<EducationResponse> education;
    private List<ExperienceResponse> experience;
    private List<String> skills;

    public ApplicantProfileResponse() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getResumeId() {
        return resumeId;
    }

    public void setResumeId(Long resumeId) {
        this.resumeId = resumeId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getLinkedin() {
        return linkedin;
    }

    public void setLinkedin(String linkedin) {
        this.linkedin = linkedin;
    }

    public String getGithub() {
        return github;
    }

    public void setGithub(String github) {
        this.github = github;
    }

    public String getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(String portfolio) {
        this.portfolio = portfolio;
    }

    public String getProjects() {
        return projects;
    }

    public void setProjects(JsonNode projects) {
        this.projects = projects != null ? projects.toString() : "[]";
    }

    public String getCertifications() {
        return certifications;
    }

    public void setCertifications(JsonNode certifications) {
        this.certifications =
                certifications != null ? certifications.toString() : "[]";
    }

    public String getAchievements() {
        return achievements;
    }

    public void setAchievements(JsonNode achievements) {
        this.achievements =
                achievements != null ? achievements.toString() : "[]";
    }

    public List<EducationResponse> getEducation() {
        return education;
    }

    public void setEducation(List<EducationResponse> education) {
        this.education = education;
    }

    public List<ExperienceResponse> getExperience() {
        return experience;
    }

    public void setExperience(List<ExperienceResponse> experience) {
        this.experience = experience;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public static class EducationResponse {

        private Long educationId;
        private String degree;
        private String institution;
        private String fieldOfStudy;
        private Integer startYear;
        private Integer endYear;
        private String grade;

        public EducationResponse() {
        }

        public Long getEducationId() {
            return educationId;
        }

        public void setEducationId(Long educationId) {
            this.educationId = educationId;
        }

        public String getDegree() {
            return degree;
        }

        public void setDegree(String degree) {
            this.degree = degree;
        }

        public String getInstitution() {
            return institution;
        }

        public void setInstitution(String institution) {
            this.institution = institution;
        }

        public String getFieldOfStudy() {
            return fieldOfStudy;
        }

        public void setFieldOfStudy(String fieldOfStudy) {
            this.fieldOfStudy = fieldOfStudy;
        }

        public Integer getStartYear() {
            return startYear;
        }

        public void setStartYear(Integer startYear) {
            this.startYear = startYear;
        }

        public Integer getEndYear() {
            return endYear;
        }

        public void setEndYear(Integer endYear) {
            this.endYear = endYear;
        }

        public String getGrade() {
            return grade;
        }

        public void setGrade(String grade) {
            this.grade = grade;
        }
    }

    public static class ExperienceResponse {

        private Long experienceId;
        private String company;
        private String jobTitle;
        private String startDate;
        private String endDate;
        private String description;

        public ExperienceResponse() {
        }

        public Long getExperienceId() {
            return experienceId;
        }

        public void setExperienceId(Long experienceId) {
            this.experienceId = experienceId;
        }

        public String getCompany() {
            return company;
        }

        public void setCompany(String company) {
            this.company = company;
        }

        public String getJobTitle() {
            return jobTitle;
        }

        public void setJobTitle(String jobTitle) {
            this.jobTitle = jobTitle;
        }

        public String getStartDate() {
            return startDate;
        }

        public void setStartDate(String startDate) {
            this.startDate = startDate;
        }

        public String getEndDate() {
            return endDate;
        }

        public void setEndDate(String endDate) {
            this.endDate = endDate;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}
