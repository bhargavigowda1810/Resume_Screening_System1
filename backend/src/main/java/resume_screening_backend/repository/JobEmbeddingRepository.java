package resume_screening_backend.repository;

import resume_screening_backend.entity.JobEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JobEmbeddingRepository
        extends JpaRepository<JobEmbedding, Long> {

    Optional<JobEmbedding> findByJobId(Long jobId);

}