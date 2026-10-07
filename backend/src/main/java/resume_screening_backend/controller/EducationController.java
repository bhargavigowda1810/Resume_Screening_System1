package resume_screening_backend.controller;

import resume_screening_backend.entity.Education;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import resume_screening_backend.service.EducationService;
import org.springframework.security.core.Authentication;
import resume_screening_backend.entity.User;
import resume_screening_backend.service.UserService;

import java.util.Map;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/educations")
public class EducationController {

    private final EducationService educationService;
private final UserService userService;

public EducationController(
        EducationService educationService,
        UserService userService) {

    this.educationService = educationService;
    this.userService = userService;
}

    // Add education to a resume
   @PostMapping
public ResponseEntity<Education> saveEducation(
        @RequestBody Education education,
        Authentication authentication) {

    Optional<User> user =
        userService.findByEmail(authentication.getName());

if (user.isEmpty()) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}

Long userId = user.get().getUserId();

    if (!educationService.isResumeOwnedByUser(
            education.getResumeId(), userId)) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

        Education savedEducation =
                educationService.saveEducation(education);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedEducation);
    }

    // Get education by ID
   @GetMapping("/{educationId}")
public ResponseEntity<Education> getEducationById(
        @PathVariable Long educationId,
        Authentication authentication) {

    Optional<User> user =
        userService.findByEmail(authentication.getName());

if (user.isEmpty()) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}

Long userId = user.get().getUserId();

    if (!educationService.isOwnedByUser(educationId, userId)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

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
        @PathVariable Long resumeId,
        Authentication authentication) {

    Optional<User> user =
        userService.findByEmail(authentication.getName());

if (user.isEmpty()) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}

Long userId = user.get().getUserId();

    if (!educationService.isResumeOwnedByUser(resumeId, userId)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    return ResponseEntity.ok(
            educationService.findByResumeId(resumeId)
    );
}

    // Update education
  @PutMapping("/{educationId}")
public ResponseEntity<?> updateEducation(
        @PathVariable Long educationId,
        @RequestBody Education education,
        Authentication authentication) {

    if (authentication == null ||
            !authentication.isAuthenticated()) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(
                        Map.of(
                                "message",
                                "User is not authenticated."
                        )
                );
    }

    try {

        String email =
                authentication.getName();

        Optional<Education> updatedEducation =
                educationService.updateEducation(
                        educationId,
                        education,
                        email
                );

        if (updatedEducation.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "message",
                                    "Education record was not found."
                            )
                    );
        }

        return ResponseEntity.ok(
                updatedEducation.get()
        );

    } catch (IllegalArgumentException e) {

        return ResponseEntity
                .badRequest()
                .body(
                        Map.of(
                                "message",
                                e.getMessage()
                        )
                );

    } catch (Exception e) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                        Map.of(
                                "message",
                                "Unable to update education."
                        )
                );
    }
}
    // Delete education
    @DeleteMapping("/{educationId}")
public ResponseEntity<Void> deleteEducation(
        @PathVariable Long educationId,
        Authentication authentication) {

    Optional<User> user =
        userService.findByEmail(authentication.getName());

if (user.isEmpty()) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}

Long userId = user.get().getUserId();

    if (!educationService.isOwnedByUser(educationId, userId)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

        Optional<Education> existingEducation =
                educationService.findById(educationId);

        if (existingEducation.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        educationService.deleteEducation(educationId);

        return ResponseEntity.noContent().build();
    }
}