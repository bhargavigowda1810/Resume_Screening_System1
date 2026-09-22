package resume_screening_backend.repository;

import resume_screening_backend.entity.ScreeningResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ScreeningResultRepository
        extends JpaRepository<ScreeningResult, Long> {

    Optional<ScreeningResult> findByApplicationId(Long applicationId);

    // =========================================================
    // Rank screening results for a particular job
    // =========================================================

    @Query(value = """
        SELECT sr.*
        FROM screening_results sr
        JOIN applications a
            ON a.application_id = sr.application_id
        WHERE a.job_id = :jobId
        ORDER BY sr.final_score DESC
        """, nativeQuery = true)
    List<ScreeningResult> findRankedResultsForJob(
            @Param("jobId") Long jobId
    );
}