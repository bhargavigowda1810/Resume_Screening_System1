
package resume_screening_backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import resume_screening_backend.entity.Experience;
import resume_screening_backend.service.ExperienceService;

import resume_screening_backend.entity.Education;
import resume_screening_backend.entity.Resume;
import resume_screening_backend.entity.User;
import resume_screening_backend.service.EducationService;
import resume_screening_backend.service.ResumeService;
import resume_screening_backend.service.UserService;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;


import resume_screening_backend.entity.ResumeProfile;
import resume_screening_backend.service.ResumeProfileService;

import java.util.UUID;
import java.util.function.Function;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/applicant-profile")
public class ApplicantProfileController {

    private final EducationService educationService;
    private final ResumeService resumeService;
    private final UserService userService;
    private final ExperienceService experienceService;
    private final ResumeProfileService resumeProfileService;


public ApplicantProfileController(
        EducationService educationService,
        ResumeService resumeService,
        UserService userService,
                ExperienceService experienceService,
        ResumeProfileService resumeProfileService) {

    this.educationService = educationService;
    this.resumeService = resumeService;
    this.userService = userService;
    this.experienceService = experienceService;
    this.resumeProfileService = resumeProfileService;
   
}

    private Optional<User> currentUser(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        return userService.findByEmail(authentication.getName());
    }

    private Optional<Resume> latestResume(Long userId) {
        List<Resume> resumes = resumeService.findByApplicantId(userId);
        if (resumes == null || resumes.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(resumes.get(resumes.size() - 1));
    }

    @PostMapping("/education")
    public ResponseEntity<?> addEducation(
            @RequestBody Education education,
            Authentication authentication) {

        Optional<User> user = currentUser(authentication);
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User is not authenticated."));
        }

        Optional<Resume> resume = latestResume(user.get().getUserId());
        if (resume.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Upload a resume before adding education."));
        }

        education.setEducationId(null);
        education.setResumeId(resume.get().getResumeId());

        Education saved = educationService.saveEducation(education);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/education/{educationId}")
    public ResponseEntity<?> updateEducation(
            @PathVariable Long educationId,
            @RequestBody Education updated,
            Authentication authentication) {

        Optional<User> user = currentUser(authentication);
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User is not authenticated."));
        }

        if (!educationService.isOwnedByUser(
                educationId, user.get().getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You cannot edit this education record."));
        }

        try {
            Optional<Education> saved = educationService.updateEducation(
                    educationId, updated, authentication.getName());

            return saved.<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", exception.getMessage()));
        }
    }

    @GetMapping("/education")
    public ResponseEntity<?> getEducation(
            Authentication authentication) {

        Optional<User> user = currentUser(authentication);
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User is not authenticated."));
        }

        Optional<Resume> resume = latestResume(user.get().getUserId());
        if (resume.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        return ResponseEntity.ok(
                educationService.findByResumeId(resume.get().getResumeId()));
    }
    
@GetMapping("/experience")
public ResponseEntity<?> getExperience(Authentication authentication) {
    Optional<User> user = currentUser(authentication);

    if (user.isEmpty()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "User is not authenticated."));
    }

    Optional<Resume> resume = latestResume(user.get().getUserId());

    if (resume.isEmpty()) {
        return ResponseEntity.ok(List.of());
    }

    return ResponseEntity.ok(
            experienceService.findByResumeId(resume.get().getResumeId()));
}

@PostMapping("/experience")
public ResponseEntity<?> addExperience(
        @RequestBody Experience experience,
        Authentication authentication) {

    Optional<User> user = currentUser(authentication);

    if (user.isEmpty()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "User is not authenticated."));
    }

    Optional<Resume> resume = latestResume(user.get().getUserId());

    if (resume.isEmpty()) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", "Upload a resume before adding experience."));
    }

    experience.setExperienceId(null);
    experience.setResumeId(resume.get().getResumeId());

   try {
    Experience saved = experienceService.createExperience(
            experience, authentication.getName());

    return ResponseEntity.status(HttpStatus.CREATED).body(saved);

} catch (IllegalArgumentException exception) {
    return ResponseEntity.badRequest()
            .body(Map.of("message", exception.getMessage()));
}
}

@PutMapping("/experience/{experienceId}")
public ResponseEntity<?> updateExperience(
        @PathVariable Long experienceId,
        @RequestBody Experience experience,
        Authentication authentication) {

    Optional<User> user = currentUser(authentication);

    if (user.isEmpty()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "User is not authenticated."));
    }

    if (!experienceService.isOwnedByUser(
            experienceId, user.get().getUserId())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "You cannot edit this experience record."));
    }

    try {
Experience updated = experienceService.updateExperience(
        experienceId, experience, authentication.getName());

return ResponseEntity.ok(updated);
    } catch (IllegalArgumentException exception) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", exception.getMessage()));
    }
}

