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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import resume_screening_backend.repository.ResumeProfileRepository;

@Service
public class ScreeningService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final AiResumeService aiResumeService;
    private final ResumeProfileRepository resumeProfileRepository;
    private final ObjectMapper objectMapper;
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
            AiResumeService aiResumeService,
            ResumeProfileRepository resumeProfileRepository,
            ObjectMapper objectMapper,
            ScreeningResultRepository screeningResultRepository) {

        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.resumeJobMatchService = resumeJobMatchService;
        this.resumeSkillRepository = resumeSkillRepository;
        this.skillRepository = skillRepository;
        this.experienceRepository = experienceRepository;
        this.educationRepository = educationRepository;
        this.aiResumeService = aiResumeService;
        this.resumeProfileRepository = resumeProfileRepository;
        this.objectMapper = objectMapper;
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
        System.out.println("APPLICATION ID: " + application.getApplicationId());
System.out.println("APPLICATION RESUME ID: " + application.getResumeId());
        System.out.println(
    "[SCREENING DEBUG] Application ID: "
    + applicationId
    + ", Applicant ID: "
    + application.getApplicantId()
    + ", Resume ID: "
    + resumeId
);
        Long jobId = application.getJobId();

        Job job =
                jobRepository.findById(jobId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job not found: "
                                                + jobId
                                ));

// -----------------------------------------------------
// AI-BASED REQUIREMENT MATCHING
// -----------------------------------------------------

JsonNode aiMatchingResult =
        performAiMatching(resumeId, job);

System.out.println("========== AI MATCHING RESULT ==========");
System.out.println(aiMatchingResult.toPrettyString());
System.out.println("========================================");






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

// -----------------------------------------------------
// Save AI Matching Result
// -----------------------------------------------------

if (aiMatchingResult != null && !aiMatchingResult.isNull()) {

    JsonNode aiScoreNode =
            aiMatchingResult.path("score").path("score");

    if (aiScoreNode.isNumber()) {
        result.setAiMatchingScore(
                toBigDecimal(aiScoreNode.asDouble())
        );
    }

    result.setAiMatchingResults(aiMatchingResult);
}

return screeningResultRepository.save(result);
    }


// =========================================================
// AI-BASED RESUME MATCHING
// =========================================================

