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

    // =========================================================
    // PASSWORD RESET EMAIL
    // =========================================================

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

    // =========================================================
    // REGISTRATION EMAIL OTP
    // =========================================================

    public void sendRegistrationOtp(
            String recipientEmail,
            String otp) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(recipientEmail);

        message.setSubject(
                "Resume Screening System - Email Verification OTP"
        );

        message.setText(
                "Hello,\n\n" +
                "Thank you for registering with the " +
                "Resume Screening System.\n\n" +
                "Your email verification OTP is:\n\n" +
                otp +
                "\n\n" +
                "This OTP will expire in 5 minutes.\n\n" +
                "If you did not request this registration, " +
                "you can safely ignore this email.\n\n" +
                "Regards,\n" +
                "Resume Screening System"
        );

        mailSender.send(message);
    }

    // =========================================================
    // PASSWORD RESET OTP
    // =========================================================

    public void sendPasswordResetOtp(
            String recipientEmail,
            String otp) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(recipientEmail);

        message.setSubject(
                "Resume Screening System - Password Reset OTP"
        );

        message.setText(
                "Hello,\n\n" +
                "We received a request to reset your password " +
                "for the Resume Screening System.\n\n" +
                "Your password reset OTP is:\n\n" +
                otp +
                "\n\n" +
                "This OTP will expire in 5 minutes.\n\n" +
                "If you did not request a password reset, " +
                "you can safely ignore this email.\n\n" +
                "Regards,\n" +
                "Resume Screening System"
        );

        mailSender.send(message);
    }

    // =========================================================
    // APPLICATION SUBMITTED EMAIL
    // =========================================================

    public void sendApplicationSubmittedEmail(
            String recipientEmail,
            String applicantName,
            String jobTitle,
            String companyName,
            String companyEmail,
            String location,
            Long applicationId,
            String appliedAt) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(recipientEmail);

        if (companyEmail != null &&
                !companyEmail.isBlank()) {

            message.setReplyTo(companyEmail);
        }

        message.setSubject(
                "Application Received - "
                        + jobTitle
                        + " at "
                        + companyName
        );

        message.setText(
                "Hello "
                        + applicantName
                        + ",\n\n" +

                "Thank you for applying for the "
                        + jobTitle
                        + " position at "
                        + companyName
                        + ".\n\n" +

                "Your application has been successfully " +
                "received and is now recorded in our " +
                "recruitment system.\n\n" +

                "Application Details\n" +
                "-------------------\n" +
                "Job Title: "
                        + jobTitle
                        + "\n" +

                "Company: "
                        + companyName
                        + "\n" +

                "Location: "
                        + location
                        + "\n" +

                "Application ID: #"
                        + applicationId
                        + "\n" +

                "Submitted On: "
                        + appliedAt
                        + "\n" +

                "Application Status: SUBMITTED\n\n" +

                "What Happens Next?\n" +
                "Your application will now proceed through " +
                "the recruitment and resume screening process. " +
                "You will be notified when there is an update " +
                "regarding your application.\n\n" +

                "Recruitment Contact\n" +
                "-------------------\n" +
                companyName
                        + "\n" +

                (companyEmail != null &&
                        !companyEmail.isBlank()
                        ? companyEmail
                        : "Email not provided") +

                "\n\n" +

                "Thank you for your interest in "
                        + companyName
                        + ".\n\n" +

                "Regards,\n" +
                "Resume Screening System"
        );

        mailSender.send(message);
    }

    // =========================================================
    // APPLICATION SHORTLISTED EMAIL
    // =========================================================

    public void sendApplicationShortlistedEmail(
            String recipientEmail,
            String applicantName,
            String jobTitle,
            String companyName,
            String companyEmail,
            String location,
            Long applicationId) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(recipientEmail);

        if (companyEmail != null &&
                !companyEmail.isBlank()) {

            message.setReplyTo(companyEmail);
        }

        message.setSubject(
                "Application Shortlisted - "
                        + jobTitle
                        + " at "
                        + companyName
        );

        message.setText(
                "Hello "
                        + applicantName
                        + ",\n\n" +

                "We are pleased to inform you that your " +
                "application for the "
                        + jobTitle
                        + " position at "
                        + companyName
                        + " has been shortlisted for the next stage " +
                        "of the recruitment process.\n\n" +

                "Application Details\n" +
                "-------------------\n" +

                "Job Title: "
                        + jobTitle
                        + "\n" +

                "Company: "
                        + companyName
                        + "\n" +

                "Location: "
                        + location
                        + "\n" +

                "Application ID: #"
                        + applicationId
                        + "\n" +

                "Application Status: SHORTLISTED\n\n" +

                "The recruitment team will contact you with " +
                "information about the next steps when available.\n\n" +

                "Recruitment Contact\n" +
                "-------------------\n" +

                companyName
                        + "\n" +

                (companyEmail != null &&
                        !companyEmail.isBlank()
                        ? companyEmail
                        : "Email not provided") +

                "\n\n" +

                "Thank you for your interest in "
                        + companyName
                        + ".\n\n" +

                "Regards,\n" +
                companyName
        );

        mailSender.send(message);
    }

    // =========================================================
    // APPLICATION REJECTED EMAIL
    // =========================================================

    public void sendApplicationRejectedEmail(
            String recipientEmail,
            String applicantName,
            String jobTitle,
            String companyName,
            String companyEmail,
            String location,
            Long applicationId) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(recipientEmail);

        if (companyEmail != null &&
                !companyEmail.isBlank()) {

            message.setReplyTo(companyEmail);
        }

        message.setSubject(
                "Application Update - "
                        + jobTitle
                        + " at "
                        + companyName
        );

        message.setText(
                "Hello "
                        + applicantName
                        + ",\n\n" +

                "Thank you for your interest in the "
                        + jobTitle
                        + " position at "
                        + companyName
                        + ".\n\n" +

                "After reviewing your application, the " +
                "recruitment team has decided not to move " +
                "forward with your application at this stage.\n\n" +

                "Application Details\n" +
                "-------------------\n" +

                "Job Title: "
                        + jobTitle
                        + "\n" +

                "Company: "
                        + companyName
                        + "\n" +

                "Location: "
                        + location
                        + "\n" +

                "Application ID: #"
                        + applicationId
                        + "\n" +

                "Application Status: REJECTED\n\n" +

                "We appreciate the time and effort you put " +
                "into your application and encourage you to " +
                "consider future opportunities that may match " +
                "your skills and experience.\n\n" +

                "Recruitment Contact\n" +
                "-------------------\n" +

                companyName
                        + "\n" +

                (companyEmail != null &&
                        !companyEmail.isBlank()
                        ? companyEmail
                        : "Email not provided") +

                "\n\n" +

                "Thank you for your interest in "
                        + companyName
                        + ".\n\n" +

                "Regards,\n" +
                companyName
        );

        mailSender.send(message);
    }
}