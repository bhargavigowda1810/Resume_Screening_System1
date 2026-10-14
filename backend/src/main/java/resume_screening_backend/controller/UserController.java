package resume_screening_backend.controller;

import resume_screening_backend.entity.User;
import resume_screening_backend.dto.LoginRequest;
import resume_screening_backend.dto.LoginResponse;
import resume_screening_backend.dto.RegisterRequest;
import resume_screening_backend.dto.CreateRecruiterRequest;
import resume_screening_backend.service.UserService;
import resume_screening_backend.repository.RecruiterProfileRepository;
import resume_screening_backend.security.JwtService;
import resume_screening_backend.entity.Resume;
import resume_screening_backend.entity.ResumeProfile;
import resume_screening_backend.entity.ResumeSkill;
import resume_screening_backend.service.ResumeService;
import resume_screening_backend.service.ResumeProfileService;
import resume_screening_backend.service.EducationService;
import resume_screening_backend.service.ExperienceService;
import resume_screening_backend.service.ResumeSkillService;
import resume_screening_backend.repository.SkillRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import com.fasterxml.jackson.databind.JsonNode;

@RestController
@RequestMapping("/api/users")
public class UserController {

private final UserService userService;
private final RecruiterProfileRepository recruiterProfileRepository;
private final JwtService jwtService;

private final ResumeService resumeService;
private final ResumeProfileService resumeProfileService;
private final EducationService educationService;
private final ExperienceService experienceService;
private final ResumeSkillService resumeSkillService;
private final SkillRepository skillRepository;
public UserController(
        UserService userService,
        RecruiterProfileRepository recruiterProfileRepository,
        JwtService jwtService,
        ResumeService resumeService,
        ResumeProfileService resumeProfileService,
        EducationService educationService,
        ExperienceService experienceService,
        ResumeSkillService resumeSkillService,
        SkillRepository skillRepository) {

    this.userService = userService;
    this.recruiterProfileRepository = recruiterProfileRepository;
    this.jwtService = jwtService;

    this.resumeService = resumeService;
    this.resumeProfileService = resumeProfileService;
    this.educationService = educationService;
    this.experienceService = experienceService;
    this.resumeSkillService = resumeSkillService;
    this.skillRepository = skillRepository;
}
    // =========================================================
    // REGISTER
    // =========================================================

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(
            @RequestBody RegisterRequest request) {

        User user = userService.registerUser(
                request.getName(),
                request.getEmail(),
                request.getPassword()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(user);
    }

    
@PostMapping("/send-registration-otp")
public ResponseEntity<?> sendRegistrationOtp(
        @RequestBody Map<String, String> request) {

    String email = request.get("email");

    if (email == null || email.isBlank()) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", "Email is required."));
    }

    try {
        userService.generateRegistrationOtp(email.trim());

        return ResponseEntity.ok(
                Map.of("message", "Registration OTP sent successfully.")
        );
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
    }
}


@PostMapping("/verify-registration-otp")
public ResponseEntity<?> verifyRegistrationOtp(
        @RequestBody Map<String, String> request) {

    String email = request.get("email");
    String otp = request.get("otp");

    if (email == null || email.isBlank()
            || otp == null || otp.isBlank()) {
        return ResponseEntity.badRequest()
                .body(Map.of(
                        "message",
                        "Email and OTP are required."
                ));
    }

    try {
        userService.verifyRegistrationOtp(
                email.trim(),
                otp.trim()
        );

        return ResponseEntity.ok(
                Map.of("message", "Email verified successfully.")
        );
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
    }
}


