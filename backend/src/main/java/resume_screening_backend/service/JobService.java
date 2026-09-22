package resume_screening_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
public class JobService {

    private final JobRepository jobRepository;
    private final JobEmbeddingRepository jobEmbeddingRepository;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public JobService(
            JobRepository jobRepository,
            JobEmbeddingRepository jobEmbeddingRepository) {

        this.jobRepository = jobRepository;
        this.jobEmbeddingRepository = jobEmbeddingRepository;

        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    // =========================================================
    // CREATE JOB
    // =========================================================

    public Job createJob(Job job) {

        // -----------------------------------------------------
        // 1. Save job first
        // -----------------------------------------------------

        Job savedJob = jobRepository.save(job);

        // -----------------------------------------------------
        // 2. Build text for embedding
        // -----------------------------------------------------

        String jobText = buildJobText(savedJob);

        // -----------------------------------------------------
        // 3. Generate embedding using FastAPI
        // -----------------------------------------------------

        float[] embedding = generateJobEmbedding(jobText);

        // -----------------------------------------------------
        // 4. Save embedding directly as float[]
        // -----------------------------------------------------
        // Hibernate Vector + PostgreSQL pgvector handles the
        // conversion from float[] to vector(384).

        JobEmbedding jobEmbedding = new JobEmbedding();

        jobEmbedding.setJobId(savedJob.getJobId());
        jobEmbedding.setEmbedding(embedding);
        jobEmbedding.setCreatedAt(LocalDateTime.now());

        jobEmbeddingRepository.save(jobEmbedding);

        return savedJob;
    }

    // =========================================================
    // GET JOB BY ID
    // =========================================================

    public Optional<Job> findById(Long jobId) {

        return jobRepository.findById(jobId);
    }

    // =========================================================
    // GET ALL JOBS
    // =========================================================

    public List<Job> findAllJobs() {

        return jobRepository.findAll();
    }

    // =========================================================
    // GET JOBS BY RECRUITER
    // =========================================================

    public List<Job> findByRecruiterId(Long recruiterId) {

        return jobRepository.findByRecruiterId(recruiterId);
    }

    // =========================================================
    // UPDATE JOB
    // =========================================================

    public Job updateJob(Job job) {

        // -----------------------------------------------------
        // 1. Update job
        // -----------------------------------------------------

        Job updatedJob = jobRepository.save(job);

        // -----------------------------------------------------
        // 2. Build new embedding text
        // -----------------------------------------------------

        String jobText = buildJobText(updatedJob);

        // -----------------------------------------------------
        // 3. Generate new embedding
        // -----------------------------------------------------

        float[] embedding = generateJobEmbedding(jobText);

        // -----------------------------------------------------
        // 4. Find existing embedding
        // -----------------------------------------------------

        Optional<JobEmbedding> existingEmbedding =
                jobEmbeddingRepository.findByJobId(
                        updatedJob.getJobId()
                );

        JobEmbedding jobEmbedding;

        if (existingEmbedding.isPresent()) {

            jobEmbedding = existingEmbedding.get();

        } else {

            jobEmbedding = new JobEmbedding();

            jobEmbedding.setJobId(
                    updatedJob.getJobId()
            );
        }

        // -----------------------------------------------------
        // 5. Save new embedding directly as float[]
        // -----------------------------------------------------

        jobEmbedding.setEmbedding(embedding);
        jobEmbedding.setCreatedAt(LocalDateTime.now());

        jobEmbeddingRepository.save(jobEmbedding);

        return updatedJob;
    }

    // =========================================================
    // DELETE JOB
    // =========================================================

    public void deleteJob(Long jobId) {

        /*
         * job_embeddings has a foreign key to jobs
         * with ON DELETE CASCADE.
         *
         * Therefore deleting the job also deletes
         * the corresponding job embedding.
         */

        jobRepository.deleteById(jobId);
    }

    // =========================================================
    // BUILD JOB TEXT
    // =========================================================

    private String buildJobText(Job job) {

        StringBuilder text = new StringBuilder();

        // -----------------------------------------------------
        // Job title
        // -----------------------------------------------------

        if (job.getTitle() != null &&
                !job.getTitle().isBlank()) {

            text.append("Job Title: ")
                    .append(job.getTitle())
                    .append("\n");
        }

        // -----------------------------------------------------
        // Job description
        // -----------------------------------------------------

        if (job.getDescription() != null &&
                !job.getDescription().isBlank()) {

            text.append("Job Description: ")
                    .append(job.getDescription())
                    .append("\n");
        }

        // -----------------------------------------------------
        // Required skills
        // -----------------------------------------------------

        if (job.getRequiredSkills() != null &&
                !job.getRequiredSkills().isBlank()) {

            text.append("Required Skills: ")
                    .append(job.getRequiredSkills())
                    .append("\n");
        }

        // -----------------------------------------------------
        // Minimum experience
        // -----------------------------------------------------

        if (job.getMinimumExperience() != null) {

            text.append("Minimum Experience: ")
                    .append(job.getMinimumExperience())
                    .append(" years\n");
        }

        // -----------------------------------------------------
        // Education requirement
        // -----------------------------------------------------

        if (job.getEducationRequirement() != null &&
                !job.getEducationRequirement().isBlank()) {

            text.append("Education Requirement: ")
                    .append(job.getEducationRequirement())
                    .append("\n");
        }

        // -----------------------------------------------------
        // Location
        // -----------------------------------------------------

        if (job.getLocation() != null &&
                !job.getLocation().isBlank()) {

            text.append("Location: ")
                    .append(job.getLocation())
                    .append("\n");
        }

        return text.toString().trim();
    }

    // =========================================================
    // CALL FASTAPI FOR JOB EMBEDDING
    // =========================================================

    private float[] generateJobEmbedding(String jobText) {

        try {

            // -------------------------------------------------
            // Validate text
            // -------------------------------------------------

            if (jobText == null ||
                    jobText.isBlank()) {

                throw new RuntimeException(
                        "Job text cannot be empty."
                );
            }

            // -------------------------------------------------
            // Create JSON request
            // -------------------------------------------------

            String requestBody =
                    objectMapper.writeValueAsString(
                            new EmbeddingRequest(jobText)
                    );

            // -------------------------------------------------
            // HTTP headers
            // -------------------------------------------------

            HttpHeaders headers = new HttpHeaders();

            headers.setContentType(
                    MediaType.APPLICATION_JSON
            );

            // -------------------------------------------------
            // Create HTTP request
            // -------------------------------------------------

            HttpEntity<String> request =
                    new HttpEntity<>(
                            requestBody,
                            headers
                    );

            String url =
                    aiServiceUrl + "/generate-embedding";

            // -------------------------------------------------
            // Call FastAPI
            // -------------------------------------------------

            ResponseEntity<String> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.POST,
                            request,
                            String.class
                    );

            // -------------------------------------------------
            // Check response status
            // -------------------------------------------------

            if (!response.getStatusCode().is2xxSuccessful()) {

                throw new RuntimeException(
                        "AI service returned status: "
                                + response.getStatusCode()
                );
            }

            String responseBody =
                    response.getBody();

            if (responseBody == null ||
                    responseBody.isBlank()) {

                throw new RuntimeException(
                        "AI service returned an empty response."
                );
            }

            // -------------------------------------------------
            // Parse JSON
            // -------------------------------------------------

            JsonNode root =
                    objectMapper.readTree(responseBody);

            JsonNode embeddingArray =
                    root.path("embedding");

            if (!embeddingArray.isArray()) {

                throw new RuntimeException(
                        "AI service response does not contain "
                                + "a valid embedding."
                );
            }

            // -------------------------------------------------
            // Validate dimension
            // -------------------------------------------------

            if (embeddingArray.size() != 384) {

                throw new RuntimeException(
                        "Invalid job embedding size. "
                                + "Expected 384 but received "
                                + embeddingArray.size()
                );
            }

            // -------------------------------------------------
            // Convert JSON array to float[]
            // -------------------------------------------------

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

            return embedding;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate job embedding: "
                            + e.getMessage(),
                    e
            );
        }
    }

    // =========================================================
    // EMBEDDING REQUEST DTO
    // =========================================================

    private static class EmbeddingRequest {

        private final String text;

        public EmbeddingRequest(String text) {

            this.text = text;
        }

        public String getText() {

            return text;
        }
    }
}