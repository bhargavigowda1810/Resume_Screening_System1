package resume_screening_backend.controller;

import resume_screening_backend.entity.Resume;
import resume_screening_backend.service.ResumeService;
import resume_screening_backend.service.AiResumeService;
import org.springframework.security.core.Authentication;
import resume_screening_backend.entity.Application;
import resume_screening_backend.entity.Job;
import resume_screening_backend.repository.ApplicationRepository;
import resume_screening_backend.repository.JobRepository;
import resume_screening_backend.entity.User;
import resume_screening_backend.service.UserService;

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
private final UserService userService;
private final ApplicationRepository applicationRepository;
private final JobRepository jobRepository;

public ResumeController(
        ResumeService resumeService,
        AiResumeService aiResumeService,
        UserService userService,
        ApplicationRepository applicationRepository,
        JobRepository jobRepository) {

    this.resumeService = resumeService;
    this.aiResumeService = aiResumeService;
    this.userService = userService;
    this.applicationRepository = applicationRepository;
    this.jobRepository = jobRepository;
}
    // =========================================================
    // SAVE RESUME
    // =========================================================

   @PostMapping
public ResponseEntity<Resume> saveResume(
        @RequestBody Resume resume,
        Authentication authentication) {

    Optional<User> user =
        userService.findByEmail(authentication.getName());

if (user.isEmpty()) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}

Long userId = user.get().getUserId();

    if (!userId.equals(resume.getApplicantId())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

        Resume savedResume =
                resumeService.saveResume(resume);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedResume);
    }
// =========================================================
// GET MY RESUME
// =========================================================

@GetMapping("/me")
public ResponseEntity<List<Resume>> getMyResumes(
        Authentication authentication) {

    Optional<User> user =
            userService.findByEmail(authentication.getName());

    if (user.isEmpty()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    Long userId = user.get().getUserId();

    return ResponseEntity.ok(
            resumeService.findByApplicantId(userId)
    );
}
    // =========================================================
    // GET RESUME BY ID
    // =========================================================

   @GetMapping("/{resumeId}")
public ResponseEntity<Resume> getResumeById(
        @PathVariable Long resumeId,
        Authentication authentication) {

    Optional<User> user =
        userService.findByEmail(authentication.getName());

if (user.isEmpty()) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}

Long userId = user.get().getUserId();

    Optional<Resume> resume =
            resumeService.findById(resumeId);

    if (resume.isEmpty()) {
        return ResponseEntity.notFound().build();
    }

    if (!userId.equals(resume.get().getApplicantId())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

      return ResponseEntity.ok(resume.get());

    }

    // =========================================================
    // VIEW / DOWNLOAD ACTUAL RESUME FILE
    // =========================================================

  
@GetMapping("/{resumeId}/file")
public ResponseEntity<Resource> getResumeFile(
        @PathVariable Long resumeId,
        Authentication authentication) {

    try {
        Optional<User> user =
                userService.findByEmail(authentication.getName());

        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Resume> resumeOptional =
                resumeService.findById(resumeId);

        if (resumeOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Resume resume = resumeOptional.get();
        Long userId = user.get().getUserId();

        // Applicants can view their own resumes.
        boolean authorized = userId.equals(resume.getApplicantId());

        // Recruiters can view resumes of applicants to their jobs.
        if (!authorized && "RECRUITER".equalsIgnoreCase(user.get().getRole())) {
            List<Application> applications =
                    applicationRepository.findByApplicantId(
                            resume.getApplicantId());

            for (Application application : applications) {
                Optional<Job> jobOptional =
                        jobRepository.findById(application.getJobId());

                if (jobOptional.isPresent()
                        && userId.equals(jobOptional.get().getRecruiterId())) {
                    authorized = true;
                    break;
                }
            }
        }

        if (!authorized) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String filePath = resume.getFilePath();

        if (filePath == null || filePath.isBlank()) {
            return ResponseEntity.notFound().build();
        }

        Path path = Paths.get(filePath).toAbsolutePath().normalize();

        if (!Files.isRegularFile(path) || !Files.isReadable(path)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(path.toUri());

        String contentType = Files.probeContentType(path);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        String filename = resume.getFileName();
        if (filename == null || filename.isBlank()) {
            filename = path.getFileName().toString();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + filename.replace("\"", "") + "\"")
                .body(resource);

    } catch (Exception e) {
        System.err.println(
                "Error loading resume file: " + e.getMessage());

        return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR).build();
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
        @PathVariable Long applicantId,
        Authentication authentication) {

    Optional<User> user =
        userService.findByEmail(authentication.getName());

if (user.isEmpty()) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}

Long userId = user.get().getUserId();
    if (!userId.equals(applicantId)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

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
        @RequestBody Resume resume,
        Authentication authentication) {

    Optional<User> user =
        userService.findByEmail(authentication.getName());

if (user.isEmpty()) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}

Long userId = user.get().getUserId();

    Optional<Resume> existingResume =
            resumeService.findById(resumeId);

    if (existingResume.isEmpty()) {
        return ResponseEntity.notFound().build();
    }

    if (!userId.equals(existingResume.get().getApplicantId())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
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
        @PathVariable Long resumeId,
        Authentication authentication) {

    Optional<User> user =
        userService.findByEmail(authentication.getName());

if (user.isEmpty()) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}

Long userId = user.get().getUserId();

    Optional<Resume> existingResume =
            resumeService.findById(resumeId);

    if (existingResume.isEmpty()) {
        return ResponseEntity.notFound().build();
    }

    if (!userId.equals(existingResume.get().getApplicantId())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
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
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
)
public ResponseEntity<String> parseResume(
        @RequestParam("file") MultipartFile file,
        Authentication authentication) {

    try {

        Optional<User> user =
                userService.findByEmail(authentication.getName());

        if (user.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("User not found. Please login again.");
        }

        // Get applicant ID from the authenticated user
        Long applicantId = user.get().getUserId();

        // Validate file
        if (file.isEmpty()) {
            return ResponseEntity
                    .badRequest()
                    .body("File cannot be empty.");
        }

        // Send resume to AI service
        String result =
                aiResumeService.parseAndSaveResume(
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
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                        "Resume processing failed: "
                                + e.getMessage()
                );
    }
}
}

