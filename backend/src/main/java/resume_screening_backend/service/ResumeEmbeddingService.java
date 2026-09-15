package resume_screening_backend.service;

import resume_screening_backend.entity.ResumeEmbedding;
import org.springframework.stereotype.Service;
import resume_screening_backend.repository.ResumeEmbeddingRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ResumeEmbeddingService {

    private final ResumeEmbeddingRepository resumeEmbeddingRepository;

    public ResumeEmbeddingService(
            ResumeEmbeddingRepository resumeEmbeddingRepository) {
        this.resumeEmbeddingRepository = resumeEmbeddingRepository;
    }

    public ResumeEmbedding saveEmbedding(ResumeEmbedding embedding) {
        return resumeEmbeddingRepository.save(embedding);
    }

    public Optional<ResumeEmbedding> findById(Long embeddingId) {
        return resumeEmbeddingRepository.findById(embeddingId);
    }

    public Optional<ResumeEmbedding> findByResumeId(Long resumeId) {
        return resumeEmbeddingRepository.findByResumeId(resumeId);
    }

    public List<ResumeEmbedding> findAllEmbeddings() {
        return resumeEmbeddingRepository.findAll();
    }

    public ResumeEmbedding updateEmbedding(ResumeEmbedding embedding) {
        return resumeEmbeddingRepository.save(embedding);
    }

    public void deleteEmbedding(Long embeddingId) {
        resumeEmbeddingRepository.deleteById(embeddingId);
    }

    public void deleteByResumeId(Long resumeId) {
        resumeEmbeddingRepository.findByResumeId(resumeId)
                .ifPresent(resumeEmbeddingRepository::delete);
    }
}