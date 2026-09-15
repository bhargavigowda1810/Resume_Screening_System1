package resume_screening_backend.controller;

import resume_screening_backend.entity.ScreeningResult;
import resume_screening_backend.dto.ScreeningRankingDTO;
import resume_screening_backend.service.ScreeningService;
import resume_screening_backend.service.ScreeningResultService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/screening-results")
public class ScreeningResultController {

    private final ScreeningResultService screeningResultService;
    private final ScreeningService screeningService;

    public ScreeningResultController(
            ScreeningResultService screeningResultService,
            ScreeningService screeningService) {

        this.screeningResultService = screeningResultService;
        this.screeningService = screeningService;
    }

    // =========================================================
    // RUN SCREENING FOR AN APPLICATION
    // =========================================================

    @PostMapping("/application/{applicationId}/screen")
    public ResponseEntity<ScreeningResult> screenApplication(
            @PathVariable Long applicationId) {

        ScreeningResult result =
                screeningService.screenApplication(applicationId);

        return ResponseEntity.ok(result);
    }

    // =========================================================
    // SAVE SCREENING RESULT
    // =========================================================

    @PostMapping
    public ResponseEntity<ScreeningResult> saveResult(
            @RequestBody ScreeningResult result) {

        ScreeningResult savedResult =
                screeningResultService.saveResult(result);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedResult);
    }

// =========================================================
// Rank screening results for a job
// =========================================================
@GetMapping("/job/{jobId}/ranking")
public ResponseEntity<List<ScreeningRankingDTO>> getRankedResultsForJob(
        @PathVariable Long jobId) {

    List<ScreeningRankingDTO> results =
            screeningResultService.findRankedResultsForJob(jobId);

    return ResponseEntity.ok(results);
}

    // =========================================================
    // GET SCREENING RESULT BY ID
    // =========================================================

    @GetMapping("/{resultId}")
    public ResponseEntity<ScreeningResult> getResultById(
            @PathVariable Long resultId) {

        Optional<ScreeningResult> result =
                screeningResultService.findById(resultId);

        return result
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // =========================================================
    // GET SCREENING RESULT BY APPLICATION ID
    // =========================================================

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<ScreeningResult> getResultByApplicationId(
            @PathVariable Long applicationId) {

        Optional<ScreeningResult> result =
                screeningResultService.findByApplicationId(applicationId);

        return result
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // =========================================================
    // GET ALL SCREENING RESULTS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<ScreeningResult>> getAllResults() {

        return ResponseEntity.ok(
                screeningResultService.findAllResults()
        );
    }

    // =========================================================
    // UPDATE SCREENING RESULT
    // =========================================================

    @PutMapping("/{resultId}")
    public ResponseEntity<ScreeningResult> updateResult(
            @PathVariable Long resultId,
            @RequestBody ScreeningResult result) {

        Optional<ScreeningResult> existingResult =
                screeningResultService.findById(resultId);

        if (existingResult.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        result.setResultId(resultId);

        return ResponseEntity.ok(
                screeningResultService.updateResult(result)
        );
    }

    // =========================================================
    // DELETE SCREENING RESULT BY ID
    // =========================================================

    @DeleteMapping("/{resultId}")
    public ResponseEntity<Void> deleteResult(
            @PathVariable Long resultId) {

        Optional<ScreeningResult> existingResult =
                screeningResultService.findById(resultId);

        if (existingResult.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        screeningResultService.deleteResult(resultId);

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // DELETE SCREENING RESULT BY APPLICATION ID
    // =========================================================

    @DeleteMapping("/application/{applicationId}")
    public ResponseEntity<Void> deleteResultByApplicationId(
            @PathVariable Long applicationId) {

        Optional<ScreeningResult> existingResult =
                screeningResultService.findByApplicationId(applicationId);

        if (existingResult.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        screeningResultService.deleteByApplicationId(applicationId);

        return ResponseEntity.noContent().build();
    }
}

