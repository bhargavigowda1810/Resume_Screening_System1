package resume_screening_backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import resume_screening_backend.entity.User;
import resume_screening_backend.repository.UserRepository;

import java.time.LocalDateTime;

@Configuration
public class AdminDataInitializer {

    @Bean
    CommandLineRunner createAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${admin.email}") String adminEmail,
            @Value("${admin.password}") String adminPassword) {

        return args -> {

            if (userRepository.findByEmail(adminEmail).isPresent()) {
                return;
            }

            User admin = new User();

            admin.setName("System Admin");
            admin.setEmail(adminEmail);
            admin.setPasswordHash(
                    passwordEncoder.encode(adminPassword)
            );
            admin.setRole("ADMIN");
            admin.setCreatedAt(LocalDateTime.now());
            admin.setEmailVerified(true);

            userRepository.save(admin);

            System.out.println(
                    "Admin account created: " + adminEmail
            );
        };
    }
}