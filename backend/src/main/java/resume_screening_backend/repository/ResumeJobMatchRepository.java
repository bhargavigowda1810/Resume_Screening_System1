package resume_screening_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import resume_screening_backend.entity.ResumeEmbedding;

import java.util.List;

public interface ResumeJobMatchRepository
        extends JpaRepository<ResumeEmbedding, Long> {

    // =========================================================
    // Find semantic similarity between one resume and one job
    // =========================================================

    @Query(value = """
        SELECT
            re.resume_id AS resumeId,
            je.job_id AS jobId,
            1 - (re.embedding <=> je.embedding) AS similarity
        FROM resume_embeddings re
        CROSS JOIN job_embeddings je
        WHERE re.resume_id = :resumeId
          AND je.job_id = :jobId
        """, nativeQuery = true)
    MatchResult findSimilarity(
            @Param("resumeId") Long resumeId,
            @Param("jobId") Long jobId
    );

    // =========================================================
    // Rank all resumes for a job using semantic similarity
    // =========================================================

    @Query(value = """
        SELECT
            re.resume_id AS resumeId,
            je.job_id AS jobId,
            1 - (re.embedding <=> je.embedding) AS similarity
        FROM resume_embeddings re
        CROSS JOIN job_embeddings je
        WHERE je.job_id = :jobId
        ORDER BY similarity DESC
        """, nativeQuery = true)
    List<MatchResult> findRankedResumesForJob(
            @Param("jobId") Long jobId
    );

    // =========================================================
    // Get skill names belonging to a resume
    // =========================================================

    @Query(value = """
        SELECT s.skill_name
        FROM resume_skills rs
        JOIN skills s
          ON s.skill_id = rs.skill_id
        WHERE rs.resume_id = :resumeId
        ORDER BY s.skill_name
        """, nativeQuery = true)
    List<String> findSkillNamesByResumeId(
            @Param("resumeId") Long resumeId
    );

    // =========================================================
    // Get required skill names for a job
    //
    // required_skills is currently stored as:
    // "Python, SQL, PostgreSQL, Pandas"
    //
    // This query converts that comma-separated value into
    // individual skill names.
    // =========================================================

    @Query(value = """
        SELECT trim(skill)
        FROM jobs,
             regexp_split_to_table(required_skills, ',') AS skill
        WHERE job_id = :jobId
          AND required_skills IS NOT NULL
          AND trim(skill) <> ''
        """, nativeQuery = true)
    List<String> findRequiredSkillsByJobId(
            @Param("jobId") Long jobId
    );

    // =========================================================
    // Projection for semantic similarity
    // =========================================================

    interface MatchResult {

        Long getResumeId();

        Long getJobId();

        Double getSimilarity();
    }
}

