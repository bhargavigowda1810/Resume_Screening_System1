package resume_screening_backend.controller;

import resume_screening_backend.entity.Application;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import resume_screening_backend.service.ApplicationService;
import org.springframework.security.core.Authentication;
import resume_screening_backend.service.UserService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;
private final UserService userService;

   public ApplicationController(
        ApplicationService applicationService,
        UserService userService) {
    this.applicationService = applicationService;
    this.userService = userService;
}
    // Submit a job application
   // Submit a job application
@PostMapping
public ResponseEntity<?> submitApplication(
        @RequestBody Application application,
        Authentication authentication) {

    if (authentication == null
            || authentication.getName() == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Please log in again.");
    }

    Optional<resume_screening_backend.entity.User> optionalUser =
            userService.findByEmail(authentication.getName());

    if (optionalUser.isEmpty()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("User not found. Please log in again.");
    }

    resume_screening_backend.entity.User user = optionalUser.get();

    if (!"APPLICANT".equalsIgnoreCase(user.getRole())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Only applicants can submit applications.");
    }

    
application.setApplicantId(user.getUserId());

// Prevent the same applicant from applying to the same job twice.
Optional<Application> existingApplication =
        applicationService.findByJobIdAndApplicantId(
                application.getJobId(),
                user.getUserId()
        );

if (existingApplication.isPresent()) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
            .body("You have already applied for this job.");
}

Application submittedApplication =
        applicationService.submitApplication(application);

    return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(submittedApplication);
}
@GetMapping("/me")
public ResponseEntity<?> getMyApplications(
        Authentication authentication) {

    if (authentication == null
            || authentication.getName() == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Please log in again.");
    }

    return userService.findByEmail(authentication.getName())
            .<ResponseEntity<?>>map(user ->
                    ResponseEntity.ok(
                            applicationService.findByApplicantId(
                                    user.getUserId()
                            )
                    )
            )
            .orElseGet(() ->
                    ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body("User not found. Please log in again.")
            );
}
    // Get application by ID
    @GetMapping("/{applicationId}")
    public ResponseEntity<Application> getApplicationById(
            @PathVariable Long applicationId) {

        Optional<Application> application =
                applicationService.findById(applicationId);

        return application
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // Get all applications
    @GetMapping
    public ResponseEntity<List<Application>> getAllApplications() {

        return ResponseEntity.ok(
                applicationService.findAllApplications()
        );
    }

    // Get applications submitted by an applicant
    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<List<Application>> getApplicationsByApplicant(
            @PathVariable Long applicantId) {

        return ResponseEntity.ok(
                applicationService.findByApplicantId(applicantId)
        );
    }

    // Get applications for a job
    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<Application>> getApplicationsByJob(
            @PathVariable Long jobId) {

        return ResponseEntity.ok(
                applicationService.findByJobId(jobId)
        );
    }

    // Check whether an applicant already applied for a job
    @GetMapping("/check")
    public ResponseEntity<Application> checkApplication(
            @RequestParam Long jobId,
            @RequestParam Long applicantId) {

        Optional<Application> application =
                applicationService.findByJobIdAndApplicantId(
                        jobId,
                        applicantId
                );

        return application
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // Update application
    @PutMapping("/{applicationId}")
    public ResponseEntity<Application> updateApplication(
            @PathVariable Long applicationId,
            @RequestBody Application application) {

        Optional<Application> existingApplication =
                applicationService.findById(applicationId);

        if (existingApplication.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        application.setApplicationId(applicationId);

        return ResponseEntity.ok(
                applicationService.updateApplication(application)
        );
    }

    // Delete application
    @DeleteMapping("/{applicationId}")
    public ResponseEntity<Void> deleteApplication(
            @PathVariable Long applicationId) {

        Optional<Application> existingApplication =
                applicationService.findById(applicationId);

        if (existingApplication.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        applicationService.deleteApplication(applicationId);

        return ResponseEntity.noContent().build();
    }
    
    // =========================================================
    // SHORTLIST AN APPLICATION
    // =========================================================

    @PutMapping("/{applicationId}/shortlist")
    public ResponseEntity<Application> shortlistApplication(
            @PathVariable Long applicationId) {

        Application updated =
                applicationService.updateApplicationStatus(
                        applicationId,
                        "SHORTLISTED");

        return ResponseEntity.ok(updated);
    }

    // =========================================================
    // REJECT AN APPLICATION
    // =========================================================

    @PutMapping("/{applicationId}/reject")
    public ResponseEntity<Application> rejectApplication(
            @PathVariable Long applicationId) {

        Application updated =
                applicationService.updateApplicationStatus(
                        applicationId,
                        "REJECTED");

        return ResponseEntity.ok(updated);
    }

}