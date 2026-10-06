package resume_screening_backend.service;

import resume_screening_backend.entity.ResumeSkill;
import resume_screening_backend.entity.ResumeSkillId;
import org.springframework.stereotype.Service;
import resume_screening_backend.repository.ResumeSkillRepository;
import resume_screening_backend.entity.Resume;
import resume_screening_backend.repository.ResumeRepository;
import resume_screening_backend.repository.SkillRepository;
import resume_screening_backend.entity.Skill;
import org.springframework.transaction.annotation.Transactional;
import resume_screening_backend.entity.User;
import resume_screening_backend.service.UserService;
import java.util.ArrayList;


import java.util.Optional;
import java.util.List;

@Service
public class ResumeSkillService {

   private final ResumeSkillRepository resumeSkillRepository;
private final ResumeRepository resumeRepository;
private final SkillRepository skillRepository;
private final UserService userService;

public ResumeSkillService(
        ResumeSkillRepository resumeSkillRepository,
        ResumeRepository resumeRepository,
        SkillRepository skillRepository,
        UserService userService) {

    this.resumeSkillRepository = resumeSkillRepository;
    this.resumeRepository = resumeRepository;
    this.skillRepository = skillRepository;
    this.userService = userService;
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
public boolean isResumeOwnedByUser(Long resumeId, Long userId) {

    Optional<Resume> resume =
            resumeRepository.findById(resumeId);

    if (resume.isEmpty()) {
        return false;
    }

    return resume.get().getApplicantId().equals(userId);
}
@Transactional
public List<String> updateSkillsForResume(
        Long resumeId,
        List<String> skillNames,
        String email) {

    Optional<User> optionalUser =
            userService.findByEmail(email);

    if (optionalUser.isEmpty()) {
        throw new IllegalArgumentException("User was not found.");
    }

    User user = optionalUser.get();

    Optional<Resume> optionalResume =
            resumeRepository.findById(resumeId);

    if (optionalResume.isEmpty() ||
            !optionalResume.get().getApplicantId().equals(user.getUserId())) {

        throw new IllegalArgumentException(
                "You are not authorized to update skills for this resume."
        );
    }

    if (skillNames == null) {
        throw new IllegalArgumentException(
                "Skills must be provided as an array."
        );
    }

    List<String> cleanedSkillNames = new ArrayList<>();

    for (String skillName : skillNames) {

        if (skillName == null) {
            continue;
        }

        String cleanedName = skillName.trim();

        if (cleanedName.isEmpty()) {
            continue;
        }

        boolean alreadyExists =
                cleanedSkillNames.stream()
                        .anyMatch(existing ->
                                existing.equalsIgnoreCase(cleanedName));

        if (!alreadyExists) {
            cleanedSkillNames.add(cleanedName);
        }
    }

    // Remove existing skills
    List<ResumeSkill> existingMappings =
            resumeSkillRepository.findByIdResumeId(resumeId);

    if (!existingMappings.isEmpty()) {
        resumeSkillRepository.deleteAll(existingMappings);
    }

    // Add the new skills
    for (String skillName : cleanedSkillNames) {

        Optional<Skill> optionalSkill =
                skillRepository.findBySkillNameIgnoreCase(skillName);

        if (optionalSkill.isPresent()) {

            Skill skill = optionalSkill.get();

            ResumeSkillId id =
                    new ResumeSkillId(
                            resumeId,
                            skill.getSkillId()
                    );

            ResumeSkill resumeSkill = new ResumeSkill();
            resumeSkill.setId(id);

            resumeSkillRepository.save(resumeSkill);
        }
    }

    return cleanedSkillNames;
}
}