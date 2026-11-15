
package resume_screening_backend.assistant;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.math.BigDecimal;
import java.util.Comparator;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import resume_screening_backend.dto.ChatResponse;
import resume_screening_backend.entity.User;
import resume_screening_backend.entity.Resume;
import resume_screening_backend.entity.Job;
import resume_screening_backend.entity.Application;
import resume_screening_backend.entity.ScreeningResult;
import resume_screening_backend.repository.UserRepository;
import resume_screening_backend.repository.ResumeRepository;
import resume_screening_backend.repository.JobRepository;
import resume_screening_backend.repository.ApplicationRepository;
import resume_screening_backend.repository.ScreeningResultRepository;

@Service
public class AssistantChatService {

    private final UserRepository userRepository;
private final ResumeRepository resumeRepository;
private final JobRepository jobRepository;
private final ApplicationRepository applicationRepository;
private final ScreeningResultRepository screeningResultRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public AssistantChatService(
        UserRepository userRepository,
        ResumeRepository resumeRepository,
        JobRepository jobRepository,
        ApplicationRepository applicationRepository,
        ScreeningResultRepository screeningResultRepository) {

    this.userRepository = userRepository;
    this.resumeRepository = resumeRepository;
    this.jobRepository = jobRepository;
    this.applicationRepository = applicationRepository;
    this.screeningResultRepository = screeningResultRepository;
}

    
private List<String> extractSkills(String resumeText) {

    List<String> knownSkills = List.of(
            "Java",
            "Python",
            "C++",
            "C",
            "JavaScript",
            "TypeScript",
            "HTML",
            "CSS",
            "React",
            "Node.js",
            "SQL",
            "MySQL",
            "PostgreSQL",
            "MongoDB",
            "Firebase",
            "Git",
            "GitHub",
            "AWS",
            "Docker",
            "Spring Boot",
            "Machine Learning",
            "TensorFlow",
            "PyTorch"
    );

    String text = resumeText.toLowerCase();

    return knownSkills.stream()
            .filter(skill -> {
                String pattern = "(?<![a-z0-9+#.])"
                        + java.util.regex.Pattern.quote(
                                skill.toLowerCase())
                        + "(?![a-z0-9+#.])";

                return java.util.regex.Pattern
                        .compile(pattern)
                        .matcher(text)
                        .find();
            })
            .collect(Collectors.toList());
}


private Map<String, Object> compareJobSkills(
        Job job,
        List<String> candidateSkills) {

    String requiredSkillsText = job.getRequiredSkills() == null
            ? ""
            : job.getRequiredSkills();

    List<String> requiredSkills = java.util.Arrays.stream(
                    requiredSkillsText.split("[,;]")
            )
            .map(String::trim)
            .filter(skill -> !skill.isBlank())
            .collect(Collectors.toList());

    List<String> matchedSkills = requiredSkills.stream()
            .filter(required ->
                    candidateSkills.stream().anyMatch(candidate ->
                            candidate.equalsIgnoreCase(required)))
            .collect(Collectors.toList());

    List<String> missingSkills = requiredSkills.stream()
            .filter(required ->
                    matchedSkills.stream().noneMatch(matched ->
                            matched.equalsIgnoreCase(required)))
            .collect(Collectors.toList());

    Map<String, Object> result = new java.util.HashMap<>();

    result.put("jobId", job.getJobId());
    result.put("title", job.getTitle());
    result.put("requiredSkills", requiredSkills);
    result.put("matchedSkills", matchedSkills);
    result.put("missingSkills", missingSkills);

    return result;
}



    public ChatResponse chat(String email, String message) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Map<String, Object> context;

