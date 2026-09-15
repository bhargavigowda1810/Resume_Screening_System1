package resume_screening_backend.service;

import resume_screening_backend.entity.Application;
import org.springframework.stereotype.Service;
import resume_screening_backend.repository.ApplicationRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;

    public ApplicationService(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    public Application submitApplication(Application application) {
        application.setStatus("SUBMITTED");
        application.setAppliedAt(java.time.LocalDateTime.now());

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
            Long jobId,
            Long applicantId) {

        return applicationRepository.findByJobIdAndApplicantId(
                jobId,
                applicantId
        );
    }

    public Application updateApplication(Application application) {
        return applicationRepository.save(application);
    }

    public void deleteApplication(Long applicationId) {
        applicationRepository.deleteById(applicationId);
    }
}