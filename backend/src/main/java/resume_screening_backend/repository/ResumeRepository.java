
package resume_screening_backend.repository;

import resume_screening_backend.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Long> {

    // Fetch all resumes belonging to an applicant
    List<Resume> findByApplicantId(Long applicantId);

    // Fetch only the latest uploaded resume
    Optional<Resume> findTopByApplicantIdOrderByResumeIdDesc(Long applicantId);
}
