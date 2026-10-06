package resume_screening_backend.controller;

import resume_screening_backend.entity.User;
import resume_screening_backend.dto.LoginRequest;
import resume_screening_backend.dto.LoginResponse;
import resume_screening_backend.dto.RegisterRequest;
import resume_screening_backend.service.UserService;
import resume_screening_backend.service.ApplicantProfileService;
import resume_screening_backend.entity.RecruiterProfile;
import resume_screening_backend.repository.RecruiterProfileRepository;
import resume_screening_backend.dto.CreateRecruiterRequest;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
private final ApplicantProfileService applicantProfileService;
private final RecruiterProfileRepository recruiterProfileRepository;

    public UserController(
        UserService userService,
        ApplicantProfileService applicantProfileService,
        RecruiterProfileRepository recruiterProfileRepository) {

    this.userService = userService;
    this.applicantProfileService = applicantProfileService;
    this.recruiterProfileRepository = recruiterProfileRepository;
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
// CREATE RECRUITER
// =========================================================

@PostMapping("/recruiters")
public ResponseEntity<?> createRecruiter(
        @RequestBody CreateRecruiterRequest request) {

    try {

        User recruiter = userService.createRecruiter(
                request.getName(),
                request.getEmail(),
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
                .body(e.getMessage());
    }
}

// =========================================================
// ADMIN CREATE RECRUITER
// =========================================================

@PostMapping("/admin/recruiters")
public ResponseEntity<?> createRecruiterByAdmin(
        @RequestBody CreateRecruiterRequest request) {

    try {

        User recruiter = userService.createRecruiter(
                request.getName(),
                request.getEmail(),
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
                .body(e.getMessage());
    }
}
// =========================================================
// VERIFY RECRUITER EMAIL OTP
// =========================================================

@PostMapping("/recruiters/verify-otp")
public ResponseEntity<?> verifyRecruiterVerificationOtp(
        @RequestParam String email,
        @RequestParam String otp) {

    try {

        userService.verifyRecruiterVerificationOtp(email, otp);

        return ResponseEntity.ok("Recruiter email verified successfully.");

    } catch (RuntimeException e) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());
    }
}
// =========================================================
// RESEND RECRUITER EMAIL OTP
// =========================================================

@PostMapping("/recruiters/resend-otp")
public ResponseEntity<?> resendRecruiterVerificationOtp(
        @RequestParam String email) {

    try {

        userService.generateRecruiterVerificationOtp(email);

        return ResponseEntity.ok("New OTP sent successfully.");

    } catch (RuntimeException e) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());
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
// PASSWORD RESET OTP
// =========================================================

@PostMapping("/forgot-password-otp")
public ResponseEntity<String> forgotPasswordOtp(
        @RequestBody Map<String, String> request) {

    String email = request.get("email");

    if (email == null || email.isBlank()) {
        return ResponseEntity
                .badRequest()
                .body("Email is required.");
    }

    try {

        userService.generatePasswordResetOtp(email);

        return ResponseEntity.ok(
                "If an account exists with this email, " +
                "a password reset OTP has been sent to your email."
        );

    } catch (RuntimeException e) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());
    }
}
// =========================================================
// VERIFY PASSWORD RESET OTP
// =========================================================

@PostMapping("/verify-password-reset-otp")
public ResponseEntity<String> verifyPasswordResetOtp(
        @RequestBody Map<String, String> request) {

    String email = request.get("email");
    String otp = request.get("otp");

    if (email == null || email.isBlank()) {
        return ResponseEntity
                .badRequest()
                .body("Email is required.");
    }

    if (otp == null || otp.isBlank()) {
        return ResponseEntity
                .badRequest()
                .body("OTP is required.");
    }

    try {

    String token = userService.verifyPasswordResetOtp(
            email,
            otp
    );
        return ResponseEntity.ok(token);

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
@GetMapping("/profile")
public ResponseEntity<?> getProfile(
        Authentication authentication) {

    if (authentication == null || !authentication.isAuthenticated()) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                        "message",
                        "User is not authenticated."
                ));
    }

    String email = authentication.getName();

    Optional<User> optionalUser =
            userService.findByEmail(email);

    if (optionalUser.isEmpty()) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                        "message",
                        "User not found."
                ));
    }

    User user = optionalUser.get();

    // =====================================================
    // RECRUITER PROFILE
    // =====================================================

    if ("RECRUITER".equals(user.getRole())) {

        Optional<RecruiterProfile> optionalProfile =
                recruiterProfileRepository
                        .findByUserEmail(email);

        if (optionalProfile.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            "Recruiter profile not found."
                    ));
        }

        RecruiterProfile profile =
                optionalProfile.get();

        Map<String, Object> response =
                new java.util.LinkedHashMap<>();

        response.put("userId", user.getUserId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());

        response.put("phone", profile.getPhone());
        response.put("designation", profile.getDesignation());
        response.put("companyName", profile.getCompanyName());
        response.put("companyEmail", profile.getCompanyEmail());
        response.put("companyPhone", profile.getCompanyPhone());
        response.put("companyWebsite", profile.getCompanyWebsite());
        response.put("industry", profile.getIndustry());
        response.put("companySize", profile.getCompanySize());
        response.put("companyAddress", profile.getCompanyAddress());

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // APPLICANT PROFILE
    // =====================================================

    return applicantProfileService
            .getApplicantProfile(email)
            .map(ResponseEntity::ok)
            .orElseGet(() ->
                    ResponseEntity.notFound().build()
            );
}
}

