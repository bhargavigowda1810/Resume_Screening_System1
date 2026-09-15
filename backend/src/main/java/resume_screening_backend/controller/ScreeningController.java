package resume_screening_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import resume_screening_backend.entity.ScreeningResult;
import resume_screening_backend.service.ScreeningService;

@RestController
@RequestMapping("/api/screening")
public class ScreeningController {

    private final ScreeningService screeningService;

    public ScreeningController(
            ScreeningService screeningService) {

        this.screeningService = screeningService;
    }

    // =========================================================
    // SCREEN APPLICATION
    // =========================================================

    @PostMapping("/application/{applicationId}")
    public ResponseEntity<ScreeningResult> screenApplication(
            @PathVariable Long applicationId) {

        ScreeningResult result =
                screeningService.screenApplication(
                        applicationId
                );

        return ResponseEntity.ok(result);
    }
}