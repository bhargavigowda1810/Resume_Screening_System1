package resume_screening_backend.controller;

import resume_screening_backend.entity.Experience;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import resume_screening_backend.service.ExperienceService;
import org.springframework.security.core.Authentication;
import resume_screening_backend.entity.User;
import resume_screening_backend.service.UserService;


import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/experiences")
public class ExperienceController {

    private final ExperienceService experienceService;
private final UserService userService;

public ExperienceController(
        ExperienceService experienceService,
        UserService userService) {

    this.experienceService = experienceService;
    this.userService = userService;
}

    // Add experience to a resume
   @PostMapping
public ResponseEntity<?> saveExperience(
        @RequestBody Experience experience,
        Authentication authentication) {

    try {
        Experience savedExperience =
                experienceService.createExperience(
                        experience,
                        authentication.getName()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedExperience);

    } catch (IllegalArgumentException e) {

        return ResponseEntity
                .badRequest()
                .body(java.util.Map.of(
                        "message",
                        e.getMessage()
                ));
    }
}

    // Get experience by ID
   @GetMapping("/{experienceId}")
public ResponseEntity<Experience> getExperienceById(
        @PathVariable Long experienceId,
        Authentication authentication) {

    Optional<User> user =
        userService.findByEmail(authentication.getName());

if (user.isEmpty()) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}

Long userId = user.get().getUserId();

    if (!experienceService.isOwnedByUser(experienceId, userId)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
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
        @PathVariable Long resumeId,
        Authentication authentication) {

    Optional<User> user =
        userService.findByEmail(authentication.getName());

if (user.isEmpty()) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}

Long userId = user.get().getUserId();

    if (!experienceService.isResumeOwnedByUser(resumeId, userId)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    return ResponseEntity.ok(
            experienceService.findByResumeId(resumeId)
    );
}

    // Update experience
   @PutMapping("/{experienceId}")
public ResponseEntity<?> updateExperience(
        @PathVariable Long experienceId,
        @RequestBody Experience experience,
        Authentication authentication) {

    try {
        Experience updatedExperience =
                experienceService.updateExperience(
                        experienceId,
                        experience,
                        authentication.getName()
                );

        return ResponseEntity.ok(updatedExperience);

    } catch (IllegalArgumentException e) {

        return ResponseEntity
                .badRequest()
                .body(java.util.Map.of(
                        "message",
                        e.getMessage()
                ));
    }
}
    // Delete experience
    @DeleteMapping("/{experienceId}")
public ResponseEntity<Void> deleteExperience(
        @PathVariable Long experienceId,
        Authentication authentication) {

    Optional<User> user =
        userService.findByEmail(authentication.getName());

if (user.isEmpty()) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}

Long userId = user.get().getUserId();

    if (!experienceService.isOwnedByUser(experienceId, userId)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

        Optional<Experience> existingExperience =
                experienceService.findById(experienceId);

        if (existingExperience.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        experienceService.deleteExperience(experienceId);

        return ResponseEntity.noContent().build();
    }
}
