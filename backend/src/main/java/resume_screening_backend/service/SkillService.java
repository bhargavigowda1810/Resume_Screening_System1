package resume_screening_backend.service;

import resume_screening_backend.entity.Skill;
import org.springframework.stereotype.Service;
import resume_screening_backend.repository.SkillRepository;

import java.util.List;
import java.util.Optional;

@Service
public class SkillService {

    private final SkillRepository skillRepository;

    public SkillService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    public Skill saveSkill(Skill skill) {
        return skillRepository.save(skill);
    }

    public Optional<Skill> findById(Long skillId) {
        return skillRepository.findById(skillId);
    }

    public Optional<Skill> findBySkillName(String skillName) {
        return skillRepository.findBySkillNameIgnoreCase(skillName);
    }

    public List<Skill> findAllSkills() {
        return skillRepository.findAll();
    }

    public Skill getOrCreateSkill(String skillName) {

        Optional<Skill> existingSkill =
                skillRepository.findBySkillNameIgnoreCase(skillName);

        if (existingSkill.isPresent()) {
            return existingSkill.get();
        }

        Skill newSkill = new Skill();
        newSkill.setSkillName(skillName);

        return skillRepository.save(newSkill);
    }

    public Skill updateSkill(Skill skill) {
    return skillRepository.save(skill);
}

    public void deleteSkill(Long skillId) {
        skillRepository.deleteById(skillId);
    }
}