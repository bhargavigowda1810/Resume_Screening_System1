package resume_screening_backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(
            String recipientEmail,
            String resetLink) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(recipientEmail);

        message.setSubject(
                "Resume Screening System - Password Reset"
        );

        message.setText(
                "Hello,\n\n" +
                "We received a request to reset your password " +
                "for the Resume Screening System.\n\n" +
                "Click the link below to reset your password:\n\n" +
                resetLink +
                "\n\n" +
                "This link will expire in 5 minutes.\n\n" +
                "If you did not request a password reset, " +
                "you can safely ignore this email.\n\n" +
                "Regards,\n" +
                "Resume Screening System"
        );

        mailSender.send(message);
    }
}