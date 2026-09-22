package resume_screening_backend.controller;

import resume_screening_backend.entity.Application;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import resume_screening_backend.service.ApplicationService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    // Submit a job application
    @PostMapping
    public ResponseEntity<Application> submitApplication(
            @RequestBody Application application) {

        Application submittedApplication =
                applicationService.submitApplication(application);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(submittedApplication);
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
}