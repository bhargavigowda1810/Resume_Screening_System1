package resume_screening_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import resume_screening_backend.entity.RecruiterProfile;

import java.util.Optional;

public interface RecruiterProfileRepository
        extends JpaRepository<RecruiterProfile, Long> {

    Optional<RecruiterProfile> findByUserUserId(Long userId);

    Optional<RecruiterProfile> findByUserEmail(String email);
}