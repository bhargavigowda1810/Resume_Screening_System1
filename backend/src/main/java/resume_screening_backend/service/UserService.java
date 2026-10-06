package resume_screening_backend.service;

import resume_screening_backend.entity.User;
import resume_screening_backend.entity.PasswordResetToken;
import resume_screening_backend.dto.LoginResponse;
import resume_screening_backend.repository.UserRepository;
import resume_screening_backend.repository.PasswordResetTokenRepository;
import resume_screening_backend.entity.EmailOtp;
import resume_screening_backend.entity.RecruiterProfile;
import resume_screening_backend.repository.EmailOtpRepository;
import resume_screening_backend.repository.RecruiterProfileRepository;
import resume_screening_backend.security.JwtService;
import java.security.SecureRandom;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final EmailOtpRepository emailOtpRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final JwtService jwtService;
    public UserService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        PasswordResetTokenRepository passwordResetTokenRepository,
        EmailService emailService,
        EmailOtpRepository emailOtpRepository,
       RecruiterProfileRepository recruiterProfileRepository,
JwtService jwtService) {

    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.passwordResetTokenRepository = passwordResetTokenRepository;
    this.emailService = emailService;
    this.emailOtpRepository = emailOtpRepository;
    this.recruiterProfileRepository = recruiterProfileRepository;
    this.jwtService = jwtService;
}
private static final SecureRandom SECURE_RANDOM = new SecureRandom();

private String generateSixDigitOtp() {
    return String.format(
            "%06d",
            SECURE_RANDOM.nextInt(1_000_000)
    );
}

    // =========================================================
    // REGISTER
    // =========================================================

    public User registerUser(
        String name,
        String email,
        String password) {

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();

        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(
                passwordEncoder.encode(password)
        );
        user.setRole("APPLICANT");
        user.setCreatedAt(LocalDateTime.now());
        user.setEmailVerified(true);

        return userRepository.save(user);
    }

  // =========================================================
// CREATE RECRUITER BY ADMIN
// =========================================================

@Transactional
public User createRecruiter(
        String name,
        String email,
        String password,
        String phone,
        String designation,
        String companyName,
        String companyEmail,
        String companyPhone,
        String companyWebsite,
        String industry,
        String companySize,
        String companyAddress) {

    if (userRepository.existsByEmail(email)) {
        throw new RuntimeException("Email already registered");
    }

    // Create recruiter login account.
    User recruiter = new User();

    recruiter.setName(name);
    recruiter.setEmail(email);
    recruiter.setPasswordHash(
            passwordEncoder.encode(password)
    );
    recruiter.setRole("RECRUITER");
    recruiter.setCreatedAt(LocalDateTime.now());

    // Recruiter must verify email before login.
    recruiter.setEmailVerified(false);

    User savedRecruiter =
            userRepository.save(recruiter);

    // Create recruiter/company profile.
    RecruiterProfile recruiterProfile =
            new RecruiterProfile();

    recruiterProfile.setUser(savedRecruiter);
    recruiterProfile.setPhone(phone);
    recruiterProfile.setDesignation(designation);
    recruiterProfile.setCompanyName(companyName);
    recruiterProfile.setCompanyEmail(companyEmail);
    recruiterProfile.setCompanyPhone(companyPhone);
    recruiterProfile.setCompanyWebsite(companyWebsite);
    recruiterProfile.setIndustry(industry);
    recruiterProfile.setCompanySize(companySize);
    recruiterProfile.setCompanyAddress(companyAddress);

    recruiterProfileRepository.save(
            recruiterProfile
    );

    // Send recruiter verification OTP.
    generateRecruiterVerificationOtp(email);

    return savedRecruiter;
}  


// =========================================================
// GENERATE RECRUITER VERIFICATION OTP
// =========================================================

@Transactional
public void generateRecruiterVerificationOtp(
        String email) {

    User recruiter =
            userRepository.findByEmail(email)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Recruiter account not found"
                            )
                    );

    if (!"RECRUITER".equals(recruiter.getRole())) {
        throw new RuntimeException(
                "This account is not a recruiter account."
        );
    }

    // Remove any previous OTP.
    emailOtpRepository.deleteByEmail(email);

    // Generate a secure six-digit OTP.
    String otp = generateSixDigitOtp();

    // OTP expires after 5 minutes.
    LocalDateTime expiryDate =
            LocalDateTime.now().plusMinutes(5);

    EmailOtp emailOtp =
            new EmailOtp(
                    email,
                    otp,
                    expiryDate
            );

    emailOtpRepository.save(emailOtp);

    emailService.sendRegistrationOtp(
            email,
            otp
    );
}

// =========================================================
// VERIFY RECRUITER EMAIL OTP
// =========================================================

