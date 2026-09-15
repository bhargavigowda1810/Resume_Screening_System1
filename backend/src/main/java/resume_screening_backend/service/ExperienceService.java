package resume_screening_backend.service;

import resume_screening_backend.entity.Experience;
import org.springframework.stereotype.Service;
import resume_screening_backend.repository.ExperienceRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ExperienceService {

    private final ExperienceRepository experienceRepository;

    public ExperienceService(ExperienceRepository experienceRepository) {
        this.experienceRepository = experienceRepository;
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
}