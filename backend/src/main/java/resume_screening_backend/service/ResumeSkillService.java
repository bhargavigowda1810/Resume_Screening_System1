package resume_screening_backend.service;

import resume_screening_backend.entity.ResumeSkill;
import resume_screening_backend.entity.ResumeSkillId;
import org.springframework.stereotype.Service;
import resume_screening_backend.repository.ResumeSkillRepository;

import java.util.List;

@Service
public class ResumeSkillService {

    private final ResumeSkillRepository resumeSkillRepository;

    public ResumeSkillService(ResumeSkillRepository resumeSkillRepository) {
        this.resumeSkillRepository = resumeSkillRepository;
    }

    public ResumeSkill addSkillToResume(Long resumeId, Long skillId) {

        ResumeSkillId id = new ResumeSkillId(resumeId, skillId);

        ResumeSkill resumeSkill = new ResumeSkill();
        resumeSkill.setId(id);

        return resumeSkillRepository.save(resumeSkill);
    }

    public List<ResumeSkill> findSkillsByResumeId(Long resumeId) {
        return resumeSkillRepository.findByIdResumeId(resumeId);
    }

    public List<ResumeSkill> findResumesBySkillId(Long skillId) {
        return resumeSkillRepository.findByIdSkillId(skillId);
    }

    public boolean exists(Long resumeId, Long skillId) {

        ResumeSkillId id = new ResumeSkillId(resumeId, skillId);

        return resumeSkillRepository.existsById(id);
    }

    public void removeSkillFromResume(Long resumeId, Long skillId) {

        ResumeSkillId id = new ResumeSkillId(resumeId, skillId);

        resumeSkillRepository.deleteById(id);
    }

    public List<ResumeSkill> findAll() {
        return resumeSkillRepository.findAll();
    }
}