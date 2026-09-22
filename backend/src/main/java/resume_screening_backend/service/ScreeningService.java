package resume_screening_backend.service;

import org.springframework.stereotype.Service;

import resume_screening_backend.entity.Application;
import resume_screening_backend.entity.Education;
import resume_screening_backend.entity.Experience;
import resume_screening_backend.entity.Job;
import resume_screening_backend.entity.ScreeningResult;
import resume_screening_backend.entity.Skill;
import resume_screening_backend.entity.ResumeSkill;

import resume_screening_backend.repository.ApplicationRepository;
import resume_screening_backend.repository.EducationRepository;
import resume_screening_backend.repository.ExperienceRepository;
import resume_screening_backend.repository.JobRepository;
import resume_screening_backend.repository.ScreeningResultRepository;
import resume_screening_backend.repository.SkillRepository;
import resume_screening_backend.repository.ResumeSkillRepository;
import resume_screening_backend.repository.ResumeJobMatchRepository.MatchResult;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
public class ScreeningService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final ResumeJobMatchService resumeJobMatchService;
    private final ResumeSkillRepository resumeSkillRepository;
    private final SkillRepository skillRepository;
    private final ExperienceRepository experienceRepository;
    private final EducationRepository educationRepository;
    private final ScreeningResultRepository screeningResultRepository;

    public ScreeningService(
            ApplicationRepository applicationRepository,
            JobRepository jobRepository,
            ResumeJobMatchService resumeJobMatchService,
            ResumeSkillRepository resumeSkillRepository,
            SkillRepository skillRepository,
            ExperienceRepository experienceRepository,
            EducationRepository educationRepository,
            ScreeningResultRepository screeningResultRepository) {

        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.resumeJobMatchService = resumeJobMatchService;
        this.resumeSkillRepository = resumeSkillRepository;
        this.skillRepository = skillRepository;
        this.experienceRepository = experienceRepository;
        this.educationRepository = educationRepository;
        this.screeningResultRepository = screeningResultRepository;
    }

    // =========================================================
    // SCREEN ONE APPLICATION
    // =========================================================

    public ScreeningResult screenApplication(Long applicationId) {

        // -----------------------------------------------------
        // 1. Find application
        // -----------------------------------------------------

        Application application =
                applicationRepository.findById(applicationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Application not found: "
                                                + applicationId
                                ));

        Long resumeId = application.getResumeId();
        Long jobId = application.getJobId();

        // -----------------------------------------------------
        // 2. Find job
        // -----------------------------------------------------

        Job job =
                jobRepository.findById(jobId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job not found: "
                                                + jobId
                                ));

        // -----------------------------------------------------
        // 3. Semantic similarity
        // -----------------------------------------------------

        MatchResult match =
            resumeJobMatchService.findSimilarity(resumeId, jobId);

        if (match == null ||
                match.getSimilarity() == null) {

            throw new RuntimeException(
                    "Resume/job embeddings not found for "
                            + "resumeId=" + resumeId
                            + ", jobId=" + jobId
            );
        }

        double similarityScore =
                normalizeSimilarity(
                        match.getSimilarity()
                );

        // -----------------------------------------------------
        // 4. Skills score
        // -----------------------------------------------------

        double skillsScore =
                calculateSkillsScore(
                        resumeId,
                        job.getRequiredSkills()
                );

        // -----------------------------------------------------
        // 5. Experience score
        // -----------------------------------------------------

        double experienceScore =
                calculateExperienceScore(
                        resumeId,
                        job.getMinimumExperience()
                );

        // -----------------------------------------------------
        // 6. Education score
        // -----------------------------------------------------

        double educationScore =
                calculateEducationScore(
                        resumeId,
                        job.getEducationRequirement()
                );

        // -----------------------------------------------------
        // 7. Final weighted score
        // -----------------------------------------------------

        double finalScore =
                (similarityScore * 0.40)
                        + (skillsScore * 0.30)
                        + (experienceScore * 0.20)
                        + (educationScore * 0.10);

        // -----------------------------------------------------
        // 8. Recommendation
        // -----------------------------------------------------

        String recommendation =
                generateRecommendation(finalScore);

        // -----------------------------------------------------
        // 9. Save result
        // -----------------------------------------------------

        ScreeningResult result =
                screeningResultRepository
                        .findByApplicationId(applicationId)
                        .orElse(new ScreeningResult());

        result.setApplicationId(applicationId);

        result.setSimilarityScore(
                toBigDecimal(similarityScore)
        );

        result.setSkillsScore(
                toBigDecimal(skillsScore)
        );

        result.setExperienceScore(
                toBigDecimal(experienceScore)
        );

        result.setEducationScore(
                toBigDecimal(educationScore)
        );

        result.setFinalScore(
                toBigDecimal(finalScore)
        );

        result.setRecommendation(
                recommendation
        );

        result.setProcessedAt(
                LocalDateTime.now()
        );

        return screeningResultRepository.save(result);
    }

    // =========================================================
    // SEMANTIC SIMILARITY
    // =========================================================

    private double normalizeSimilarity(double similarity) {

        /*
         * pgvector cosine distance is converted in the repository
         * using:
         *
         * 1 - (resume_embedding <=> job_embedding)
         *
         * This produces cosine similarity.
         *
         * We convert it to a 0-100 score.
         */

        double score = similarity * 100.0;

        return clamp(score, 0.0, 100.0);
    }

    // =========================================================
    // SKILLS SCORE
    // =========================================================

    private double calculateSkillsScore(
            Long resumeId,
            String requiredSkills) {

        if (requiredSkills == null ||
                requiredSkills.isBlank()) {

            return 100.0;
        }

        List<String> required =
                parseSkills(requiredSkills);

        if (required.isEmpty()) {
            return 100.0;
        }

        List<ResumeSkill> resumeSkills =
                resumeSkillRepository
                        .findByIdResumeId(resumeId);

        Set<String> candidateSkills =
                new HashSet<>();

        for (ResumeSkill resumeSkill : resumeSkills) {

            Long skillId =
                    resumeSkill.getId().getSkillId();

            Optional<Skill> skill =
                    skillRepository.findById(skillId);

            if (skill.isPresent() &&
                    skill.get().getSkillName() != null) {

                candidateSkills.add(
                        normalize(skill.get().getSkillName())
                );
            }
        }

        int matched = 0;

        for (String requiredSkill : required) {

            if (candidateSkills.contains(
                    normalize(requiredSkill))) {

                matched++;
            }
        }

        return ((double) matched / required.size()) * 100.0;
    }

    // =========================================================
    // EXPERIENCE SCORE
    // =========================================================

    private double calculateExperienceScore(
            Long resumeId,
            BigDecimal minimumExperience) {

        if (minimumExperience == null ||
                minimumExperience.doubleValue() <= 0) {

            return 100.0;
        }

        List<Experience> experiences =
                experienceRepository
                        .findByResumeId(resumeId);

        if (experiences.isEmpty()) {
            return 0.0;
        }

        double totalYears = 0.0;

        for (Experience experience : experiences) {

            LocalDate start =
                    experience.getStartDate();

            LocalDate end =
                    experience.getEndDate();

            if (start == null) {
                continue;
            }

            if (end == null) {
                end = LocalDate.now();
            }

            if (end.isBefore(start)) {
                continue;
            }

            Period period =
                    Period.between(start, end);

            totalYears +=
                    period.getYears()
                            + (period.getMonths() / 12.0)
                            + (period.getDays() / 365.0);
        }

        double requiredYears =
                minimumExperience.doubleValue();

        if (totalYears >= requiredYears) {
            return 100.0;
        }

        return clamp(
                (totalYears / requiredYears) * 100.0,
                0.0,
                100.0
        );
    }

    // =========================================================
    // EDUCATION SCORE
    // =========================================================

