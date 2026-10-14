
package resume_screening_backend.service;

import resume_screening_backend.entity.Application;
import resume_screening_backend.entity.Job;
import resume_screening_backend.entity.User;
import resume_screening_backend.repository.ApplicationRepository;
import resume_screening_backend.repository.JobRepository;
import resume_screening_backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            JobRepository jobRepository,
            UserRepository userRepository,
            EmailService emailService) {

        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public Application submitApplication(Application application) {
        application.setStatus("SUBMITTED");
        application.setAppliedAt(LocalDateTime.now());
        return applicationRepository.save(application);
    }

    public Optional<Application> findById(Long applicationId) {
        return applicationRepository.findById(applicationId);
    }

    public List<Application> findAllApplications() {
        return applicationRepository.findAll();
    }

    public List<Application> findByApplicantId(Long applicantId) {
        return applicationRepository.findByApplicantId(applicantId);
    }

    public List<Application> findByJobId(Long jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    public Optional<Application> findByJobIdAndApplicantId(
            Long jobId, Long applicantId) {
        return applicationRepository.findByJobIdAndApplicantId(
                jobId, applicantId);
    }

    public Application updateApplication(Application application) {
        return applicationRepository.save(application);
    }

    public Application updateApplicationStatus(
            Long applicationId, String status) {

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException(
                        "Application not found: " + applicationId));

        String normalizedStatus = status == null
                ? ""
                : status.trim().toUpperCase();

        if (!normalizedStatus.equals("SHORTLISTED")
                && !normalizedStatus.equals("REJECTED")) {
            throw new IllegalArgumentException(
                    "Unsupported application status: " + status);
        }

        application.setStatus(normalizedStatus);
        Application savedApplication =
                applicationRepository.save(application);

        // Send the notification after the status has been saved.
        try {
            sendStatusNotification(savedApplication, normalizedStatus);
        } catch (Exception e) {
            // Email failure should not undo the status update.
            System.err.println(
                    "Application status saved, but notification email failed "
                            + "for application " + applicationId
                            + ": " + e.getMessage());
        }

        return savedApplication;
    }

    private void sendStatusNotification(
            Application application, String status) {

        User applicant = userRepository.findById(application.getApplicantId())
                .orElseThrow(() -> new RuntimeException(
                        "Applicant not found: " + application.getApplicantId()));

        Job job = jobRepository.findById(application.getJobId())
                .orElseThrow(() -> new RuntimeException(
                        "Job not found: " + application.getJobId()));

        User recruiter = userRepository.findById(job.getRecruiterId())
                .orElseThrow(() -> new RuntimeException(
                        "Recruiter not found: " + job.getRecruiterId()));

        String companyName = recruiter.getName();
        String companyEmail = recruiter.getEmail();
        String location = job.getLocation() == null
                ? "Not specified"
                : job.getLocation();

        if ("SHORTLISTED".equals(status)) {
            emailService.sendApplicationShortlistedEmail(
                    applicant.getEmail(),
                    applicant.getName(),
                    job.getTitle(),
                    companyName,
                    companyEmail,
                    location,
                    application.getApplicationId());
        } else if ("REJECTED".equals(status)) {
            emailService.sendApplicationRejectedEmail(
                    applicant.getEmail(),
                    applicant.getName(),
                    job.getTitle(),
                    companyName,
                    companyEmail,
                    location,
                    application.getApplicationId());
        }
    }

    public void deleteApplication(Long applicationId) {
        applicationRepository.deleteById(applicationId);
    }
}
