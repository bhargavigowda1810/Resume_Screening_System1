
package resume_screening_backend.controller;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import resume_screening_backend.entity.User;
import resume_screening_backend.service.ProfileAutofillService;
import resume_screening_backend.service.UserService;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/resumes")
public class ProfileAutofillController {

    private final ProfileAutofillService profileAutofillService;
    private final UserService userService;

    public ProfileAutofillController(
            ProfileAutofillService profileAutofillService,
            UserService userService) {
        this.profileAutofillService = profileAutofillService;
        this.userService = userService;
    }

    @PostMapping(
            value = "/profile-autofill",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> profileAutofill(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Please log in to use Profile Autofill."));
        }

        Optional<User> user = userService.findByEmail(authentication.getName());

        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authenticated user was not found."));
        }

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Please upload a resume file."));
        }

        try {
            String response = profileAutofillService.extractProfileSuggestions(file);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            System.err.println("Profile Autofill failed: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "error",
                            "Profile Autofill could not reach or process the AI service."
                    ));
        }
    }
}