private double calculateEducationScore(
        Long resumeId,
        String educationRequirement) {

    if (educationRequirement == null ||
            educationRequirement.isBlank()) {

        return 100.0;
    }

    List<Education> educations =
            educationRepository
                    .findByResumeId(resumeId);

    if (educations.isEmpty()) {
        return 0.0;
    }

    String requirement =
            normalize(educationRequirement);

    // -----------------------------------------------------
    // Determine minimum required education level
    // -----------------------------------------------------

    int requiredLevel = 0;

    if (requirement.contains("phd")
            || requirement.contains("doctorate")
            || requirement.contains("doctoral")) {

        requiredLevel = 3;

    } else if (requirement.contains("master")
            || requirement.contains("mca")
            || requirement.contains("msc")
            || requirement.contains("mtech")
            || requirement.contains("mba")
            || requirement.contains("postgraduate")
            || requirement.contains("post graduate")) {

        requiredLevel = 2;

    } else if (requirement.contains("bachelor")
            || requirement.contains("bca")
            || requirement.contains("bsc")
            || requirement.contains("btech")
            || requirement.contains("be")
            || requirement.contains("ba")
            || requirement.contains("undergraduate")
            || requirement.contains("under graduate")) {

        requiredLevel = 1;
    }

    // -----------------------------------------------------
    // Check candidate education
    // -----------------------------------------------------

    for (Education education : educations) {

        String degree =
                normalize(education.getDegree());

        String field =
                normalize(education.getFieldOfStudy());

        String combined =
                degree + " " + field;

        int candidateLevel = 0;

        // PhD
        if (combined.contains("phd")
                || combined.contains("doctorate")
                || combined.contains("doctoral")) {

            candidateLevel = 3;

        // Master's
        } else if (combined.contains("master")
                || combined.contains("mca")
                || combined.contains("msc")
                || combined.contains("mtech")
                || combined.contains("mba")
                || combined.contains("postgraduate")
                || combined.contains("post graduate")) {

            candidateLevel = 2;

        // Bachelor's
        } else if (combined.contains("bachelor")
                || combined.contains("bca")
                || combined.contains("bsc")
                || combined.contains("btech")
                || combined.contains("be")
                || combined.contains("ba")
                || combined.contains("undergraduate")
                || combined.contains("under graduate")) {

            candidateLevel = 1;
        }

        // -------------------------------------------------
        // Higher qualification satisfies lower requirement
        // -------------------------------------------------

        if (candidateLevel >= requiredLevel
                && requiredLevel > 0) {

            return 100.0;
        }

        // -------------------------------------------------
        // Fallback exact matching
        // -------------------------------------------------

        if (combined.contains(requirement)
                || (!degree.isBlank()
                && requirement.contains(degree))) {

            return 100.0;
        }
    }

    return 0.0;
}

    // =========================================================
    // RECOMMENDATION
    // =========================================================

    private String generateRecommendation(
            double finalScore) {

        if (finalScore >= 80.0) {
            return "STRONG_MATCH";
        }

        if (finalScore >= 60.0) {
            return "GOOD_MATCH";
        }

        if (finalScore >= 40.0) {
            return "PARTIAL_MATCH";
        }

        return "LOW_MATCH";
    }

    // =========================================================
    // PARSE REQUIRED SKILLS
    // =========================================================

    private List<String> parseSkills(
            String requiredSkills) {

        List<String> skills =
                new ArrayList<>();

        String[] parts =
                requiredSkills.split(",");

        for (String part : parts) {

            String skill =
                    part.trim();

            if (!skill.isBlank()) {
                skills.add(skill);
            }
        }

        return skills;
    }

    // =========================================================
    // NORMALIZE TEXT
    // =========================================================

    private String normalize(String text) {

        if (text == null) {
            return "";
        }

        return text
                .trim()
                .toLowerCase(Locale.ROOT);
    }

    // =========================================================
    // CLAMP SCORE
    // =========================================================

    private double clamp(
            double value,
            double min,
            double max) {

        return Math.max(
                min,
                Math.min(max, value)
        );
    }

    // =========================================================
    // BIG DECIMAL
    // =========================================================

    private BigDecimal toBigDecimal(
            double value) {

        return BigDecimal
                .valueOf(value)
                .setScale(
                        2,
                        RoundingMode.HALF_UP
                );
    }
}