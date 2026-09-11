package resume_screening_backend.repository;

import resume_screening_backend.entity.Experience;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExperienceRepository extends JpaRepository<Experience, Long> {

    List<Experience> findByResumeId(Long resumeId);

}