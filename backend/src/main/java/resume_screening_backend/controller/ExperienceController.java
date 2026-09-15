package resume_screening_backend.controller;

import resume_screening_backend.entity.Experience;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import resume_screening_backend.service.ExperienceService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/experiences")
public class ExperienceController {

    private final ExperienceService experienceService;

    public ExperienceController(ExperienceService experienceService) {
        this.experienceService = experienceService;
    }

    // Add experience to a resume
    @PostMapping
    public ResponseEntity<Experience> saveExperience(
            @RequestBody Experience experience) {

        Experience savedExperience =
                experienceService.saveExperience(experience);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedExperience);
    }

    // Get experience by ID
    @GetMapping("/{experienceId}")
    public ResponseEntity<Experience> getExperienceById(
            @PathVariable Long experienceId) {

        Optional<Experience> experience =
                experienceService.findById(experienceId);

        return experience
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // Get all experiences
    @GetMapping
    public ResponseEntity<List<Experience>> getAllExperiences() {

        return ResponseEntity.ok(
                experienceService.findAllExperiences()
        );
    }

    // Get experiences for a resume
    @GetMapping("/resume/{resumeId}")
    public ResponseEntity<List<Experience>> getExperiencesByResume(
            @PathVariable Long resumeId) {

        return ResponseEntity.ok(
                experienceService.findByResumeId(resumeId)
        );
    }

    // Update experience
    @PutMapping("/{experienceId}")
    public ResponseEntity<Experience> updateExperience(
            @PathVariable Long experienceId,
            @RequestBody Experience experience) {

        Optional<Experience> existingExperience =
                experienceService.findById(experienceId);

        if (existingExperience.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        experience.setExperienceId(experienceId);

        return ResponseEntity.ok(
                experienceService.updateExperience(experience)
        );
    }

    // Delete experience
    @DeleteMapping("/{experienceId}")
    public ResponseEntity<Void> deleteExperience(
            @PathVariable Long experienceId) {

        Optional<Experience> existingExperience =
                experienceService.findById(experienceId);

        if (existingExperience.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        experienceService.deleteExperience(experienceId);

        return ResponseEntity.noContent().build();
    }
}