        if ("APPLICANT".equalsIgnoreCase(user.getRole())) {

            // 1. Retrieve only the latest uploaded resume
            Resume latestResume = resumeRepository
                    .findTopByApplicantIdOrderByResumeIdDesc(
                            user.getUserId())
                    .orElse(null);

            String resumeText = "No extracted resume text available.";

            if (latestResume != null &&
                    latestResume.getExtractedText() != null &&
                    !latestResume.getExtractedText().isBlank()) {

                resumeText = latestResume.getExtractedText();
            }

            if (resumeText.length() > 10000) {
                resumeText = resumeText.substring(0, 10000);
            }

            // 2. Retrieve actual jobs from the database
            List<Job> jobs =
                    jobRepository.findAllByOrderByCreatedAtDesc();

// Retrieve only this applicant's applications
List<Application> applications =
        applicationRepository.findByApplicantId(user.getUserId());

// Prepare application details for the chatbot
List<Map<String, Object>> applicationDetails =
        new java.util.ArrayList<>();

for (Application application : applications) {

    Map<String, Object> applicationInfo = new HashMap<>();

    applicationInfo.put("applicationId",
            application.getApplicationId());

    applicationInfo.put("jobId",
            application.getJobId());

    applicationInfo.put("status",
            application.getStatus());

    Job appliedJob = jobRepository.findById(application.getJobId())
            .orElse(null);

    if (appliedJob != null) {
        applicationInfo.put("jobTitle", appliedJob.getTitle());
        applicationInfo.put("location", appliedJob.getLocation());
    }

    applicationDetails.add(applicationInfo);
}

            // 3. Prepare job information for the AI
            List<Map<String, Object>> jobDetails = jobs.stream()
                    .map(job -> Map.<String, Object>ofEntries(
                            Map.entry("jobId", job.getJobId()),
                            Map.entry("title", job.getTitle()),
                            Map.entry("description",
                                    job.getDescription() == null
                                            ? ""
                                            : job.getDescription()),
                            Map.entry("requiredSkills",
                                    job.getRequiredSkills() == null
                                            ? ""
                                            : job.getRequiredSkills()),
                            Map.entry("minimumExperience",
                                    job.getMinimumExperience() == null
                                            ? "Not specified"
                                            : job.getMinimumExperience()),
                            Map.entry("educationRequirement",
                                    job.getEducationRequirement() == null
                                            ? ""
                                            : job.getEducationRequirement()),
                            Map.entry("location",
                                    job.getLocation() == null
                                            ? ""
                                            : job.getLocation())
                    ))
                    .collect(Collectors.toList());



            // 4. Build applicant context
            context = Map.of(
        "name", user.getName(),
        "role", user.getRole(),
        "resumeText", resumeText,
        "availableJobRecords", jobDetails,
        "myApplications", applicationDetails
);

                        } else {

            // 1. Retrieve only jobs posted by this recruiter
            List<Job> recruiterJobs =
                    jobRepository.findByRecruiterId(user.getUserId());

            List<Map<String, Object>> jobDetails = new java.util.ArrayList<>();

            List<Map<String, Object>> candidateRecords =
                    new java.util.ArrayList<>();

            // 2. Retrieve applications for each recruiter's job
            for (Job job : recruiterJobs) {

                Map<String, Object> jobInfo = new HashMap<>();

                jobInfo.put("jobId", job.getJobId());
jobInfo.put("title", job.getTitle());
jobInfo.put("requiredSkills", job.getRequiredSkills());
jobInfo.put("location", job.getLocation());

List<Application> applications =
        applicationRepository.findByJobId(job.getJobId());

// Calculate actual applicant count
jobInfo.put("applicantCount", applications.size());

jobDetails.add(jobInfo);

                // 3. Retrieve candidate details and screening results
                for (Application application : applications) {

                    Map<String, Object> candidate = new HashMap<>();

                    candidate.put("applicationId",
                            application.getApplicationId());

                    candidate.put("jobId", job.getJobId());
                    candidate.put("jobTitle", job.getTitle());

                    candidate.put("applicationStatus",
                            application.getStatus());

                    // Applicant information
                    User applicant = userRepository
                            .findById(application.getApplicantId())
                            .orElse(null);

                    if (applicant != null) {
                        candidate.put("candidateName", applicant.getName());
                        candidate.put("candidateEmail", applicant.getEmail());
                    }

                    // Resume information
                    Resume resume = resumeRepository
                            .findById(application.getResumeId())
                            .orElse(null);

                    if (resume != null) {
                        candidate.put("resumeFileName",
                                resume.getFileName());
                    }

                    // Screening information
                    ScreeningResult screeningResult =
                            screeningResultRepository
                                    .findByApplicationId(
                                            application.getApplicationId())
                                    .orElse(null);

                    if (screeningResult != null) {

                        candidate.put("finalScore",
                                screeningResult.getFinalScore());

                        candidate.put("aiMatchingScore",
                                screeningResult.getAiMatchingScore());

                        candidate.put("skillsScore",
                                screeningResult.getSkillsScore());

                        candidate.put("experienceScore",
                                screeningResult.getExperienceScore());

                        candidate.put("educationScore",
                                screeningResult.getEducationScore());

                        candidate.put("recommendation",
                                screeningResult.getRecommendation());

                        candidate.put("aiMatchingResults",
        screeningResult.getAiMatchingResults() != null
                ? screeningResult.getAiMatchingResults().toString()
                : null);

                    } else {
                        candidate.put("screeningStatus",
                                "Not screened yet");
                    }

                    candidateRecords.add(candidate);
                }
            }

// 1. Sort candidates by final screening score (highest first)
candidateRecords.sort(
        Comparator.comparing(
                candidate -> (BigDecimal) candidate.get("finalScore"),
                Comparator.nullsLast(Comparator.reverseOrder())
        )
);

// 2. Prepare the top 5 screened candidates
List<Map<String, Object>> topRankedCandidates =
        new java.util.ArrayList<>();

int rank = 1;

// Prepare top 5 candidates by AI matching score
List<Map<String, Object>> topAiRankedCandidates =
        candidateRecords.stream()
                .filter(candidate ->
                        candidate.get("aiMatchingScore") != null)
                .sorted(Comparator.comparing(
                        candidate -> (BigDecimal)
                                candidate.get("aiMatchingScore"),
                        Comparator.reverseOrder()
                ))
                .limit(5)
                .map(candidate -> {
                    Map<String, Object> ranked = new HashMap<>();

                    ranked.put("candidateName",
                            candidate.get("candidateName"));
                    ranked.put("jobTitle",
                            candidate.get("jobTitle"));
                    ranked.put("aiMatchingScore",
                            candidate.get("aiMatchingScore"));
                    ranked.put("applicationStatus",
                            candidate.get("applicationStatus"));

                    return ranked;
                })
                .collect(Collectors.toList());

for (Map<String, Object> candidate : candidateRecords) {

    BigDecimal score = (BigDecimal) candidate.get("finalScore");

    // Exclude candidates without screening scores
    if (score == null) {
        continue;
    }

    if (rank > 5) {
        break;
    }

    Map<String, Object> rankedCandidate = new HashMap<>();

    rankedCandidate.put("rank", rank);
    rankedCandidate.put("candidateName",
            candidate.get("candidateName"));
    rankedCandidate.put("jobTitle",
            candidate.get("jobTitle"));
    rankedCandidate.put("finalScore", score);
    rankedCandidate.put("applicationStatus",
            candidate.get("applicationStatus"));
    rankedCandidate.put("resumeFileName",
            candidate.get("resumeFileName"));

    topRankedCandidates.add(rankedCandidate);

    rank++;
}

            // 4. Build recruiter context
            context = Map.of(
        "name", user.getName(),
        "role", user.getRole(),
        "recruiterJobs", jobDetails,
        "candidateRecords", candidateRecords,
        "topRankedCandidates", topRankedCandidates,
        "topAiRankedCandidates", topAiRankedCandidates
);
        }

        // 5. Prepare request for FastAPI
        Map<String, Object> payload = Map.of(
                "message", message,
                "context", context
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(payload, headers);

        ResponseEntity<Map> response =
                restTemplate.postForEntity(
                        aiServiceUrl + "/chat",
                        request,
                        Map.class
                );

        if (response.getBody() == null ||
                response.getBody().get("reply") == null) {

            throw new RuntimeException(
                    "AI service returned an empty response");
        }

        return new ChatResponse(
                response.getBody().get("reply").toString());
    }
}
