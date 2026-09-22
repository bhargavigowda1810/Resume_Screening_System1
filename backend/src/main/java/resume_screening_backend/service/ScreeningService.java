package resume_screening_backend.service;

import org.springframework.stereotype.Service;

import resume_screening_backend.entity.Application;
import resume_screening_backend.entity.Education;
import resume_screening_backend.entity.Experience;
import resume_screening_backend.entity.Job;
import resume_screening_backend.entity.ResumeSkill;
import resume_screening_backend.entity.ScreeningResult;
import resume_screening_backend.entity.Skill;

import resume_screening_backend.repository.ApplicationRepository;
import resume_screening_backend.repository.EducationRepository;
import resume_screening_backend.repository.ExperienceRepository;
import resume_screening_backend.repository.JobRepository;
import resume_screening_backend.repository.ResumeJobMatchRepository.MatchResult;
import resume_screening_backend.repository.ResumeSkillRepository;
import resume_screening_backend.repository.ScreeningResultRepository;
import resume_screening_backend.repository.SkillRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
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

        Application application =
                applicationRepository.findById(applicationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Application not found: "
                                                + applicationId
                                ));

        Long resumeId = application.getResumeId();
        Long jobId = application.getJobId();

        Job job =
                jobRepository.findById(jobId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job not found: "
                                                + jobId
                                ));

        // -----------------------------------------------------
        // Semantic similarity
        // -----------------------------------------------------

        MatchResult match =
                resumeJobMatchService.findSimilarity(
                        resumeId,
                        jobId
                );

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
        // Skills score
        // -----------------------------------------------------

        double skillsScore =
                calculateSkillsScore(
                        resumeId,
                        job.getRequiredSkills()
                );

        // -----------------------------------------------------
        // Experience score
        // -----------------------------------------------------

        double experienceScore =
                calculateExperienceScore(
                        resumeId,
                        job.getMinimumExperience()
                );

        // -----------------------------------------------------
        // Education score
        // -----------------------------------------------------

        double educationScore =
                calculateEducationScore(
                        resumeId,
                        job.getEducationRequirement()
                );

        // -----------------------------------------------------
        // Final weighted score
        // -----------------------------------------------------

        double finalScore =
                (similarityScore * 0.40)
                        + (skillsScore * 0.30)
                        + (experienceScore * 0.20)
                        + (educationScore * 0.10);

        // -----------------------------------------------------
        // Recommendation
        // -----------------------------------------------------

        String recommendation =
                generateRecommendation(finalScore);

        // -----------------------------------------------------
        // Save result
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
                        normalize(
                                skill.get().getSkillName()
                        )
                );
            }
        }

        int matched = 0;

        for (String requiredSkill : required) {

            if (candidateSkills.contains(
                    normalize(requiredSkill)
            )) {

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

        if (minimumExperience == null
                || minimumExperience.doubleValue() <= 0) {
            return 100.0;
        }

        List<Experience> experiences =
                experienceRepository.findByResumeId(resumeId);

        if (experiences == null || experiences.isEmpty()) {
            return 0.0;
        }

        LocalDate today = LocalDate.now();

        // Store valid experience periods
        List<LocalDate[]> periods = new ArrayList<>();

        for (Experience experience : experiences) {

            if (experience == null) {
                continue;
            }

            LocalDate start = experience.getStartDate();
            LocalDate end = experience.getEndDate();

            if (start == null) {
                continue;
            }

            // Ongoing experience
            if (end == null) {
                end = today;
            }

            // Invalid date range
            if (end.isBefore(start)) {
                continue;
            }

            periods.add(new LocalDate[]{start, end});
        }

        if (periods.isEmpty()) {
            return 0.0;
        }

        // Sort periods by start date
        periods.sort((a, b) -> a[0].compareTo(b[0]));

        // Merge overlapping experience periods
        LocalDate currentStart = periods.get(0)[0];
        LocalDate currentEnd = periods.get(0)[1];

        long totalDays = 0;

        for (int i = 1; i < periods.size(); i++) {

            LocalDate nextStart = periods.get(i)[0];
            LocalDate nextEnd = periods.get(i)[1];

            // Overlapping or continuous experience
            if (!nextStart.isAfter(currentEnd)) {

                if (nextEnd.isAfter(currentEnd)) {
                    currentEnd = nextEnd;
                }

            } else {

                // Add completed period
                totalDays +=
                        java.time.temporal.ChronoUnit.DAYS
                                .between(currentStart, currentEnd);

                currentStart = nextStart;
                currentEnd = nextEnd;
            }
        }

        // Add final period
        totalDays +=
                java.time.temporal.ChronoUnit.DAYS
                        .between(currentStart, currentEnd);

        // Convert days to years
        double totalYears = totalDays / 365.25;

        double requiredYears =
                minimumExperience.doubleValue();

        // Meets or exceeds requirement
        if (totalYears >= requiredYears) {
            return 100.0;
        }

        // Partial experience score
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

        /*
         * If the job has no education requirement,
         * the candidate automatically gets 100%.
         */

        if (educationRequirement == null ||
                educationRequirement.isBlank()) {

            return 100.0;
        }

        /*
         * Get all education records stored for this resume.
         */

        List<Education> educations =
                educationRepository.findByResumeId(resumeId);

        if (educations == null ||
                educations.isEmpty()) {

            return 0.0;
        }

        /*
         * Convert different separators into '|'.
         *
         * Examples:
         *
         * BCA, MCA
         * BCA / MCA
         * BCA | MCA
         * BCA; MCA
         * Bachelor's or Master's
         *
         * All are treated as alternatives.
         */

        String normalizedRequirement =
                educationRequirement
                        .toLowerCase(Locale.ROOT)
                        .replaceAll("\\s+or\\s+", "|")
                        .replace("/", "|")
                        .replace(",", "|")
                        .replace(";", "|");

        String[] requirements =
                normalizedRequirement.split("\\|");

        /*
         * Compare every required degree against every
         * education record of the candidate.
         */

        for (String requirement : requirements) {

            String requiredDegree =
                    normalizeDegree(requirement);

            if (requiredDegree.isBlank()) {
                continue;
            }

            for (Education education : educations) {

                if (education == null) {
                    continue;
                }

                String candidateDegree =
                        normalizeDegree(
                                education.getDegree()
                        );

                if (candidateDegree.isBlank()) {
                    continue;
                }

                /*
                 * If any required education matches any
                 * candidate education, education score = 100%.
                 */

                if (isDegreeMatch(
                        candidateDegree,
                        requiredDegree
                )) {

                    return 100.0;
                }
            }
        }

        return 0.0;
    }

    // =========================================================
    // DEGREE MATCHING
    // =========================================================

    private boolean isDegreeMatch(
            String candidateDegree,
            String requiredDegree) {

        String candidate =
                canonicalDegree(candidateDegree);

        String required =
                canonicalDegree(requiredDegree);

        if (candidate.isBlank() ||
                required.isBlank()) {

            return false;
        }

        /*
         * -----------------------------------------------------
         * 1. Exact degree match
         * -----------------------------------------------------
         *
         * Examples:
         *
         * B.Tech -> B.Tech = MATCH
         * B.E.   -> B.E.   = MATCH
         * M.Tech -> M.Tech = MATCH
         * MCA    -> MCA    = MATCH
         *
         * But:
         *
         * B.Tech -> B.E. = NOT MATCH
         * BCA    -> B.Tech = NOT MATCH
         */

        if (candidate.equals(required)) {
            return true;
        }

        /*
         * -----------------------------------------------------
         * 2. Generic Bachelor's Degree requirement
         * -----------------------------------------------------
         *
         * Bachelor's Degree can be satisfied by:
         *
         * B.E.
         * B.Tech
         * BCA
         * B.Com
         * BBA
         * B.Sc
         * B.A.
         * etc.
         *
         * A postgraduate qualification is also accepted because
         * it is a higher qualification than a bachelor's degree.
         */

        if (required.equals("bachelor")) {

            return isUndergraduateDegree(candidate)
                    || isPostgraduateDegree(candidate);
        }

        /*
         * -----------------------------------------------------
         * 3. Generic Master's Degree requirement
         * -----------------------------------------------------
         *
         * Master's Degree can be satisfied by:
         *
         * M.Tech
         * M.E.
         * MCA
         * M.Com
         * MBA
         * M.Sc
         * etc.
         */

        if (required.equals("master")) {

            return isPostgraduateDegree(candidate);
        }

        /*
         * No match
         */

        return false;
    }

    // =========================================================
    // UNDERGRADUATE DEGREE
    // =========================================================

    private boolean isUndergraduateDegree(String degree) {

        if (degree == null ||
                degree.isBlank()) {

            return false;
        }

        return degree.equals("bca")
                || degree.equals("bcom")
                || degree.equals("bba")
                || degree.equals("bsc")
                || degree.equals("ba")
                || degree.equals("be")
                || degree.equals("btech")
                || degree.equals("bpharm")
                || degree.equals("bdes")
                || degree.equals("barch")
                || degree.equals("bed")
                || degree.equals("llb")
                || degree.equals("mbbs");
    }

    // =========================================================
    // POSTGRADUATE DEGREE
    // =========================================================

    private boolean isPostgraduateDegree(String degree) {

        if (degree == null ||
                degree.isBlank()) {

            return false;
        }

        return degree.equals("mca")
                || degree.equals("mcom")
                || degree.equals("mba")
                || degree.equals("msc")
                || degree.equals("ma")
                || degree.equals("me")
                || degree.equals("mtech")
                || degree.equals("mpharm")
                || degree.equals("mdes")
                || degree.equals("march")
                || degree.equals("med")
                || degree.equals("llm")
                || degree.equals("phd");
    }

    // =========================================================
    // CANONICAL DEGREE
    // =========================================================

    private String canonicalDegree(String degree) {

        if (degree == null) {
            return "";
        }

        String value =
                degree
                        .toLowerCase(Locale.ROOT)
                        .trim()
                        .replace("’", "'")
                        .replaceAll("[^a-z0-9]", "");

        // -----------------------------------------------------
        // BCA - Bachelor of Computer Applications
        // -----------------------------------------------------

        if (value.equals("bca")
                || value.equals("bachelorofcomputerapplications")
                || value.equals("bachelorofcomputerapplication")
                || value.equals("bachelorcomputerapplications")
                || value.equals("bachelorcomputerapplication")) {

            return "bca";
        }

        // -----------------------------------------------------
        // MCA - Master of Computer Applications
        // -----------------------------------------------------

        if (value.equals("mca")
                || value.equals("masterofcomputerapplications")
                || value.equals("masterofcomputerapplication")
                || value.equals("mastercomputerapplications")
                || value.equals("mastercomputerapplication")) {

            return "mca";
        }

        // -----------------------------------------------------
        // B.Com - Bachelor of Commerce
        // -----------------------------------------------------

        if (value.equals("bcom")
                || value.equals("bachelorofcommerce")
                || value.equals("bachelorcommerce")) {

            return "bcom";
        }

        // -----------------------------------------------------
        // M.Com - Master of Commerce
        // -----------------------------------------------------

        if (value.equals("mcom")
                || value.equals("masterofcommerce")
                || value.equals("mastercommerce")) {

            return "mcom";
        }

        // -----------------------------------------------------
        // B.E. - Bachelor of Engineering
        // -----------------------------------------------------

        if (value.equals("be")
                || value.equals("bachelorofengineering")
                || value.equals("bachelorengineering")) {

            return "be";
        }

        // -----------------------------------------------------
        // M.E. - Master of Engineering
        // -----------------------------------------------------

        if (value.equals("me")
                || value.equals("masterofengineering")
                || value.equals("masterengineering")) {

            return "me";
        }

        // -----------------------------------------------------
        // B.Tech - Bachelor of Technology
        // -----------------------------------------------------

        if (value.equals("btech")
                || value.equals("bacheloroftechnology")
                || value.equals("bachelortechnology")) {

            return "btech";
        }

        // -----------------------------------------------------
        // M.Tech - Master of Technology
        // -----------------------------------------------------

        if (value.equals("mtech")
                || value.equals("masteroftechnology")
                || value.equals("mastertechnology")) {

            return "mtech";
        }

        // -----------------------------------------------------
        // B.Sc - Bachelor of Science
        // -----------------------------------------------------

        if (value.equals("bsc")
                || value.equals("bachelorofscience")
                || value.equals("bachelorscience")) {

            return "bsc";
        }

        // -----------------------------------------------------
        // M.Sc - Master of Science
        // -----------------------------------------------------

        if (value.equals("msc")
                || value.equals("masterofscience")
                || value.equals("masterscience")) {

            return "msc";
        }

        // -----------------------------------------------------
        // B.A. - Bachelor of Arts
        // -----------------------------------------------------

        if (value.equals("ba")
                || value.equals("bachelorofarts")
                || value.equals("bachelorarts")) {

            return "ba";
        }

        // -----------------------------------------------------
        // M.A. - Master of Arts
        // -----------------------------------------------------

        if (value.equals("ma")
                || value.equals("masterofarts")
                || value.equals("masterarts")) {

            return "ma";
        }

        // -----------------------------------------------------
        // BBA - Bachelor of Business Administration
        // -----------------------------------------------------

        if (value.equals("bba")
                || value.equals("bachelorofbusinessadministration")
                || value.equals("bachelorbusinessadministration")) {

            return "bba";
        }

        // -----------------------------------------------------
        // MBA - Master of Business Administration
        // -----------------------------------------------------

        if (value.equals("mba")
                || value.equals("masterofbusinessadministration")
                || value.equals("masterbusinessadministration")) {

            return "mba";
        }

        // -----------------------------------------------------
        // LLB - Bachelor of Laws
        // -----------------------------------------------------

        if (value.equals("llb")
                || value.equals("bacheloroflaw")
                || value.equals("bacheloroflaws")
                || value.equals("bachelorlaws")) {

            return "llb";
        }

        // -----------------------------------------------------
        // LLM - Master of Laws
        // -----------------------------------------------------

        if (value.equals("llm")
                || value.equals("masteroflaw")
                || value.equals("masteroflaws")
                || value.equals("masterlaws")) {

            return "llm";
        }

        // -----------------------------------------------------
        // MBBS
        // -----------------------------------------------------

        if (value.equals("mbbs")
                || value.equals("bachelorofmedicine")
                || value.equals("bachelorofmedicineandbachelorsurgery")
                || value.equals("medicinebachelorsurgery")) {

            return "mbbs";
        }

        // -----------------------------------------------------
        // B.Pharm - Bachelor of Pharmacy
        // -----------------------------------------------------

        if (value.equals("bpharm")
                || value.equals("bachelorofpharmacy")
                || value.equals("bachelorpharmacy")) {

            return "bpharm";
        }

        // -----------------------------------------------------
        // M.Pharm - Master of Pharmacy
        // -----------------------------------------------------

        if (value.equals("mpharm")
                || value.equals("masterofpharmacy")
                || value.equals("masterpharmacy")) {

            return "mpharm";
        }

        // -----------------------------------------------------
        // B.Des - Bachelor of Design
        // -----------------------------------------------------

        if (value.equals("bdes")
                || value.equals("bachelorofdesign")
                || value.equals("bachelordesign")) {

            return "bdes";
        }

        // -----------------------------------------------------
        // M.Des - Master of Design
        // -----------------------------------------------------

        if (value.equals("mdes")
                || value.equals("masterofdesign")
                || value.equals("masterdesign")) {

            return "mdes";
        }

        // -----------------------------------------------------
        // B.Arch - Bachelor of Architecture
        // -----------------------------------------------------

        if (value.equals("barch")
                || value.equals("bachelorofarchitecture")
                || value.equals("bachelorarchitecture")) {

            return "barch";
        }

        // -----------------------------------------------------
        // M.Arch - Master of Architecture
        // -----------------------------------------------------

        if (value.equals("march")
                || value.equals("masterofarchitecture")
                || value.equals("masterarchitecture")) {

            return "march";
        }

        // -----------------------------------------------------
        // B.Ed - Bachelor of Education
        // -----------------------------------------------------

        if (value.equals("bed")
                || value.equals("bachelorofeducation")
                || value.equals("bacheloreducation")) {

            return "bed";
        }

        // -----------------------------------------------------
        // M.Ed - Master of Education
        // -----------------------------------------------------

        if (value.equals("med")
                || value.equals("masterofeducation")
                || value.equals("mastereducation")) {

            return "med";
        }

        // -----------------------------------------------------
        // PhD - Doctor of Philosophy
        // -----------------------------------------------------

        if (value.equals("phd")
                || value.equals("phddegree")
                || value.equals("doctorofphilosophy")
                || value.equals("doctorate")) {

            return "phd";
        }

        // -----------------------------------------------------
        // Diploma
        // -----------------------------------------------------

        if (value.equals("diploma")
                || value.equals("diplomaeducation")
                || value.contains("diplomain")) {

            return "diploma";
        }

        // -----------------------------------------------------
        // Generic Bachelor's Degree
        // -----------------------------------------------------

        if (value.equals("bachelor")
                || value.equals("bachelors")
                || value.equals("bachelorsdegree")
                || value.equals("bachelordegree")
                || value.equals("undergraduate")
                || value.equals("undergraduatedegree")
                || value.equals("ug")
                || value.equals("ugdegree")) {

            return "bachelor";
        }

        // -----------------------------------------------------
        // Generic Master's Degree
        // -----------------------------------------------------

        if (value.equals("master")
                || value.equals("masters")
                || value.equals("mastersdegree")
                || value.equals("masterdegree")
                || value.equals("postgraduate")
                || value.equals("postgraduatedegree")
                || value.equals("pg")
                || value.equals("pgdegree")) {

            return "master";
        }

        // -----------------------------------------------------
        // Return normalized value if no mapping exists
        // -----------------------------------------------------

        return value;
    }

    // =========================================================
    // NORMALIZE DEGREE
    // =========================================================

    private String normalizeDegree(String degree) {

        if (degree == null) {
            return "";
        }

        return degree
                .toLowerCase(Locale.ROOT)
                .trim()
                .replace("’", "'")
                .replaceAll("[^a-z0-9]", "");
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