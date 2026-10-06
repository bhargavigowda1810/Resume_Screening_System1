package resume_screening_backend.service;

import resume_screening_backend.entity.Experience;
import org.springframework.stereotype.Service;
import resume_screening_backend.repository.ExperienceRepository;
import resume_screening_backend.entity.Resume;
import resume_screening_backend.repository.ResumeRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ExperienceService {

    private final ExperienceRepository experienceRepository;
private final ResumeRepository resumeRepository;

public ExperienceService(
        ExperienceRepository experienceRepository,
        ResumeRepository resumeRepository) {

    this.experienceRepository = experienceRepository;
    this.resumeRepository = resumeRepository;
}

    public Experience saveExperience(Experience experience) {
        return experienceRepository.save(experience);
    }

    public Optional<Experience> findById(Long experienceId) {
        return experienceRepository.findById(experienceId);
    }

    public List<Experience> findByResumeId(Long resumeId) {
        return experienceRepository.findByResumeId(resumeId);
    }

    public List<Experience> findAllExperiences() {
        return experienceRepository.findAll();
    }

    public Experience updateExperience(Experience experience) {
        return experienceRepository.save(experience);
    }

    public void deleteExperience(Long experienceId) {
        experienceRepository.deleteById(experienceId);
    }
public boolean isOwnedByUser(Long experienceId, Long userId) {

    Optional<Experience> experience =
            experienceRepository.findById(experienceId);

    if (experience.isEmpty()) {
        return false;
    }

    Optional<Resume> resume =
            resumeRepository.findById(experience.get().getResumeId());

    if (resume.isEmpty()) {
        return false;
    }

    return resume.get().getApplicantId().equals(userId);
}

public boolean isResumeOwnedByUser(Long resumeId, Long userId) {

    Optional<Resume> resume =
            resumeRepository.findById(resumeId);

    if (resume.isEmpty()) {
        return false;
    }

    return resume.get().getApplicantId().equals(userId);
}
}