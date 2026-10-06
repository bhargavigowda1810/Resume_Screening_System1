package resume_screening_backend.controller;

import resume_screening_backend.entity.ResumeSkill;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import resume_screening_backend.service.ResumeSkillService;
import org.springframework.security.core.Authentication;
import resume_screening_backend.entity.User;
import resume_screening_backend.service.UserService;
import java.util.Optional;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/resume-skills")
public class ResumeSkillController {

    private final ResumeSkillService resumeSkillService;
private final UserService userService;

public ResumeSkillController(
        ResumeSkillService resumeSkillService,
        UserService userService) {

    this.resumeSkillService = resumeSkillService;
    this.userService = userService;
}

    // Add a skill to a resume
   @PostMapping
public ResponseEntity<ResumeSkill> addSkillToResume(
        @RequestParam Long resumeId,
        @RequestParam Long skillId,
        Authentication authentication) {

    Optional<User> user =
        userService.findByEmail(authentication.getName());

if (user.isEmpty()) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}

Long userId = user.get().getUserId();

    if (!resumeSkillService.isResumeOwnedByUser(resumeId, userId)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

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
        @PathVariable Long resumeId,
        Authentication authentication) {

    Optional<User> user =
        userService.findByEmail(authentication.getName());

if (user.isEmpty()) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}

Long userId = user.get().getUserId();

    if (!resumeSkillService.isResumeOwnedByUser(resumeId, userId)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

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
        @RequestParam Long skillId,
        Authentication authentication) {

    Optional<User> user =
        userService.findByEmail(authentication.getName());

if (user.isEmpty()) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}

Long userId = user.get().getUserId();

    if (!resumeSkillService.isResumeOwnedByUser(resumeId, userId)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    return ResponseEntity.ok(
            resumeSkillService.exists(resumeId, skillId)
    );
}

    // Remove a skill from a resume
   @DeleteMapping
public ResponseEntity<Void> removeSkillFromResume(
        @RequestParam Long resumeId,
        @RequestParam Long skillId,
        Authentication authentication) {

    Optional<User> user =
        userService.findByEmail(authentication.getName());

if (user.isEmpty()) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}

Long userId = user.get().getUserId();

    if (!resumeSkillService.isResumeOwnedByUser(resumeId, userId)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

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
    // Update all skills for a resume
@PutMapping("/resume/{resumeId}")
public ResponseEntity<?> updateSkillsForResume(
        @PathVariable Long resumeId,
        @RequestBody List<String> skillNames,
        Authentication authentication) {

    if (authentication == null ||
            !authentication.isAuthenticated()) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                        "message",
                        "User is not authenticated."
                ));
    }

    try {
        String email = authentication.getName();

        List<String> updatedSkills =
                resumeSkillService.updateSkillsForResume(
                        resumeId,
                        skillNames,
                        email
                );

        return ResponseEntity.ok(updatedSkills);

    } catch (IllegalArgumentException e) {

        return ResponseEntity
                .badRequest()
                .body(Map.of(
                        "message",
                        e.getMessage()
                ));

    } catch (Exception e) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "message",
                        "Unable to update skills."
                ));
    }
}
   }