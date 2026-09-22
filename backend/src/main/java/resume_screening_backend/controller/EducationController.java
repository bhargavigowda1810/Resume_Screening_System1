package resume_screening_backend.controller;

import resume_screening_backend.entity.Education;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import resume_screening_backend.service.EducationService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/educations")
public class EducationController {

    private final EducationService educationService;

    public EducationController(EducationService educationService) {
        this.educationService = educationService;
    }

    // Add education to a resume
    @PostMapping
    public ResponseEntity<Education> saveEducation(
            @RequestBody Education education) {

        Education savedEducation =
                educationService.saveEducation(education);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedEducation);
    }

    // Get education by ID
    @GetMapping("/{educationId}")
    public ResponseEntity<Education> getEducationById(
            @PathVariable Long educationId) {

        Optional<Education> education =
                educationService.findById(educationId);

        return education
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // Get all education records
    @GetMapping
    public ResponseEntity<List<Education>> getAllEducations() {

        return ResponseEntity.ok(
                educationService.findAllEducations()
        );
    }

    // Get education records for a resume
    @GetMapping("/resume/{resumeId}")
    public ResponseEntity<List<Education>> getEducationByResume(
            @PathVariable Long resumeId) {

        return ResponseEntity.ok(
                educationService.findByResumeId(resumeId)
        );
    }

    // Update education
    @PutMapping("/{educationId}")
    public ResponseEntity<Education> updateEducation(
            @PathVariable Long educationId,
            @RequestBody Education education) {

        Optional<Education> existingEducation =
                educationService.findById(educationId);

        if (existingEducation.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        education.setEducationId(educationId);

        return ResponseEntity.ok(
                educationService.updateEducation(education)
        );
    }

    // Delete education
    @DeleteMapping("/{educationId}")
    public ResponseEntity<Void> deleteEducation(
            @PathVariable Long educationId) {

        Optional<Education> existingEducation =
                educationService.findById(educationId);

        if (existingEducation.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        educationService.deleteEducation(educationId);

        return ResponseEntity.noContent().build();
    }
}