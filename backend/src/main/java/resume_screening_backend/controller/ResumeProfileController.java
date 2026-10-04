package resume_screening_backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import resume_screening_backend.entity.ResumeProfile;
import resume_screening_backend.service.ResumeProfileService;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/resume-profiles")
public class ResumeProfileController {

    private final ResumeProfileService resumeProfileService;

    public ResumeProfileController(
            ResumeProfileService resumeProfileService) {
        this.resumeProfileService = resumeProfileService;
    }

    @GetMapping("/resume/{resumeId}")
    public ResponseEntity<ResumeProfile> getProfileByResumeId(
            @PathVariable Long resumeId) {

        Optional<ResumeProfile> profile =
                resumeProfileService.findByResumeId(resumeId);

        return profile
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ResumeProfile> saveProfile(
            @RequestBody ResumeProfile resumeProfile) {

        ResumeProfile savedProfile =
                resumeProfileService.saveResumeProfile(resumeProfile);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedProfile);
    }

    @PutMapping("/{profileId}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long profileId,
            @RequestBody ResumeProfile resumeProfile,
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "User is not authenticated."
                    ));
        }

        try {

            String email = authentication.getName();

            Optional<ResumeProfile> updatedProfile =
                    resumeProfileService.updateResumeProfile(
                            profileId,
                            resumeProfile,
                            email
                    );

            if (updatedProfile.isEmpty()) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "message",
                                "Resume profile was not found or does not belong to the user."
                        ));
            }

            return ResponseEntity.ok(updatedProfile.get());

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));
        }
    }

    @PutMapping("/{profileId}/projects")
    public ResponseEntity<?> updateProjects(
            @PathVariable Long profileId,
            @RequestBody com.fasterxml.jackson.databind.JsonNode projects,
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "User is not authenticated."
                    ));
        }

        try {

            String email = authentication.getName();

            Optional<ResumeProfile> updatedProfile =
                    resumeProfileService.updateProjects(
                            profileId,
                            projects,
                            email
                    );

            if (updatedProfile.isEmpty()) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "message",
                                "Resume profile was not found or does not belong to the user."
                        ));
            }

            return ResponseEntity.ok(updatedProfile.get());

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));
        }
    }

    @DeleteMapping("/{profileId}")
    public ResponseEntity<?> deleteProfile(
            @PathVariable Long profileId) {

        Optional<ResumeProfile> profile =
                resumeProfileService.findById(profileId);

        if (profile.isEmpty()) {

            return ResponseEntity.notFound().build();
        }

        resumeProfileService.deleteResumeProfile(profileId);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Resume profile deleted successfully."
                )
        );
    }
}