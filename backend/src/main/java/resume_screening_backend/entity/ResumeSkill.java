package resume_screening_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "resume_skills")
public class ResumeSkill {

    @EmbeddedId
    private ResumeSkillId id;

    public ResumeSkill() {
    }

    public ResumeSkillId getId() {
        return id;
    }

    public void setId(ResumeSkillId id) {
        this.id = id;
    }
}