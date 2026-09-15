package resume_screening_backend.controller;

import resume_screening_backend.entity.ResumeEmbedding;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import resume_screening_backend.service.ResumeEmbeddingService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/resume-embeddings")
public class ResumeEmbeddingController {

    private final ResumeEmbeddingService resumeEmbeddingService;

    public ResumeEmbeddingController(
            ResumeEmbeddingService resumeEmbeddingService) {
        this.resumeEmbeddingService = resumeEmbeddingService;
    }

    // Save resume embedding
    @PostMapping
    public ResponseEntity<ResumeEmbedding> saveEmbedding(
            @RequestBody ResumeEmbedding embedding) {

        ResumeEmbedding savedEmbedding =
                resumeEmbeddingService.saveEmbedding(embedding);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedEmbedding);
    }

    // Get embedding by ID
    @GetMapping("/{embeddingId}")
    public ResponseEntity<ResumeEmbedding> getEmbeddingById(
            @PathVariable Long embeddingId) {

        Optional<ResumeEmbedding> embedding =
                resumeEmbeddingService.findById(embeddingId);

        return embedding
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // Get embedding by resume ID
    @GetMapping("/resume/{resumeId}")
    public ResponseEntity<ResumeEmbedding> getEmbeddingByResumeId(
            @PathVariable Long resumeId) {

        Optional<ResumeEmbedding> embedding =
                resumeEmbeddingService.findByResumeId(resumeId);

        return embedding
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // Get all resume embeddings
    @GetMapping
    public ResponseEntity<List<ResumeEmbedding>> getAllEmbeddings() {

        return ResponseEntity.ok(
                resumeEmbeddingService.findAllEmbeddings()
        );
    }

    // Update embedding
    @PutMapping("/{embeddingId}")
    public ResponseEntity<ResumeEmbedding> updateEmbedding(
            @PathVariable Long embeddingId,
            @RequestBody ResumeEmbedding embedding) {

        Optional<ResumeEmbedding> existingEmbedding =
                resumeEmbeddingService.findById(embeddingId);

        if (existingEmbedding.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        embedding.setEmbeddingId(embeddingId);

        return ResponseEntity.ok(
                resumeEmbeddingService.updateEmbedding(embedding)
        );
    }

    // Delete embedding by ID
    @DeleteMapping("/{embeddingId}")
    public ResponseEntity<Void> deleteEmbedding(
            @PathVariable Long embeddingId) {

        Optional<ResumeEmbedding> existingEmbedding =
                resumeEmbeddingService.findById(embeddingId);

        if (existingEmbedding.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        resumeEmbeddingService.deleteEmbedding(embeddingId);

        return ResponseEntity.noContent().build();
    }

    // Delete embedding by resume ID
    @DeleteMapping("/resume/{resumeId}")
    public ResponseEntity<Void> deleteEmbeddingByResumeId(
            @PathVariable Long resumeId) {

        Optional<ResumeEmbedding> existingEmbedding =
                resumeEmbeddingService.findByResumeId(resumeId);

        if (existingEmbedding.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        resumeEmbeddingService.deleteByResumeId(resumeId);

        return ResponseEntity.noContent().build();
    }
}