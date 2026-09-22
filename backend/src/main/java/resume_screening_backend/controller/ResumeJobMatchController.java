package resume_screening_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import resume_screening_backend.repository.ResumeJobMatchRepository.MatchResult;
import resume_screening_backend.service.ResumeJobMatchService;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
public class ResumeJobMatchController {

    private final ResumeJobMatchService resumeJobMatchService;

    public ResumeJobMatchController(
            ResumeJobMatchService resumeJobMatchService) {
        this.resumeJobMatchService = resumeJobMatchService;
    }

    // =========================================================
    // Match one resume with one job
    // =========================================================

    @GetMapping("/resume/{resumeId}/job/{jobId}")
    public ResponseEntity<MatchResult> findSimilarity(
            @PathVariable Long resumeId,
            @PathVariable Long jobId) {

        MatchResult result =
                resumeJobMatchService.findSimilarity(
                        resumeId,
                        jobId
                );

        if (result == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(result);
    }

    // =========================================================
    // Rank all resumes for a job
    // =========================================================

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<MatchResult>> findRankedResumesForJob(
            @PathVariable Long jobId) {

        List<MatchResult> results =
                resumeJobMatchService.findRankedResumesForJob(jobId);

        return ResponseEntity.ok(results);
    }
}