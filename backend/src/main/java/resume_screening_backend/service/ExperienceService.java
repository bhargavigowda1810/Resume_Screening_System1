package resume_screening_backend.service;

import resume_screening_backend.entity.Experience;
import resume_screening_backend.entity.Resume;
import resume_screening_backend.entity.User;
import resume_screening_backend.repository.ExperienceRepository;
import resume_screening_backend.repository.ResumeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ExperienceService {

    private final ExperienceRepository experienceRepository;
    private final ResumeRepository resumeRepository;
    private final UserService userService;
    
    public ExperienceService(
        ExperienceRepository experienceRepository,
        ResumeRepository resumeRepository,
        UserService userService) { 

        this.experienceRepository = experienceRepository;
        this.resumeRepository = resumeRepository;
        this.userService = userService;
       
    }

    public Experience saveExperience(Experience experience) {
        return experienceRepository.save(experience);
    }

    public Experience createExperience(
            Experience experience,
            String email) {

        Optional<User> user =
                userService.findByEmail(email);

        if (user.isEmpty()) {
            throw new IllegalArgumentException(
                    "User was not found."
            );
        }

        if (experience.getResumeId() == null) {
            throw new IllegalArgumentException(
                    "Resume ID is required."
            );
        }

        if (!isResumeOwnedByUser(
                experience.getResumeId(),
                user.get().getUserId())) {

            throw new IllegalArgumentException(
                    "You are not authorized to add experience to this resume."
            );
        }

        validateExperience(experience);

        experience.setOriginalStartDate(
                experience.getStartDate()
        );

        experience.setOriginalEndDate(
                experience.getEndDate()
        );

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

    public Experience updateExperience(
            Long experienceId,
            Experience updatedExperience,
            String email) {

        Optional<User> user =
                userService.findByEmail(email);

        if (user.isEmpty()) {
            throw new IllegalArgumentException(
                    "User was not found."
            );
        }

        Optional<Experience> existingOptional =
                experienceRepository.findById(experienceId);

        if (existingOptional.isEmpty()) {
            throw new IllegalArgumentException(
                    "Experience was not found."
            );
        }

        Experience existingExperience =
                existingOptional.get();

        if (!isOwnedByUser(
                experienceId,
                user.get().getUserId())) {

            throw new IllegalArgumentException(
                    "You are not authorized to update this experience."
            );
        }

        validateExperience(updatedExperience);

        if (existingExperience.getOriginalStartDate() != null &&
                updatedExperience.getStartDate() != null &&
                updatedExperience.getStartDate()
                        .isBefore(existingExperience.getOriginalStartDate())) {

            throw new IllegalArgumentException(
                    "Start date cannot be earlier than the original start date."
            );
        }

        if (existingExperience.getOriginalEndDate() != null) {

            if (updatedExperience.getEndDate() == null) {
                throw new IllegalArgumentException(
                        "End date cannot be changed to Present."
                );
            }

            if (updatedExperience.getEndDate()
                    .isBefore(existingExperience.getOriginalEndDate())) {

                throw new IllegalArgumentException(
                        "End date cannot be earlier than the original end date."
                );
            }
        }

        updatedExperience.setExperienceId(experienceId);

        updatedExperience.setResumeId(
                existingExperience.getResumeId()
        );

        updatedExperience.setOriginalStartDate(
                existingExperience.getOriginalStartDate()
        );

        updatedExperience.setOriginalEndDate(
                existingExperience.getOriginalEndDate()
        );

        return experienceRepository.save(updatedExperience);
    }

    public void deleteExperience(Long experienceId) {
        experienceRepository.deleteById(experienceId);
    }

    private void validateExperience(Experience experience) {

        if (experience.getCompany() == null ||
                experience.getCompany().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Company name is required."
            );
        }

        if (experience.getJobTitle() == null ||
                experience.getJobTitle().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Job title is required."
            );
        }

        if (experience.getStartDate() == null) {

            throw new IllegalArgumentException(
                    "Start date is required."
            );
        }

        if (experience.getEndDate() != null &&
                experience.getEndDate()
                        .isBefore(experience.getStartDate())) {

            throw new IllegalArgumentException(
                    "End date cannot be before start date."
            );
        }
    }

    public boolean isOwnedByUser(
            Long experienceId,
            Long userId) {

        Optional<Experience> experience =
                experienceRepository.findById(experienceId);

        if (experience.isEmpty()) {
            return false;
        }

        Optional<Resume> resume =
                resumeRepository.findById(
                        experience.get().getResumeId()
                );

        if (resume.isEmpty()) {
            return false;
        }

        return resume.get().getApplicantId().equals(userId);
    }

    public boolean isResumeOwnedByUser(
            Long resumeId,
            Long userId) {

        Optional<Resume> resume =
                resumeRepository.findById(resumeId);

        if (resume.isEmpty()) {
            return false;
        }

        return resume.get().getApplicantId().equals(userId);
    }
}
