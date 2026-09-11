package resume_screening_backend.repository;

import resume_screening_backend.entity.Education;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EducationRepository extends JpaRepository<Education, Long> {

    List<Education> findByResumeId(Long resumeId);

}