package resume_screening_backend.service;

import org.springframework.stereotype.Service;

import resume_screening_backend.entity.Resume;
import resume_screening_backend.entity.ResumeProfile;
import resume_screening_backend.entity.User;
import resume_screening_backend.repository.ResumeProfileRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ResumeProfileService {

    private final ResumeProfileRepository resumeProfileRepository;
    private final UserService userService;
    private final ResumeService resumeService;

    public ResumeProfileService(
            ResumeProfileRepository resumeProfileRepository,
            UserService userService,
            ResumeService resumeService) {

        this.resumeProfileRepository = resumeProfileRepository;
        this.userService = userService;
        this.resumeService = resumeService;
    }

    public ResumeProfile saveResumeProfile(
            ResumeProfile resumeProfile) {

        return resumeProfileRepository.save(resumeProfile);
    }

    public Optional<ResumeProfile> findByResumeId(Long resumeId) {

        return resumeProfileRepository.findByResumeId(resumeId);
    }

    public Optional<ResumeProfile> findById(Long profileId) {

        return resumeProfileRepository.findById(profileId);
    }

    public Optional<ResumeProfile> updateResumeProfile(
            Long profileId,
            ResumeProfile updatedProfile,
            String email) {

        Optional<User> optionalUser = userService.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return Optional.empty();
        }

        User user = optionalUser.get();

        Optional<ResumeProfile> optionalExistingProfile =
                resumeProfileRepository.findById(profileId);

        if (optionalExistingProfile.isEmpty()) {
            return Optional.empty();
        }

        ResumeProfile existingProfile = optionalExistingProfile.get();

        List<Resume> userResumes =
                resumeService.findByApplicantId(user.getUserId());

        boolean ownsProfile = false;

        for (Resume resume : userResumes) {

            if (resume.getResumeId()
                    .equals(existingProfile.getResumeId())) {

                ownsProfile = true;
                break;
            }
        }

        if (!ownsProfile) {
            return Optional.empty();
        }

        existingProfile.setPhone(
                updatedProfile.getPhone() != null
                        ? updatedProfile.getPhone().trim()
                        : null
        );

        existingProfile.setLinkedin(
                updatedProfile.getLinkedin() != null
                        ? updatedProfile.getLinkedin().trim()
                        : null
        );

        existingProfile.setGithub(
                updatedProfile.getGithub() != null
                        ? updatedProfile.getGithub().trim()
                        : null
        );

        existingProfile.setPortfolio(
                updatedProfile.getPortfolio() != null
                        ? updatedProfile.getPortfolio().trim()
                        : null
        );

        return Optional.of(
                resumeProfileRepository.save(existingProfile)
        );
    }

    public Optional<ResumeProfile> updateProjects(
            Long profileId,
            com.fasterxml.jackson.databind.JsonNode projects,
            String email) {

        Optional<User> optionalUser = userService.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return Optional.empty();
        }

        User user = optionalUser.get();

        Optional<ResumeProfile> optionalExistingProfile =
                resumeProfileRepository.findById(profileId);

        if (optionalExistingProfile.isEmpty()) {
            return Optional.empty();
        }

        ResumeProfile existingProfile = optionalExistingProfile.get();

        List<Resume> userResumes =
                resumeService.findByApplicantId(user.getUserId());

        boolean ownsProfile = false;

        for (Resume resume : userResumes) {

            if (resume.getResumeId()
                    .equals(existingProfile.getResumeId())) {

                ownsProfile = true;
                break;
            }
        }

        if (!ownsProfile) {
            return Optional.empty();
        }

        if (projects == null || !projects.isArray()) {
            throw new IllegalArgumentException(
                    "Projects must be provided as an array."
            );
        }

        existingProfile.setProjects(projects);

        return Optional.of(
                resumeProfileRepository.save(existingProfile)
        );
    }

    public void deleteResumeProfile(Long profileId) {

        resumeProfileRepository.deleteById(profileId);
    }
}