@DeleteMapping("/experience/{experienceId}")
public ResponseEntity<?> deleteExperience(
        @PathVariable Long experienceId,
        Authentication authentication) {

    Optional<User> user = currentUser(authentication);

    if (user.isEmpty()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "User is not authenticated."));
    }

    if (!experienceService.isOwnedByUser(
            experienceId, user.get().getUserId())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "You cannot delete this experience record."));
    }

    experienceService.deleteExperience(experienceId);
    return ResponseEntity.noContent().build();
}

private Optional<ResumeProfile> getOwnedProfile(Authentication authentication) {
    Optional<User> user = currentUser(authentication);

    if (user.isEmpty()) {
        return Optional.empty();
    }

    Optional<Resume> resume = latestResume(user.get().getUserId());

    if (resume.isEmpty()) {
        return Optional.empty();
    }

    Optional<ResumeProfile> existing =
            resumeProfileService.findByResumeId(resume.get().getResumeId());

    if (existing.isPresent()) {
        return existing;
    }

    // Create only when no profile exists for this resume.
    ResumeProfile profile = new ResumeProfile();
    profile.setResumeId(resume.get().getResumeId());
    profile.setProjects(com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.arrayNode());
    profile.setCertifications(com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.arrayNode());
    profile.setAchievements(com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.arrayNode());

    return Optional.of(resumeProfileService.saveResumeProfile(profile));
}

private ArrayNode getArray(JsonNode node) {
    if (node instanceof ArrayNode array) {
        return array;
    }
    return JsonNodeFactory.instance.arrayNode();
}

private ResponseEntity<?> listItems(
        Authentication authentication,
        Function<ResumeProfile, JsonNode> getter,
        String idField) {

    if (currentUser(authentication).isEmpty()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "User is not authenticated."));
    }

    Optional<ResumeProfile> optional = getOwnedProfile(authentication);

    if (optional.isEmpty()) {
        return ResponseEntity.ok(List.of());
    }

    ResumeProfile profile = optional.get();
    ArrayNode items = getArray(getter.apply(profile));
    boolean changed = false;

    // Give existing entries stable IDs so they can be edited/deleted.
    for (JsonNode node : items) {
        if (node instanceof ObjectNode item
                && !item.hasNonNull(idField)) {
            item.put(idField, UUID.randomUUID().toString());
            changed = true;
        }
    }

    if (changed) {
        saveArray(profile, idField, items);
    }

    return ResponseEntity.ok(items);
}

private void saveArray(
        ResumeProfile profile,
        String idField,
        ArrayNode items) {

    switch (idField) {
        case "projectId" -> profile.setProjects(items);
        case "certificationId" -> profile.setCertifications(items);
        case "achievementId" -> profile.setAchievements(items);
        default -> throw new IllegalArgumentException("Unknown profile section.");
    }

    resumeProfileService.saveResumeProfile(profile);
}


private ResponseEntity<?> addItem(
        Authentication authentication,
        Map<String, Object> payload,
        String idField) {

    if (authentication == null || authentication.getName() == null) {
        return ResponseEntity.status(401).body("Not authenticated");
    }

    Optional<ResumeProfile> optional = getOwnedProfile(authentication);
if (optional.isEmpty()) {
    return ResponseEntity.notFound().build();
}
ResumeProfile profile = optional.get();

    ArrayNode items = getArray(getItems(profile, idField));

    ObjectNode item = toObjectNode(payload);
    item.put(idField, UUID.randomUUID().toString());
    items.add(item);

    saveArray(profile, idField, items);
    return ResponseEntity.ok(items);
}

private ResponseEntity<?> editItem(
        Authentication authentication,
        String itemId,
        Map<String, Object> payload,
        String idField) {

    if (authentication == null || authentication.getName() == null) {
        return ResponseEntity.status(401).body("Not authenticated");
    }

Optional<ResumeProfile> optional = getOwnedProfile(authentication);

if (optional.isEmpty()) {
    return ResponseEntity.notFound().build();
}

ResumeProfile profile = optional.get();
    if (profile == null) {
        return ResponseEntity.badRequest().body("Resume profile not found");
    }

    ArrayNode items = getArray(getItems(profile, idField));

    for (int i = 0; i < items.size(); i++) {
        JsonNode current = items.get(i);

        if (current != null
        && itemId.equals(current.path(idField).asText())) {
            ObjectNode updated = toObjectNode(payload);
            updated.put(idField, itemId);
            items.set(i, updated);

            saveArray(profile, idField, items);
            return ResponseEntity.ok(items);
        }
    }

    return ResponseEntity.notFound().build();
}

