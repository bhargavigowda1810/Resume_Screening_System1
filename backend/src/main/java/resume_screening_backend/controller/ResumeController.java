package resume_screening_backend.controller;

import resume_screening_backend.entity.Resume;
import resume_screening_backend.service.ResumeService;
import resume_screening_backend.service.AiResumeService;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;
    private final AiResumeService aiResumeService;

    public ResumeController(
            ResumeService resumeService,
            AiResumeService aiResumeService) {

        this.resumeService = resumeService;
        this.aiResumeService = aiResumeService;
    }

    // =========================================================
    // SAVE RESUME
    // =========================================================

    @PostMapping
    public ResponseEntity<Resume> saveResume(
            @RequestBody Resume resume) {

        Resume savedResume =
                resumeService.saveResume(resume);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedResume);
    }

    // =========================================================
    // GET RESUME BY ID
    // =========================================================

    @GetMapping("/{resumeId}")
    public ResponseEntity<Resume> getResumeById(
            @PathVariable Long resumeId) {

        Optional<Resume> resume =
                resumeService.findById(resumeId);

        return resume
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    // =========================================================
    // VIEW / DOWNLOAD ACTUAL RESUME FILE
    // =========================================================

    @GetMapping("/{resumeId}/file")
    public ResponseEntity<Resource> getResumeFile(
            @PathVariable Long resumeId) {

        try {

            // Find resume record
            Optional<Resume> resume =
                    resumeService.findById(resumeId);

            if (resume.isEmpty()) {
                return ResponseEntity
                        .notFound()
                        .build();
            }

            // Get file path from database
            String filePath =
                    resume.get().getFilePath();

            if (filePath == null ||
                    filePath.isBlank()) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            // Convert database path to Path
            Path path =
                    Paths.get(filePath);

            // Check whether physical file exists
            if (!Files.exists(path)) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            // Create Spring Resource
            Resource resource =
                    new UrlResource(path.toUri());

            if (!resource.exists() ||
                    !resource.isReadable()) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            // Determine content type
            String contentType =
                    Files.probeContentType(path);

            if (contentType == null) {
                contentType =
                        "application/octet-stream";
            }

            // Return file to browser
            return ResponseEntity
                    .ok()
                    .contentType(
                            MediaType.parseMediaType(
                                    contentType
                            )
                    )
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" +
                                    resume.get().getFileName() +
                                    "\""
                    )
                    .body(resource);

        } catch (Exception e) {

            System.err.println(
                    "Error loading resume file: "
                            + e.getMessage()
            );

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .build();
        }
    }

    // =========================================================
    // GET ALL RESUMES
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Resume>> getAllResumes() {

        return ResponseEntity.ok(
                resumeService.findAllResumes()
        );
    }

    // =========================================================
    // GET RESUMES BY APPLICANT
    // =========================================================

    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<List<Resume>>
    getResumesByApplicant(
            @PathVariable Long applicantId) {

        return ResponseEntity.ok(
                resumeService
                        .findByApplicantId(applicantId)
        );
    }

    // =========================================================
    // UPDATE RESUME
    // =========================================================

    @PutMapping("/{resumeId}")
    public ResponseEntity<Resume> updateResume(
            @PathVariable Long resumeId,
            @RequestBody Resume resume) {

        Optional<Resume> existingResume =
                resumeService.findById(resumeId);

        if (existingResume.isEmpty()) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        resume.setResumeId(resumeId);

        return ResponseEntity.ok(
                resumeService.updateResume(resume)
        );
    }

    // =========================================================
    // DELETE RESUME
    // =========================================================

    @DeleteMapping("/{resumeId}")
    public ResponseEntity<Void> deleteResume(
            @PathVariable Long resumeId) {

        Optional<Resume> existingResume =
                resumeService.findById(resumeId);

        if (existingResume.isEmpty()) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        resumeService.deleteResume(resumeId);

        return ResponseEntity
                .noContent()
                .build();
    }

    // =========================================================
    // PARSE AND SAVE RESUME USING AI SERVICE
    // =========================================================

    @PostMapping(
            value = "/parse",
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<String> parseResume(
            @RequestParam("file")
            MultipartFile file,

            @RequestParam("applicantId")
            Long applicantId) {

        try {

            // Validate file
            if (file.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "File cannot be empty."
                        );
            }

            // Validate applicant ID
            if (applicantId == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Applicant ID is required."
                        );
            }

            // Send resume to AI service
            String result =
                    aiResumeService
                            .parseAndSaveResume(
                                    file,
                                    applicantId
                            );

            return ResponseEntity.ok(result);

        } catch (Exception e) {

            System.err.println(
                    "Resume processing failed: "
                            + e.getMessage()
            );

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            "Resume processing failed: "
                                    + e.getMessage()
                    );
        }
    }
}

