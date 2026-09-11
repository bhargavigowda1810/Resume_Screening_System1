package resume_screening_backend.repository;

import resume_screening_backend.entity.ResumeEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeEmbeddingRepository
        extends JpaRepository<ResumeEmbedding, Long> {

    Optional<ResumeEmbedding> findByResumeId(Long resumeId);

}