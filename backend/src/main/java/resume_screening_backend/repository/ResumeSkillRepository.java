package resume_screening_backend.repository;

import resume_screening_backend.entity.ResumeSkill;
import resume_screening_backend.entity.ResumeSkillId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeSkillRepository
        extends JpaRepository<ResumeSkill, ResumeSkillId> {

    List<ResumeSkill> findByIdResumeId(Long resumeId);

    List<ResumeSkill> findByIdSkillId(Long skillId);
}