private ObjectNode toObjectNode(Map<String, Object> payload) {
    ObjectNode result = JsonNodeFactory.instance.objectNode();

    if (payload == null) {
        return result;
    }

    payload.forEach((key, value) -> {
        if (value == null) {
            result.set(key, JsonNodeFactory.instance.nullNode());
        } else if (value instanceof String text) {
            result.put(key, text);
        } else if (value instanceof Integer number) {
            result.put(key, number);
        } else if (value instanceof Long number) {
            result.put(key, number);
        } else if (value instanceof Double number) {
            result.put(key, number);
        } else if (value instanceof Boolean bool) {
            result.put(key, bool);
        } else if (value instanceof List<?> list) {
            ArrayNode array = JsonNodeFactory.instance.arrayNode();
            for (Object element : list) {
                if (element instanceof String text) {
                    array.add(text);
                } else if (element != null) {
                    array.add(element.toString());
                } else {
                    array.addNull();
                }
            }
            result.set(key, array);
        } else {
            result.put(key, value.toString());
        }
    });

    return result;
}


private ResponseEntity<?> removeItem(
        Authentication authentication,
        String itemId,
        String idField) {

    if (currentUser(authentication).isEmpty()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "User is not authenticated."));
    }

    Optional<ResumeProfile> optional = getOwnedProfile(authentication);

    if (optional.isEmpty()) {
        return ResponseEntity.notFound().build();
    }

    ResumeProfile profile = optional.get();
    ArrayNode items = getArray(getItems(profile, idField));
    ArrayNode remaining = JsonNodeFactory.instance.arrayNode();
    boolean found = false;

    for (JsonNode item : items) {
        if (item instanceof ObjectNode object
                && object.hasNonNull(idField)
                && itemId.equals(object.get(idField).asText())) {
            found = true;
        } else {
            remaining.add(item);
        }
    }

    if (!found) {
        return ResponseEntity.notFound().build();
    }

    saveArray(profile, idField, remaining);
    return ResponseEntity.noContent().build();
}

private JsonNode getItems(ResumeProfile profile, String idField) {
    return switch (idField) {
        case "projectId" -> profile.getProjects();
        case "certificationId" -> profile.getCertifications();
        case "achievementId" -> profile.getAchievements();
        default -> JsonNodeFactory.instance.objectNode();
    };
}

    // Projects
    @GetMapping("/projects")
    public ResponseEntity<?> getProjects(Authentication auth) {
        return listItems(auth, ResumeProfile::getProjects, "projectId");
    }

    @PostMapping("/projects")
    public ResponseEntity<?> addProject(
            @RequestBody Map<String, Object> body, Authentication auth) {
        return addItem(auth, body, "projectId");
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<?> editProject(
            @PathVariable String id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        return editItem(auth, id, body, "projectId");
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<?> deleteProject(
            @PathVariable String id, Authentication auth) {
        return removeItem(auth, id, "projectId");
    }

    // Certifications
    @GetMapping("/certifications")
    public ResponseEntity<?> getCertifications(Authentication auth) {
        return listItems(auth, ResumeProfile::getCertifications, "certificationId");
    }

    @PostMapping("/certifications")
    public ResponseEntity<?> addCertification(
            @RequestBody Map<String, Object> body, Authentication auth) {
        return addItem(auth, body, "certificationId");
    }

    @PutMapping("/certifications/{id}")
    public ResponseEntity<?> editCertification(
            @PathVariable String id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        return editItem(auth, id, body, "certificationId");
    }

    @DeleteMapping("/certifications/{id}")
    public ResponseEntity<?> deleteCertification(
            @PathVariable String id, Authentication auth) {
        return removeItem(auth, id, "certificationId");
    }

    // Achievements
    @GetMapping("/achievements")
    public ResponseEntity<?> getAchievements(Authentication auth) {
        return listItems(auth, ResumeProfile::getAchievements, "achievementId");
    }

    @PostMapping("/achievements")
    public ResponseEntity<?> addAchievement(
            @RequestBody Map<String, Object> body, Authentication auth) {
        return addItem(auth, body, "achievementId");
    }

    @PutMapping("/achievements/{id}")
    public ResponseEntity<?> editAchievement(
            @PathVariable String id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        return editItem(auth, id, body, "achievementId");
    }

    @DeleteMapping("/achievements/{id}")
    public ResponseEntity<?> deleteAchievement(
            @PathVariable String id, Authentication auth) {
        return removeItem(auth, id, "achievementId");
    }


}