    // =========================================================
    // LOGIN
    // =========================================================

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(
            @RequestBody LoginRequest request) {

        try {

            LoginResponse response =
                    userService.loginUser(
                            request.getEmail(),
                            request.getPassword()
                    );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");

        // Validate email
        if (email == null || email.isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body("Email is required.");
        }

        try {

            /*
             * UserService will:
             *
             * 1. Find the user by email
             * 2. Generate a reset token
             * 3. Save the token in PostgreSQL
             * 4. Create the reset URL
             * 5. Send the reset URL through Gmail
             *
             * The token itself is NOT returned to the frontend.
             */
            userService.createPasswordResetToken(email);

            /*
             * Same response is returned whether the email
             * exists or does not exist.
             *
             * This prevents revealing registered accounts.
             */
            return ResponseEntity.ok(
                    "If an account exists with this email, " +
                    "a password reset link has been sent to your email."
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // RESET PASSWORD
    // =========================================================

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestBody Map<String, String> request) {

        String token = request.get("token");
        String newPassword = request.get("newPassword");

        // Validate reset token
        if (token == null || token.isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body("Reset token is required.");
        }

        // Validate new password
        if (newPassword == null || newPassword.isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body("New password is required.");
        }

        try {

            userService.resetPassword(
                    token,
                    newPassword
            );

            return ResponseEntity.ok(
                    "Password reset successfully."
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // GET CURRENT LOGGED-IN USER
    // =========================================================

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(
            Authentication authentication) {

        Optional<User> user =
                userService.findByEmail(authentication.getName());

        return user
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }
    
@GetMapping("/me/recruiter-profile")
public ResponseEntity<?> getCurrentRecruiterProfile(
        Authentication authentication) {

    Optional<User> optionalUser =
            userService.findByEmail(authentication.getName());

    if (optionalUser.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User not found."));
    }

    User user = optionalUser.get();

    if (!"RECRUITER".equalsIgnoreCase(user.getRole())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "Recruiter access required."));
    }

    Optional<resume_screening_backend.entity.RecruiterProfile> optionalProfile =
            recruiterProfileRepository.findByUserUserId(user.getUserId());

    if (optionalProfile.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                        "message",
                        "Recruiter profile not found. Company details may not have been saved."
                ));
    }

    resume_screening_backend.entity.RecruiterProfile recruiterProfile =
            optionalProfile.get();

    Map<String, Object> profile = new LinkedHashMap<>();

    profile.put("userId", user.getUserId());
    profile.put("name", user.getName());
    profile.put("email", user.getEmail());
    profile.put("role", user.getRole());
    profile.put("emailVerified", user.isEmailVerified());

    profile.put("recruiterProfileId",
            recruiterProfile.getRecruiterProfileId());
    profile.put("phone", recruiterProfile.getPhone());
    profile.put("designation", recruiterProfile.getDesignation());

    profile.put("companyName", recruiterProfile.getCompanyName());
    profile.put("companyEmail", recruiterProfile.getCompanyEmail());
    profile.put("companyPhone", recruiterProfile.getCompanyPhone());
    profile.put("companyWebsite", recruiterProfile.getCompanyWebsite());
    profile.put("industry", recruiterProfile.getIndustry());
    profile.put("companySize", recruiterProfile.getCompanySize());
    profile.put("companyAddress", recruiterProfile.getCompanyAddress());

    return ResponseEntity.ok(profile);
}

@GetMapping("/me/profile")
public ResponseEntity<?> getCurrentUserProfile(
        Authentication authentication) {

    Optional<User> optionalUser =
            userService.findByEmail(authentication.getName());

    if (optionalUser.isEmpty()) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User not found."));
    }

    User user = optionalUser.get();

    // Find the user's resumes
    List<Resume> resumes =
            resumeService.findByApplicantId(user.getUserId());

    Map<String, Object> profile =
            new LinkedHashMap<>();

    // Basic user information
    profile.put("userId", user.getUserId());
    profile.put("name", user.getName());
    profile.put("email", user.getEmail());
    profile.put("role", user.getRole());

    // Default empty profile data
    profile.put("resumeId", null);
    profile.put("phone", null);
    profile.put("linkedin", null);
    profile.put("github", null);
    profile.put("portfolio", null);
    profile.put("education", new ArrayList<>());
    profile.put("experience", new ArrayList<>());
    profile.put("skills", new ArrayList<>());
    profile.put("projects", new ArrayList<>());
    profile.put("certifications", new ArrayList<>());
    profile.put("achievements", new ArrayList<>());

    // Use the first resume belonging to the logged-in user
   // Use the latest resume uploaded by the logged-in user
if (!resumes.isEmpty()) {

    Resume resume = resumes.stream()
            .max((r1, r2) -> r1.getUploadedAt().compareTo(r2.getUploadedAt()))
            .orElse(resumes.get(0));

    Long resumeId = resume.getResumeId();
        profile.put("resumeId", resumeId);

        // Resume profile
        Optional<ResumeProfile> optionalResumeProfile =
                resumeProfileService.findByResumeId(resumeId);

        if (optionalResumeProfile.isPresent()) {

            ResumeProfile resumeProfile =
                    optionalResumeProfile.get();

            profile.put("phone", resumeProfile.getPhone());
            profile.put("linkedin", resumeProfile.getLinkedin());
            profile.put("github", resumeProfile.getGithub());
            profile.put("portfolio", resumeProfile.getPortfolio());

            profile.put(
        "projects",
        toJsonArray(resumeProfile.getProjects())
);
            profile.put(
        "certifications",
        toJsonArray(resumeProfile.getCertifications())
);

            profile.put(
        "achievements",
        toJsonArray(resumeProfile.getAchievements())
);
        }

        // Education
        profile.put(
                "education",
                educationService.findByResumeId(resumeId)
        );

        // Experience
        profile.put(
                "experience",
                experienceService.findByResumeId(resumeId)
        );

        // Skills
        List<ResumeSkill> resumeSkills =
                resumeSkillService.findSkillsByResumeId(resumeId);

        List<String> skillNames =
                new ArrayList<>();

        for (ResumeSkill resumeSkill : resumeSkills) {

            Long skillId =
                    resumeSkill.getId().getSkillId();

            skillRepository.findById(skillId)
                    .ifPresent(skill ->
                            skillNames.add(
                                    skill.getSkillName()
                            )
                    );
        }

        profile.put("skills", skillNames);
    }

    return ResponseEntity.ok(profile);
}

    // =========================================================
    // GET ALL RECRUITERS - ADMIN
    // =========================================================

    @GetMapping("/admin/recruiters")
    public ResponseEntity<List<Map<String, Object>>> getAllRecruiters() {

        List<Map<String, Object>> recruiters =
                userService.findAll()
                        .stream()
                        .filter(user -> "RECRUITER".equals(user.getRole()))
                        .map(user -> {

                            Map<String, Object> recruiter =
                                    new java.util.LinkedHashMap<>();

                            recruiter.put("userId", user.getUserId());
                            recruiter.put("name", user.getName());
                            recruiter.put("email", user.getEmail());
                            recruiter.put("role", user.getRole());
                            recruiter.put("emailVerified", user.isEmailVerified());
                            recruiter.put("createdAt", user.getCreatedAt());

                            recruiterProfileRepository
                                    .findByUserUserId(user.getUserId())
                                    .ifPresent(profile -> {
                                        recruiter.put("phone", profile.getPhone());
                                        recruiter.put("designation", profile.getDesignation());
                                        recruiter.put("companyName", profile.getCompanyName());
                                        recruiter.put("companyEmail", profile.getCompanyEmail());
                                        recruiter.put("companyPhone", profile.getCompanyPhone());
                                        recruiter.put("companyWebsite", profile.getCompanyWebsite());
                                        recruiter.put("industry", profile.getIndustry());
                                        recruiter.put("companySize", profile.getCompanySize());
                                        recruiter.put("companyAddress", profile.getCompanyAddress());
                                    });

                            return recruiter;
                        })
                        .toList();

        return ResponseEntity.ok(recruiters);
    }
    // =========================================================
    // SEND RECRUITER EMAIL VERIFICATION OTP - ADMIN
    // =========================================================

    @PostMapping("/admin/recruiters/send-email-verification-otp")
    public ResponseEntity<String> sendRecruiterVerificationOtp(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");

        if (email == null || email.isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body("Email is required.");
        }

        try {
            userService.generateRecruiterVerificationOtp(
                    email.trim()
            );

            return ResponseEntity.ok(
                    "Verification OTP sent successfully."
            );

        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
    // =========================================================
    // VERIFY RECRUITER EMAIL OTP - ADMIN
    // =========================================================

    @PostMapping("/admin/recruiters/verify-email")
    public ResponseEntity<?> verifyRecruiterEmail(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || email.isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Email is required."));
        }

        if (otp == null || otp.isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "OTP is required."));
        }

        try {
            userService.verifyRecruiterVerificationOtp(
                    email.trim(),
                    otp.trim()
            );

            String verificationToken =
                    jwtService.generateEmailVerificationToken(
                            email.trim()
                    );

            return ResponseEntity.ok(
                    Map.of("verificationToken", verificationToken)
            );

        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }
    // =========================================================
    // CREATE RECRUITER - ADMIN
    // =========================================================

    @PostMapping("/admin/recruiters")
    public ResponseEntity<?> createRecruiter(
            @RequestBody CreateRecruiterRequest request) {

        if (request.getName() == null || request.getName().isBlank()
                || request.getEmail() == null || request.getEmail().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Name, email and password are required."
                    ));
        }