private JsonNode performAiMatching(Long resumeId, Job job) {

    try {

        ObjectNode parsedResume = objectMapper.createObjectNode();

        // 1. Extract skills
        ArrayNode skillsArray = objectMapper.createArrayNode();

        List<ResumeSkill> resumeSkills =
                resumeSkillRepository.findByIdResumeId(resumeId);

        for (ResumeSkill resumeSkill : resumeSkills) {

            Long skillId = resumeSkill.getId().getSkillId();

            skillRepository.findById(skillId).ifPresent(skill -> {
                if (skill.getSkillName() != null) {
                    skillsArray.add(skill.getSkillName());
                }
            });
        }

        parsedResume.set("skills", skillsArray);

        // 2. Extract education
        ArrayNode educationArray = objectMapper.createArrayNode();

        List<Education> educations =
                educationRepository.findByResumeId(resumeId);

        for (Education education : educations) {

            ObjectNode item = objectMapper.createObjectNode();

            item.put("degree",
                    education.getDegree() == null ? "" : education.getDegree());

            item.put("institution",
                    education.getInstitution() == null ? "" : education.getInstitution());

            item.put("fieldOfStudy",
                    education.getFieldOfStudy() == null ? "" : education.getFieldOfStudy());

            educationArray.add(item);
        }

        parsedResume.set("education", educationArray);

        // 3. Extract experience
        ArrayNode experienceArray = objectMapper.createArrayNode();

        List<Experience> experiences =
                experienceRepository.findByResumeId(resumeId);

        for (Experience experience : experiences) {

            ObjectNode item = objectMapper.createObjectNode();

            item.put("company",
                    experience.getCompany() == null ? "" : experience.getCompany());

            item.put("jobTitle",
                    experience.getJobTitle() == null ? "" : experience.getJobTitle());

            item.put("description",
                    experience.getDescription() == null ? "" : experience.getDescription());

            experienceArray.add(item);
        }

        parsedResume.set("experience", experienceArray);

        // 4. Extract projects and certifications
        var profileOptional =
                resumeProfileRepository.findByResumeId(resumeId);

        if (profileOptional.isPresent()) {

            var profile = profileOptional.get();

            parsedResume.set(
                    "projects",
                    profile.getProjects() == null
                            ? objectMapper.createArrayNode()
                            : profile.getProjects()
            );

            parsedResume.set(
                    "certifications",
                    profile.getCertifications() == null
                            ? objectMapper.createArrayNode()
                            : profile.getCertifications()
            );

        } else {

            parsedResume.set("projects", objectMapper.createArrayNode());
            parsedResume.set("certifications", objectMapper.createArrayNode());
        }

        // 5. Prepare job requirements
        List<String> requirements = new ArrayList<>();

        if (job.getRequiredSkills() != null) {

            for (String skill : job.getRequiredSkills().split(",")) {

                if (!skill.isBlank()) {
                    requirements.add(skill.trim());
                }
            }
        }

        if (job.getEducationRequirement() != null
                && !job.getEducationRequirement().isBlank()) {

            requirements.add(job.getEducationRequirement());
        }

        if (requirements.isEmpty()) {
            throw new RuntimeException(
                    "No job requirements available for AI matching."
            );
        }

        // 6. Prepare job description with required section
        String jobDescription =
                job.getTitle()
                + "\n\nRequired:\n"
                + job.getRequiredSkills()
                + "\n\n"
                + job.getDescription();
                System.out.println("RESUME ID USED FOR AI MATCHING: " + resumeId);
System.out.println("========== PREPARED RESUME DATA ==========");
System.out.println(parsedResume.toPrettyString());
System.out.println("==========================================");

        // 7. Call Python AI service
        return aiResumeService.matchResumeWithAI(
                parsedResume,
                requirements,
                jobDescription
        );

    } catch (Exception e) {

        throw new RuntimeException(
                "AI resume matching failed: " + e.getMessage(),
                e
        );
    }
}


    // =========================================================
    // SCREEN ALL APPLICATIONS FOR A JOB
    // =========================================================

    public List<ScreeningResult> screenApplicationsForJob(Long jobId) {

        // Verify that the job exists
        jobRepository.findById(jobId)
                .orElseThrow(() ->
                        new RuntimeException("Job not found: " + jobId));

        // Retrieve all applications for this job
        List<Application> applications =
                applicationRepository.findByJobId(jobId);

        if (applications == null || applications.isEmpty()) {
            throw new RuntimeException(
                    "No applications found for job: " + jobId);
        }

        List<ScreeningResult> results = new ArrayList<>();

        // Reuse the existing screening logic for every application
        for (Application application : applications) {
            ScreeningResult result =
                    screenApplication(application.getApplicationId());

            results.add(result);
        }

        return results;
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

System.out.println(
        "[EDUCATION DEBUG] Resume ID: " + resumeId
        + ", Stored degree: " + education.getDegree()
        + ", Normalized candidate: " + candidateDegree
        + ", Requirement: " + educationRequirement
);

                if (candidateDegree.isBlank()) {
                    continue;
                }

                /*
                 * If any required education matches any
                 * candidate education, education score = 100%.
                 */

             System.out.println(
        "[EDUCATION DEBUG] Comparing candidate="
        + candidateDegree
        + ", required=" + requiredDegree
        + ", match=" + isDegreeMatch(
                candidateDegree,
                requiredDegree
        )
);

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

   
private String canonicalDegree(String degree) {

    if (degree == null || degree.isBlank()) {
        return "";
    }

    String value = degree
            .toLowerCase(Locale.ROOT)
            .trim()
            .replace("â€™", "'")
            .replaceAll("[^a-z0-9]", "");

    // Exact abbreviations and generic degree labels
    switch (value) {
        case "bca":
            return "bca";
        case "mca":
            return "mca";
        case "bcom":
            return "bcom";
        case "mcom":
            return "mcom";
        case "be":
            return "be";
        case "me":
            return "me";
        case "btech":
            return "btech";
        case "mtech":
            return "mtech";
        case "bsc":
            return "bsc";
        case "msc":
            return "msc";
        case "ba":
            return "ba";
        case "ma":
            return "ma";
        case "bba":
            return "bba";
        case "mba":
            return "mba";
        case "llb":
            return "llb";
        case "llm":
            return "llm";
        case "mbbs":
            return "mbbs";
        case "bpharm":
            return "bpharm";
        case "mpharm":
            return "mpharm";
        case "bdes":
            return "bdes";
        case "mdes":
            return "mdes";
        case "barch":
            return "barch";
        case "march":
            return "march";
        case "bed":
            return "bed";
        case "med":
            return "med";
        case "phd":
        case "phddegree":
        case "doctorate":
            return "phd";
        case "bachelor":
        case "bachelors":
        case "bachelorsdegree":
        case "bachelordegree":
        case "undergraduate":
        case "undergraduatedegree":
        case "ug":
        case "ugdegree":
            return "bachelor";
        case "master":
        case "masters":
        case "mastersdegree":
        case "masterdegree":
        case "postgraduate":
        case "postgraduatedegree":
        case "pg":
        case "pgdegree":
            return "master";
    }

    // Degrees with optional specialization suffixes
    if (value.startsWith("bachelorofcomputerapplication")
            || value.startsWith("bachelorcomputerapplication")) {
        return "bca";
    }

    if (value.startsWith("masterofcomputerapplication")
            || value.startsWith("mastercomputerapplication")) {
        return "mca";
    }

    if (value.startsWith("bachelorofcommerce")
            || value.startsWith("bachelorcommerce")) {
        return "bcom";
    }

    if (value.startsWith("masterofcommerce")
            || value.startsWith("mastercommerce")) {
        return "mcom";
    }

    if (value.startsWith("bachelorofengineering")
            || value.startsWith("bachelorengineering")) {
        return "be";
    }

    if (value.startsWith("masterofengineering")
            || value.startsWith("masterengineering")) {
        return "me";
    }

    if (value.startsWith("bacheloroftechnology")
            || value.startsWith("bachelortechnology")) {
        return "btech";
    }

    if (value.startsWith("masteroftechnology")
            || value.startsWith("mastertechnology")) {
        return "mtech";
    }

    if (value.startsWith("bachelorofscience")
            || value.startsWith("bachelorscience")) {
        return "bsc";
    }

    if (value.startsWith("masterofscience")
            || value.startsWith("masterscience")) {
        return "msc";
    }

    if (value.startsWith("bachelorofarts")
            || value.startsWith("bachelorarts")) {
        return "ba";
    }

    if (value.startsWith("masterofarts")
            || value.startsWith("masterarts")) {
        return "ma";
    }

    if (value.startsWith("bachelorofbusinessadministration")
            || value.startsWith("bachelorbusinessadministration")) {
        return "bba";
    }

    if (value.startsWith("masterofbusinessadministration")
            || value.startsWith("masterbusinessadministration")) {
        return "mba";
    }

    if (value.startsWith("bacheloroflaw")
            || value.startsWith("bacheloroflaws")
            || value.startsWith("bachelorlaws")) {
        return "llb";
    }

    if (value.startsWith("masteroflaw")
            || value.startsWith("masteroflaws")
            || value.startsWith("masterlaws")) {
        return "llm";
    }

    if (value.startsWith("bachelorofmedicine")
            || value.startsWith("medicinebachelorsurgery")) {
        return "mbbs";
    }

    if (value.startsWith("bachelorofpharmacy")
            || value.startsWith("bachelorpharmacy")) {
        return "bpharm";
    }

    if (value.startsWith("masterofpharmacy")
            || value.startsWith("masterpharmacy")) {
        return "mpharm";
    }

    if (value.startsWith("bachelorofdesign")
            || value.startsWith("bachelordesign")) {
        return "bdes";
    }

    if (value.startsWith("masterofdesign")
            || value.startsWith("masterdesign")) {
        return "mdes";
    }

    if (value.startsWith("bachelorofarchitecture")
            || value.startsWith("bachelorarchitecture")) {
        return "barch";
    }

    if (value.startsWith("masterofarchitecture")
            || value.startsWith("masterarchitecture")) {
        return "march";
    }

    if (value.startsWith("bachelorofeducation")
            || value.startsWith("bacheloreducation")) {
        return "bed";
    }

    if (value.startsWith("masterofeducation")
            || value.startsWith("mastereducation")) {
        return "med";
    }

    if (value.startsWith("doctorofphilosophy")) {
        return "phd";
    }

    if (value.equals("diploma")
            || value.equals("diplomaeducation")
            || value.startsWith("diplomain")) {
        return "diploma";
    }

    return value;
}

private boolean isUndergraduateDegree(String degree) {
    if (degree == null || degree.isBlank()) {
        return false;
    }

    String value = canonicalDegree(degree);

    return value.equals("bachelor")
            || value.equals("bca")
            || value.equals("bcom")
            || value.equals("be")
            || value.equals("btech")
            || value.equals("bsc")
            || value.equals("ba")
            || value.equals("bba")
            || value.equals("llb")
            || value.equals("mbbs")
            || value.equals("bpharm")
            || value.equals("bdes")
            || value.equals("barch")
            || value.equals("bed")
            || value.equals("diploma");
}

private boolean isPostgraduateDegree(String degree) {
    if (degree == null || degree.isBlank()) {
        return false;
    }

    String value = canonicalDegree(degree);

    return value.equals("master")
            || value.equals("mca")
            || value.equals("mcom")
            || value.equals("me")
            || value.equals("mtech")
            || value.equals("msc")
            || value.equals("ma")
            || value.equals("mba")
            || value.equals("llm")
            || value.equals("mpharm")
            || value.equals("mdes")
            || value.equals("march")
            || value.equals("med")
            || value.equals("phd");
}

    // =========================================================
    // NORMALIZE DEGREE
    // =========================================================
private String normalizeDegree(String degree) {

    if (degree == null || degree.isBlank()) {
        return "";
    }

    return canonicalDegree(degree);
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