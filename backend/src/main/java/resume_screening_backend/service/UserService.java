package resume_screening_backend.service;

import resume_screening_backend.entity.User;
import resume_screening_backend.entity.PasswordResetToken;
import resume_screening_backend.dto.LoginResponse;
import resume_screening_backend.repository.UserRepository;
import resume_screening_backend.repository.PasswordResetTokenRepository;

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

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            PasswordResetTokenRepository passwordResetTokenRepository,
            EmailService emailService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
    }

    // =========================================================
    // REGISTER
    // =========================================================

    public User registerUser(
            String name,
            String email,
            String password,
            String role) {

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();

        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(
                passwordEncoder.encode(password)
        );
        user.setRole(role);

        return userRepository.save(user);
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

        return new LoginResponse(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
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

