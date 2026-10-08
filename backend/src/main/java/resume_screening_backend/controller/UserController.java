package resume_screening_backend.controller;

import resume_screening_backend.entity.User;
import resume_screening_backend.dto.LoginRequest;
import resume_screening_backend.dto.LoginResponse;
import resume_screening_backend.dto.RegisterRequest;
import resume_screening_backend.dto.CreateRecruiterRequest;
import resume_screening_backend.service.UserService;
import resume_screening_backend.repository.RecruiterProfileRepository;
import resume_screening_backend.security.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final JwtService jwtService;

    public UserController(UserService userService, RecruiterProfileRepository recruiterProfileRepository, JwtService jwtService) {
        this.userService = userService;
        this.recruiterProfileRepository = recruiterProfileRepository;
        this.jwtService = jwtService;
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
}












