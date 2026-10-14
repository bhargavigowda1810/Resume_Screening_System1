package resume_screening_backend.controller;

import resume_screening_backend.entity.ScreeningResult;
import resume_screening_backend.dto.ScreeningRankingDTO;
import resume_screening_backend.service.ScreeningService;
import resume_screening_backend.service.ScreeningResultService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;


import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
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
    // RUN SCREENING FOR ALL APPLICATIONS IN A JOB
    // =========================================================

    @PostMapping("/job/{jobId}/screen")
    public ResponseEntity<List<ScreeningResult>> screenJob(
            @PathVariable Long jobId) {

        List<ScreeningResult> results =
                screeningService.screenApplicationsForJob(jobId);

        return ResponseEntity.ok(results);
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


@GetMapping("/job/{jobId}/export")
public ResponseEntity<byte[]> exportRankedResultsForJob(
        @PathVariable Long jobId) throws IOException {

    List<ScreeningRankingDTO> results =
            screeningResultService.findRankedResultsForJob(jobId);

    try (Workbook workbook = new XSSFWorkbook();
         ByteArrayOutputStream outputStream =
                 new ByteArrayOutputStream()) {

        Sheet sheet = workbook.createSheet("Screening Results");

        String[] headers = {
                "Result ID", "Application ID", "Applicant ID",
                "Resume ID", "Applicant Name", "Applicant Email",
                "Resume File Name", "Similarity Score", "Skills Score",
                "Experience Score", "Education Score", "Final Score",
                "Recommendation", "Processed At"
        };

        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);

        Row headerRow = sheet.createRow(0);

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        int rowIndex = 1;

        for (ScreeningRankingDTO result : results) {
            Row row = sheet.createRow(rowIndex++);

            Object[] values = {
                    result.getResultId(),
                    result.getApplicationId(),
                    result.getApplicantId(),
                    result.getResumeId(),
                    result.getApplicantName(),
                    result.getApplicantEmail(),
                    result.getResumeFileName(),
                    result.getSimilarityScore(),
                    result.getSkillsScore(),
                    result.getExperienceScore(),
                    result.getEducationScore(),
                    result.getFinalScore(),
                    result.getRecommendation(),
                    result.getProcessedAt()
            };

            for (int i = 0; i < values.length; i++) {
                Cell cell = row.createCell(i);
                Object value = values[i];

                if (value == null) {
                    cell.setBlank();
                } else if (value instanceof Number number) {
                    cell.setCellValue(number.doubleValue());
                } else {
                    cell.setCellValue(value.toString());
                }
            }
        }

        sheet.createFreezePane(0, 1);

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        workbook.write(outputStream);
        byte[] fileBytes = outputStream.toByteArray();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"screening-results-job-"
                                + jobId + ".xlsx\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(fileBytes.length)
                .body(fileBytes);
    }
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

