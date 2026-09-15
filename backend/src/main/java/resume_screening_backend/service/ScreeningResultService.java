package resume_screening_backend.service;

import resume_screening_backend.entity.ScreeningResult;
import resume_screening_backend.entity.Application;
import resume_screening_backend.entity.User;
import resume_screening_backend.entity.Resume;

import resume_screening_backend.dto.ScreeningRankingDTO;

import resume_screening_backend.repository.ScreeningResultRepository;
import resume_screening_backend.repository.ApplicationRepository;
import resume_screening_backend.repository.UserRepository;
import resume_screening_backend.repository.ResumeRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ScreeningResultService {

    private final ScreeningResultRepository screeningResultRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;

    public ScreeningResultService(
            ScreeningResultRepository screeningResultRepository,
            ApplicationRepository applicationRepository,
            UserRepository userRepository,
            ResumeRepository resumeRepository) {

        this.screeningResultRepository = screeningResultRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
    }

    // =========================================================
    // SAVE RESULT
    // =========================================================

    public ScreeningResult saveResult(ScreeningResult result) {
        return screeningResultRepository.save(result);
    }

    // =========================================================
    // FIND RESULT BY ID
    // =========================================================

    public Optional<ScreeningResult> findById(Long resultId) {
        return screeningResultRepository.findById(resultId);
    }

    // =========================================================
    // FIND RESULT BY APPLICATION ID
    // =========================================================

    public Optional<ScreeningResult> findByApplicationId(Long applicationId) {
        return screeningResultRepository.findByApplicationId(applicationId);
    }

    // =========================================================
    // FIND ALL RESULTS
    // =========================================================

    public List<ScreeningResult> findAllResults() {
        return screeningResultRepository.findAll();
    }

    // =========================================================
    // RANK RESULTS FOR A JOB
    // =========================================================

    public List<ScreeningRankingDTO> findRankedResultsForJob(Long jobId) {

        List<ScreeningResult> results =
                screeningResultRepository.findRankedResultsForJob(jobId);

        return results.stream()
                .map(this::convertToRankingDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // CONVERT SCREENING RESULT → RANKING DTO
    // =========================================================

    private ScreeningRankingDTO convertToRankingDTO(
            ScreeningResult result) {

        ScreeningRankingDTO dto = new ScreeningRankingDTO();

        dto.setResultId(result.getResultId());
        dto.setApplicationId(result.getApplicationId());

        // -----------------------------------------------------
        // Get Application
        // -----------------------------------------------------

        Optional<Application> applicationOptional =
                applicationRepository.findById(
                        result.getApplicationId()
                );

        if (applicationOptional.isPresent()) {

            Application application = applicationOptional.get();

            dto.setApplicantId(application.getApplicantId());
            dto.setResumeId(application.getResumeId());

            // -------------------------------------------------
            // Get Applicant
            // -------------------------------------------------

            Optional<User> userOptional =
                    userRepository.findById(
                            application.getApplicantId()
                    );

            if (userOptional.isPresent()) {

                User user = userOptional.get();

                dto.setApplicantName(user.getName());
                dto.setApplicantEmail(user.getEmail());
            }

            // -------------------------------------------------
            // Get Resume
            // -------------------------------------------------

            Optional<Resume> resumeOptional =
                    resumeRepository.findById(
                            application.getResumeId()
                    );

            if (resumeOptional.isPresent()) {

                Resume resume = resumeOptional.get();

                dto.setResumeFileName(resume.getFileName());
            }
        }

        // -----------------------------------------------------
        // Screening Scores
        // -----------------------------------------------------

        dto.setSimilarityScore(result.getSimilarityScore());
        dto.setSkillsScore(result.getSkillsScore());
        dto.setExperienceScore(result.getExperienceScore());
        dto.setEducationScore(result.getEducationScore());
        dto.setFinalScore(result.getFinalScore());

        dto.setRecommendation(result.getRecommendation());
        dto.setProcessedAt(result.getProcessedAt());

        return dto;
    }

    // =========================================================
    // UPDATE RESULT
    // =========================================================

    public ScreeningResult updateResult(ScreeningResult result) {
        return screeningResultRepository.save(result);
    }

    // =========================================================
    // DELETE RESULT BY ID
    // =========================================================

    public void deleteResult(Long resultId) {
        screeningResultRepository.deleteById(resultId);
    }

    // =========================================================
    // DELETE RESULT BY APPLICATION ID
    // =========================================================

    public void deleteByApplicationId(Long applicationId) {

        screeningResultRepository
                .findByApplicationId(applicationId)
                .ifPresent(screeningResultRepository::delete);
    }
}