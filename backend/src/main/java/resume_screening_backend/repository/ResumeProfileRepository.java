package resume_screening_backend.repository;

import resume_screening_backend.entity.ResumeProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeProfileRepository
        extends JpaRepository<ResumeProfile, Long> {

    Optional<ResumeProfile> findByResumeId(Long resumeId);
}