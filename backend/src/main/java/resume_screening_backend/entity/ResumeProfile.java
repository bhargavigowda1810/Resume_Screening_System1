package resume_screening_backend.entity;

import com.fasterxml.jackson.databind.JsonNode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "resume_profiles")
public class ResumeProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private Long profileId;

    @Column(name = "resume_id", nullable = false, unique = true)
    private Long resumeId;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "linkedin", columnDefinition = "text")
    private String linkedin;

    @Column(name = "github", columnDefinition = "text")
    private String github;

    @Column(name = "portfolio", columnDefinition = "text")
    private String portfolio;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "projects", columnDefinition = "jsonb")
    private JsonNode projects;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "certifications", columnDefinition = "jsonb")
    private JsonNode certifications;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "achievements", columnDefinition = "jsonb")
    private JsonNode achievements;

    public ResumeProfile() {
    }

    public Long getProfileId() {
        return profileId;
    }

    public void setProfileId(Long profileId) {
        this.profileId = profileId;
    }

    public Long getResumeId() {
        return resumeId;
    }

    public void setResumeId(Long resumeId) {
        this.resumeId = resumeId;
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

    public JsonNode getProjects() {
        return projects;
    }

    public void setProjects(JsonNode projects) {
        this.projects = projects;
    }

    public JsonNode getCertifications() {
        return certifications;
    }

    public void setCertifications(JsonNode certifications) {
        this.certifications = certifications;
    }

    public JsonNode getAchievements() {
        return achievements;
    }

    public void setAchievements(JsonNode achievements) {
        this.achievements = achievements;
    }
}