        String email = request.getEmail().trim();
        String verificationToken =
                request.getEmailVerificationToken();

        if (verificationToken == null
                || verificationToken.isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Email verification is required."
                    ));
        }

        if (!jwtService.isEmailVerificationTokenValid(
                verificationToken,
                email)) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Invalid or expired email verification token."
                    ));
        }

        try {
            User recruiter = userService.createRecruiter(
                    request.getName().trim(),
                    email,
                    request.getPassword(),
                    request.getPhone(),
                    request.getDesignation(),
                    request.getCompanyName(),
                    request.getCompanyEmail(),
                    request.getCompanyPhone(),
                    request.getCompanyWebsite(),
                    request.getIndustry(),
                    request.getCompanySize(),
                    request.getCompanyAddress()
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(recruiter);

        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // =========================================================
    // GET USER BY ID
    // =========================================================

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(
            @PathVariable Long userId) {

        Optional<User> user =
                userService.findById(userId);

        return user
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    // =========================================================
    // GET USER BY EMAIL
    // =========================================================

    @GetMapping("/email")
    public ResponseEntity<User> getUserByEmail(
            @RequestParam String email) {

        Optional<User> user =
                userService.findByEmail(email);

        return user
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    // =========================================================
    // GET ALL USERS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {

        return ResponseEntity.ok(
                userService.findAll()
        );
    }
private Object toJsonArray(JsonNode node) {
    if (node == null || node.isNull() || !node.isArray()) {
        return new ArrayList<>();
    }

    List<Object> items = new ArrayList<>();

    for (JsonNode item : node) {
        if (item.isObject()) {
            Map<String, Object> object = new LinkedHashMap<>();

            item.properties().forEach(entry ->
                    object.put(entry.getKey(), toJavaValue(entry.getValue()))
            );

            items.add(object);
        } else {
            items.add(toJavaValue(item));
        }
    }

    return items;
}

private Object toJavaValue(JsonNode node) {
    if (node == null || node.isNull()) {
        return null;
    }

    if (node.isObject()) {
        Map<String, Object> object = new LinkedHashMap<>();

        node.properties().forEach(entry ->
                object.put(entry.getKey(), toJavaValue(entry.getValue()))
        );

        return object;
    }

    if (node.isArray()) {
        List<Object> array = new ArrayList<>();

        for (JsonNode item : node) {
            array.add(toJavaValue(item));
        }

        return array;
    }

    if (node.isTextual()) return node.asText();
    if (node.isBoolean()) return node.asBoolean();
    if (node.isNumber()) return node.numberValue();

    return node.asText();
}
}












