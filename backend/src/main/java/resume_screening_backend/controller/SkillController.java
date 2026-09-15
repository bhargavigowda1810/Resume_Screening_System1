package resume_screening_backend.controller;

import resume_screening_backend.entity.Skill;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import resume_screening_backend.service.SkillService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    // Create a skill
    @PostMapping
    public ResponseEntity<Skill> saveSkill(
            @RequestBody Skill skill) {

        Skill savedSkill = skillService.saveSkill(skill);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedSkill);
    }

    // Get skill by ID
    @GetMapping("/{skillId}")
    public ResponseEntity<Skill> getSkillById(
            @PathVariable Long skillId) {

        Optional<Skill> skill = skillService.findById(skillId);

        return skill
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // Get skill by name
    @GetMapping("/search")
    public ResponseEntity<Skill> getSkillByName(
            @RequestParam String name) {

        Optional<Skill> skill =
                skillService.findBySkillName(name);

        return skill
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // Get all skills
    @GetMapping
    public ResponseEntity<List<Skill>> getAllSkills() {

        return ResponseEntity.ok(
                skillService.findAllSkills()
        );
    }

    // Get existing skill or create a new one
    @PostMapping("/get-or-create")
    public ResponseEntity<Skill> getOrCreateSkill(
            @RequestParam String name) {

        Skill skill = skillService.getOrCreateSkill(name);

        return ResponseEntity.ok(skill);
    }

    // Update skill
@PutMapping("/{skillId}")
public ResponseEntity<Skill> updateSkill(
        @PathVariable Long skillId,
        @RequestBody Skill skill) {

    Optional<Skill> existingSkill =
            skillService.findById(skillId);

    if (existingSkill.isEmpty()) {
        return ResponseEntity.notFound().build();
    }

    skill.setSkillId(skillId);

    return ResponseEntity.ok(
            skillService.updateSkill(skill)
    );
}

    // Delete skill
    @DeleteMapping("/{skillId}")
    public ResponseEntity<Void> deleteSkill(
            @PathVariable Long skillId) {

        Optional<Skill> existingSkill =
                skillService.findById(skillId);

        if (existingSkill.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        skillService.deleteSkill(skillId);

        return ResponseEntity.noContent().build();
    }
}