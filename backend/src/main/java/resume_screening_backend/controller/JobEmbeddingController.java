package resume_screening_backend.controller;

import resume_screening_backend.entity.JobEmbedding;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import resume_screening_backend.service.JobEmbeddingService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/job-embeddings")
public class JobEmbeddingController {

    private final JobEmbeddingService jobEmbeddingService;

    public JobEmbeddingController(JobEmbeddingService jobEmbeddingService) {
        this.jobEmbeddingService = jobEmbeddingService;
    }

    // ============================================================
    // SAVE JOB EMBEDDING
    // ============================================================

    @PostMapping
    public ResponseEntity<JobEmbedding> saveEmbedding(
            @RequestBody JobEmbedding embedding) {

        JobEmbedding savedEmbedding =
                jobEmbeddingService.saveEmbedding(embedding);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedEmbedding);
    }

    // ============================================================
    // GET EMBEDDING BY ID
    // ============================================================

    @GetMapping("/{embeddingId}")
    public ResponseEntity<JobEmbedding> getEmbeddingById(
            @PathVariable Long embeddingId) {

        Optional<JobEmbedding> embedding =
                jobEmbeddingService.findById(embeddingId);

        return embedding
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // ============================================================
    // GET EMBEDDING BY JOB ID
    // ============================================================

    @GetMapping("/job/{jobId}")
    public ResponseEntity<JobEmbedding> getEmbeddingByJobId(
            @PathVariable Long jobId) {

        Optional<JobEmbedding> embedding =
                jobEmbeddingService.findByJobId(jobId);

        return embedding
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // ============================================================
    // GET ALL JOB EMBEDDINGS
    // ============================================================

    @GetMapping
    public ResponseEntity<List<JobEmbedding>> getAllEmbeddings() {

        return ResponseEntity.ok(
                jobEmbeddingService.findAllEmbeddings()
        );
    }

    // ============================================================
    // UPDATE EMBEDDING
    // ============================================================

    @PutMapping("/{embeddingId}")
    public ResponseEntity<JobEmbedding> updateEmbedding(
            @PathVariable Long embeddingId,
            @RequestBody JobEmbedding embedding) {

        Optional<JobEmbedding> existingEmbedding =
                jobEmbeddingService.findById(embeddingId);

        if (existingEmbedding.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        embedding.setEmbeddingId(embeddingId);

        return ResponseEntity.ok(
                jobEmbeddingService.updateEmbedding(embedding)
        );
    }

    // ============================================================
    // DELETE EMBEDDING BY ID
    // ============================================================

    @DeleteMapping("/{embeddingId}")
    public ResponseEntity<Void> deleteEmbedding(
            @PathVariable Long embeddingId) {

        Optional<JobEmbedding> existingEmbedding =
                jobEmbeddingService.findById(embeddingId);

        if (existingEmbedding.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        jobEmbeddingService.deleteEmbedding(embeddingId);

        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // DELETE EMBEDDING BY JOB ID
    // ============================================================

    @DeleteMapping("/job/{jobId}")
    public ResponseEntity<Void> deleteEmbeddingByJobId(
            @PathVariable Long jobId) {

        Optional<JobEmbedding> existingEmbedding =
                jobEmbeddingService.findByJobId(jobId);

        if (existingEmbedding.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        jobEmbeddingService.deleteByJobId(jobId);

        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // GENERATE AND SAVE JOB EMBEDDING
    // ============================================================

    @PostMapping("/job/{jobId}")
    public ResponseEntity<?> generateJobEmbedding(
            @PathVariable Long jobId) {

        try {

            JobEmbedding embedding =
                    jobEmbeddingService
                            .generateAndSaveJobEmbedding(jobId);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(embedding);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Failed to generate job embedding: "
                                    + e.getMessage()
                    );
        }
    }
}

