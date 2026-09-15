package resume_screening_backend.repository;

import resume_screening_backend.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByApplicantId(Long applicantId);

    List<Application> findByJobId(Long jobId);

    Optional<Application> findByJobIdAndApplicantId(Long jobId, Long applicantId);

}