@Transactional
public void verifyRecruiterVerificationOtp(
        String email,
        String otp) {

    User recruiter =
            userRepository.findByEmail(email)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Recruiter account not found"
                            )
                    );

    if (!"RECRUITER".equals(recruiter.getRole())) {
        throw new RuntimeException(
                "This account is not a recruiter account."
        );
    }

    if (recruiter.isEmailVerified()) {
        throw new RuntimeException(
                "Recruiter email is already verified."
        );
    }

    EmailOtp emailOtp =
            emailOtpRepository
                    .findByEmail(email)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "No OTP found for this email"
                            )
                    );

    if (emailOtp.getExpiryDate()
            .isBefore(LocalDateTime.now())) {

        emailOtpRepository.delete(emailOtp);

        throw new RuntimeException(
                "OTP has expired. Please request a new OTP."
        );
    }

    if (!emailOtp.getOtp().equals(otp)) {
        throw new RuntimeException(
                "Invalid OTP."
        );
    }

    // OTP is valid — verify the recruiter's email.
    recruiter.setEmailVerified(true);
    userRepository.save(recruiter);

    // Prevent OTP reuse.
    emailOtpRepository.delete(emailOtp);
}

// =========================================================
// REGISTRATION EMAIL OTP
// =========================================================

@Transactional
public void generateRegistrationOtp(String email) {

    if (userRepository.existsByEmail(email)) {
        throw new RuntimeException("Email already registered");
    }

    // Delete any previous OTP for this email.
    emailOtpRepository.deleteByEmail(email);

    // Generate a secure six-digit OTP.
    String otp = generateSixDigitOtp();

    // OTP expires after 5 minutes.
    LocalDateTime expiryDate =
            LocalDateTime.now().plusMinutes(5);

    EmailOtp emailOtp =
            new EmailOtp(
                    email,
                    otp,
                    expiryDate
            );

    emailOtpRepository.save(emailOtp);

    // Send OTP to the user's email.
    emailService.sendRegistrationOtp(
            email,
            otp
    );
}
// =========================================================
// VERIFY REGISTRATION EMAIL OTP
// =========================================================

@Transactional
public void verifyRegistrationOtp(
        String email,
        String otp) {

    EmailOtp emailOtp =
            emailOtpRepository
                    .findByEmail(email)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "No OTP found for this email"
                            )
                    );

    // Check OTP expiry.
    if (emailOtp.getExpiryDate()
            .isBefore(LocalDateTime.now())) {

        emailOtpRepository.delete(emailOtp);

        throw new RuntimeException(
                "OTP has expired. Please request a new OTP."
        );
    }

    // Check OTP value.
    if (!emailOtp.getOtp().equals(otp)) {

        throw new RuntimeException(
                "Invalid OTP."
        );
    }

    // OTP is valid, so delete it to prevent reuse.
    emailOtpRepository.delete(emailOtp);
}
    // =========================================================
    // LOGIN
    // =========================================================

    public LoginResponse loginUser(
            String email,
            String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid email or password"
                        )
                );

        if (!passwordEncoder.matches(
                password,
                user.getPasswordHash())) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }
        if (!user.isEmailVerified()) {
                throw new RuntimeException(
                 "Please verify your email before logging in."
    );
}

        String token = jwtService.generateToken(user);

return new LoginResponse(
        user.getUserId(),
        user.getName(),
        user.getEmail(),
        user.getRole(),
        token
);
    }

    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

    @Transactional
    public String createPasswordResetToken(String email) {

        Optional<User> optionalUser =
                userRepository.findByEmail(email);

        /*
         * Do not reveal whether the email exists.
         */
        if (optionalUser.isEmpty()) {
            return null;
        }

        User user = optionalUser.get();

        /*
         * Delete previous reset tokens for this user.
         */
        passwordResetTokenRepository.deleteByUser(user);

        /*
         * Generate a new secure token.
         */
        String token =
                UUID.randomUUID().toString();

        /*
         * Token expires after 5 minutes.
         */
        LocalDateTime expiryDate =
                LocalDateTime.now().plusMinutes(5);

        PasswordResetToken resetToken =
                new PasswordResetToken(
                        token,
                        user,
                        expiryDate
                );

        passwordResetTokenRepository.save(resetToken);

        /*
         * Frontend reset-password page.
         */
        String resetLink =
                "http://localhost:5173/reset-password?token="
                        + token;

        /*
         * Send reset email.
         */
        emailService.sendPasswordResetEmail(
                user.getEmail(),
                resetLink
        );

        /*
         * Return token internally to the controller.
         */
        return token;
    }

    // =========================================================
    // RESET PASSWORD
    // =========================================================

    @Transactional
    public void resetPassword(
            String token,
            String newPassword) {

        PasswordResetToken resetToken =
                passwordResetTokenRepository
                        .findByToken(token)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid or expired reset token"
                                )
                        );

        /*
         * Check token expiry.
         */
        if (resetToken.getExpiryDate()
                .isBefore(LocalDateTime.now())) {

            passwordResetTokenRepository.delete(
                    resetToken
            );

            throw new RuntimeException(
                    "Invalid or expired reset token"
            );
        }

        User user = resetToken.getUser();

        /*
         * Encode the new password.
         */
        user.setPasswordHash(
                passwordEncoder.encode(newPassword)
        );

        userRepository.save(user);

        /*
         * Delete token so it cannot be reused.
         */
        passwordResetTokenRepository.delete(
                resetToken
        );
    }

    // =========================================================
    // FIND USER BY EMAIL
    // =========================================================

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // =========================================================
    // FIND USER BY ID
    // =========================================================

    public Optional<User> findById(Long userId) {
        return userRepository.findById(userId);
    }

    // =========================================================
    // GET ALL USERS
    // =========================================================

    public List<User> findAll() {
        return userRepository.findAll();
    }
}

