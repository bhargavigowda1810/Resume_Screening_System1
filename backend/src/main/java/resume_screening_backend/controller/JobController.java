package resume_screening_backend.controller;

import resume_screening_backend.entity.Job;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import resume_screening_backend.service.JobService;
import org.springframework.security.core.Authentication;
import resume_screening_backend.entity.User;
import resume_screening_backend.repository.UserRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;
private final UserRepository userRepository;

public JobController(
        JobService jobService,
        UserRepository userRepository) {

    this.jobService = jobService;
    this.userRepository = userRepository;
}

    // Create a new job
    @PostMapping
    public ResponseEntity<Job> createJob(@RequestBody Job job) {
        Job createdJob = jobService.createJob(job);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdJob);
    }
@GetMapping("/me")
public ResponseEntity<List<Job>> getMyJobs(
        Authentication authentication) {

    String email = authentication.getName();

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    return ResponseEntity.ok(
            jobService.findByRecruiterId(user.getUserId())
    );
}
    // Get job by ID
    @GetMapping("/{jobId}")
    public ResponseEntity<Job> getJobById(
            @PathVariable Long jobId) {

        Optional<Job> job = jobService.findById(jobId);

        return job
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // Get all jobs
    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(
                jobService.findAllJobs()
        );
    }

    // Get jobs posted by a recruiter
    @GetMapping("/recruiter/{recruiterId}")
    public ResponseEntity<List<Job>> getJobsByRecruiter(
            @PathVariable Long recruiterId) {

        return ResponseEntity.ok(
                jobService.findByRecruiterId(recruiterId)
        );
    }

    // Update job
    @PutMapping("/{jobId}")
    public ResponseEntity<Job> updateJob(
            @PathVariable Long jobId,
            @RequestBody Job job) {

        Optional<Job> existingJob = jobService.findById(jobId);

        if (existingJob.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        job.setJobId(jobId);

        return ResponseEntity.ok(
                jobService.updateJob(job)
        );
    }

    // Delete job
    @DeleteMapping("/{jobId}")
    public ResponseEntity<Void> deleteJob(
            @PathVariable Long jobId) {

        Optional<Job> existingJob = jobService.findById(jobId);

        if (existingJob.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        jobService.deleteJob(jobId);

        return ResponseEntity.noContent().build();
    }
}