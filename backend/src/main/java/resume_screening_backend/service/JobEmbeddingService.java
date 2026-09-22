package resume_screening_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import resume_screening_backend.entity.Job;
import resume_screening_backend.entity.JobEmbedding;
import resume_screening_backend.repository.JobEmbeddingRepository;
import resume_screening_backend.repository.JobRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class JobEmbeddingService {

    private final JobEmbeddingRepository jobEmbeddingRepository;
    private final JobRepository jobRepository;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public JobEmbeddingService(
            JobEmbeddingRepository jobEmbeddingRepository,
            JobRepository jobRepository) {

        this.jobEmbeddingRepository = jobEmbeddingRepository;
        this.jobRepository = jobRepository;

        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    // ============================================================
    // SAVE EXISTING EMBEDDING
    // ============================================================

    public JobEmbedding saveEmbedding(JobEmbedding embedding) {
        return jobEmbeddingRepository.save(embedding);
    }

    // ============================================================
    // FIND BY EMBEDDING ID
    // ============================================================

    public Optional<JobEmbedding> findById(Long embeddingId) {
        return jobEmbeddingRepository.findById(embeddingId);
    }

    // ============================================================
    // FIND BY JOB ID
    // ============================================================

    public Optional<JobEmbedding> findByJobId(Long jobId) {
        return jobEmbeddingRepository.findByJobId(jobId);
    }

    // ============================================================
    // FIND ALL
    // ============================================================

    public List<JobEmbedding> findAllEmbeddings() {
        return jobEmbeddingRepository.findAll();
    }

    // ============================================================
    // UPDATE
    // ============================================================

    public JobEmbedding updateEmbedding(JobEmbedding embedding) {
        return jobEmbeddingRepository.save(embedding);
    }

    // ============================================================
    // DELETE BY EMBEDDING ID
    // ============================================================

    public void deleteEmbedding(Long embeddingId) {
        jobEmbeddingRepository.deleteById(embeddingId);
    }

    // ============================================================
    // DELETE BY JOB ID
    // ============================================================

    public void deleteByJobId(Long jobId) {

        jobEmbeddingRepository.findByJobId(jobId)
                .ifPresent(jobEmbeddingRepository::delete);
    }

    // ============================================================
    // GENERATE JOB EMBEDDING
    // ============================================================

    public JobEmbedding generateAndSaveJobEmbedding(Long jobId)
            throws Exception {

        // --------------------------------------------------------
        // 1. FIND JOB
        // --------------------------------------------------------

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Job not found with ID: " + jobId
                        )
                );

        // --------------------------------------------------------
        // 2. BUILD TEXT FOR EMBEDDING
        // --------------------------------------------------------

        StringBuilder jobText = new StringBuilder();

        jobText.append("Job Title: ")
                .append(job.getTitle())
                .append("\n");

        jobText.append("Job Description: ")
                .append(job.getDescription())
                .append("\n");

        if (job.getRequiredSkills() != null &&
                !job.getRequiredSkills().isBlank()) {

            jobText.append("Required Skills: ")
                    .append(job.getRequiredSkills())
                    .append("\n");
        }

        if (job.getMinimumExperience() != null) {

            jobText.append("Minimum Experience: ")
                    .append(job.getMinimumExperience())
                    .append(" years\n");
        }

        if (job.getEducationRequirement() != null &&
                !job.getEducationRequirement().isBlank()) {

            jobText.append("Education Requirement: ")
                    .append(job.getEducationRequirement())
                    .append("\n");
        }

        if (job.getLocation() != null &&
                !job.getLocation().isBlank()) {

            jobText.append("Location: ")
                    .append(job.getLocation());
        }

        // --------------------------------------------------------
        // 3. VALIDATE TEXT
        // --------------------------------------------------------

        String text = jobText.toString().trim();

        if (text.isBlank()) {

            throw new RuntimeException(
                    "Job does not contain enough information " +
                    "to generate an embedding."
            );
        }

        // --------------------------------------------------------
        // 4. CREATE REQUEST FOR FASTAPI
        // --------------------------------------------------------

        String url = aiServiceUrl + "/generate-embedding";

        String requestBody = objectMapper.writeValueAsString(
                new EmbeddingRequest(text)
        );

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );

        HttpEntity<String> request =
                new HttpEntity<>(requestBody, headers);

        // --------------------------------------------------------
        // 5. CALL FASTAPI
        // --------------------------------------------------------

        ResponseEntity<String> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        request,
                        String.class
                );

        // --------------------------------------------------------
        // 6. VALIDATE RESPONSE
        // --------------------------------------------------------

        if (!response.getStatusCode().is2xxSuccessful()) {

            throw new RuntimeException(
                    "AI service returned status: "
                            + response.getStatusCode()
            );
        }

        String responseBody = response.getBody();

        if (responseBody == null ||
                responseBody.isBlank()) {

            throw new RuntimeException(
                    "AI service returned an empty response."
            );
        }

        // --------------------------------------------------------
        // 7. PARSE EMBEDDING
        // --------------------------------------------------------

        JsonNode root =
                objectMapper.readTree(responseBody);

        JsonNode embeddingArray =
                root.path("embedding");

        if (!embeddingArray.isArray()) {

            throw new RuntimeException(
                    "AI service response does not contain " +
                    "a valid embedding."
            );
        }

        // --------------------------------------------------------
        // 8. VALIDATE 384 DIMENSIONS
        // --------------------------------------------------------

        if (embeddingArray.size() != 384) {

            throw new RuntimeException(
                    "Invalid embedding size. Expected 384 " +
                    "but received "
                            + embeddingArray.size()
            );
        }

        // --------------------------------------------------------
        // 9. CONVERT JSON ARRAY -> float[]
        // --------------------------------------------------------

        float[] embedding =
                new float[embeddingArray.size()];

        for (int i = 0;
             i < embeddingArray.size();
             i++) {

            JsonNode value =
                    embeddingArray.get(i);

            if (!value.isNumber()) {

                throw new RuntimeException(
                        "Invalid embedding value at index "
                                + i
                );
            }

            embedding[i] =
                    (float) value.asDouble();
        }

        // --------------------------------------------------------
        // 10. CHECK EXISTING JOB EMBEDDING
        // --------------------------------------------------------

        Optional<JobEmbedding> existing =
                jobEmbeddingRepository.findByJobId(jobId);

        JobEmbedding jobEmbedding;

        if (existing.isPresent()) {

            jobEmbedding = existing.get();

        } else {

            jobEmbedding = new JobEmbedding();

            jobEmbedding.setJobId(jobId);
        }

        // --------------------------------------------------------
        // 11. SET EMBEDDING
        // --------------------------------------------------------

        jobEmbedding.setEmbedding(embedding);

        jobEmbedding.setCreatedAt(
                LocalDateTime.now()
        );

        // --------------------------------------------------------
        // 12. SAVE TO DATABASE
        // --------------------------------------------------------

        return jobEmbeddingRepository.save(
                jobEmbedding
        );
    }

    // ============================================================
    // REQUEST DTO
    // ============================================================

    private record EmbeddingRequest(String text) {
    }
}