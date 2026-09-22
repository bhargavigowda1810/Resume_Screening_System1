package resume_screening_backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "screening_results",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "screening_results_application_id_key",
            columnNames = {"application_id"}
        )
    }
)
public class ScreeningResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Long resultId;

    @Column(name = "application_id", nullable = false, unique = true)
    private Long applicationId;

    @Column(name = "similarity_score", precision = 5, scale = 2)
    private BigDecimal similarityScore;

    @Column(name = "skills_score", precision = 5, scale = 2)
    private BigDecimal skillsScore;

    @Column(name = "experience_score", precision = 5, scale = 2)
    private BigDecimal experienceScore;

    @Column(name = "education_score", precision = 5, scale = 2)
    private BigDecimal educationScore;

    @Column(name = "final_score", precision = 5, scale = 2)
    private BigDecimal finalScore;

    @Column(name = "recommendation", length = 30)
    private String recommendation;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    public ScreeningResult() {
    }

    public Long getResultId() {
        return resultId;
    }

    public void setResultId(Long resultId) {
        this.resultId = resultId;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public BigDecimal getSimilarityScore() {
        return similarityScore;
    }

    public void setSimilarityScore(BigDecimal similarityScore) {
        this.similarityScore = similarityScore;
    }

    public BigDecimal getSkillsScore() {
        return skillsScore;
    }

    public void setSkillsScore(BigDecimal skillsScore) {
        this.skillsScore = skillsScore;
    }

    public BigDecimal getExperienceScore() {
        return experienceScore;
    }

    public void setExperienceScore(BigDecimal experienceScore) {
        this.experienceScore = experienceScore;
    }

    public BigDecimal getEducationScore() {
        return educationScore;
    }

    public void setEducationScore(BigDecimal educationScore) {
        this.educationScore = educationScore;
    }

    public BigDecimal getFinalScore() {
        return finalScore;
    }

    public void setFinalScore(BigDecimal finalScore) {
        this.finalScore = finalScore;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }
}