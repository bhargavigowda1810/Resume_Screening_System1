package resume_screening_backend.controller;

import resume_screening_backend.entity.ResumeSkill;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import resume_screening_backend.service.ResumeSkillService;

import java.util.List;

@RestController
@RequestMapping("/api/resume-skills")
public class ResumeSkillController {

    private final ResumeSkillService resumeSkillService;

    public ResumeSkillController(ResumeSkillService resumeSkillService) {
        this.resumeSkillService = resumeSkillService;
    }

    // Add a skill to a resume
    @PostMapping
    public ResponseEntity<ResumeSkill> addSkillToResume(
            @RequestParam Long resumeId,
            @RequestParam Long skillId) {

        ResumeSkill resumeSkill =
                resumeSkillService.addSkillToResume(
                        resumeId,
                        skillId
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(resumeSkill);
    }

    // Get all skills assigned to a resume
    @GetMapping("/resume/{resumeId}")
    public ResponseEntity<List<ResumeSkill>> getSkillsByResume(
            @PathVariable Long resumeId) {

        return ResponseEntity.ok(
                resumeSkillService.findSkillsByResumeId(resumeId)
        );
    }

    // Get all resumes using a skill
    @GetMapping("/skill/{skillId}")
    public ResponseEntity<List<ResumeSkill>> getResumesBySkill(
            @PathVariable Long skillId) {

        return ResponseEntity.ok(
                resumeSkillService.findResumesBySkillId(skillId)
        );
    }

    // Check whether a skill is already assigned to a resume
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkResumeSkill(
            @RequestParam Long resumeId,
            @RequestParam Long skillId) {

        return ResponseEntity.ok(
                resumeSkillService.exists(resumeId, skillId)
        );
    }

    // Remove a skill from a resume
    @DeleteMapping
    public ResponseEntity<Void> removeSkillFromResume(
            @RequestParam Long resumeId,
            @RequestParam Long skillId) {

        if (!resumeSkillService.exists(resumeId, skillId)) {
            return ResponseEntity.notFound().build();
        }

        resumeSkillService.removeSkillFromResume(
                resumeId,
                skillId
        );

        return ResponseEntity.noContent().build();
    }

    // Get all resume-skill mappings
    @GetMapping
    public ResponseEntity<List<ResumeSkill>> getAllResumeSkills() {

        return ResponseEntity.ok(
                resumeSkillService.findAll()
        );
    }
}