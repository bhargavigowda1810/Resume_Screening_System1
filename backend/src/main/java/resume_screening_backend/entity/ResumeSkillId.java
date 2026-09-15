package resume_screening_backend.entity;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ResumeSkillId implements Serializable {

    private Long resumeId;
    private Long skillId;

    public ResumeSkillId() {
    }

    public ResumeSkillId(Long resumeId, Long skillId) {
        this.resumeId = resumeId;
        this.skillId = skillId;
    }

    public Long getResumeId() {
        return resumeId;
    }

    public void setResumeId(Long resumeId) {
        this.resumeId = resumeId;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ResumeSkillId)) return false;
        ResumeSkillId that = (ResumeSkillId) o;
        return Objects.equals(resumeId, that.resumeId)
                && Objects.equals(skillId, that.skillId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(resumeId, skillId);
    }
}