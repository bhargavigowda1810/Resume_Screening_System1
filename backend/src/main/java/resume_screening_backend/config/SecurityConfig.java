package resume_screening_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    // =========================================================
    // PASSWORD ENCODER
    // =========================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =========================================================
    // CORS CONFIGURATION
    // =========================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    // =========================================================
    // SECURITY FILTER CHAIN
    // =========================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

            // -------------------------------------------------
            // CORS
            // -------------------------------------------------

            .cors(cors -> {})

            // -------------------------------------------------
            // CSRF
            // -------------------------------------------------

            .csrf(csrf -> csrf.disable())

            // -------------------------------------------------
            // Disable default login
            // -------------------------------------------------

            .formLogin(form -> form.disable())

            // -------------------------------------------------
            // Disable HTTP Basic
            // -------------------------------------------------

            .httpBasic(basic -> basic.disable())

            // -------------------------------------------------
            // Stateless API
            // -------------------------------------------------

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // -------------------------------------------------
            // Authorization
            // -------------------------------------------------

            .authorizeHttpRequests(auth -> auth

                // CORS preflight
                .requestMatchers(
                        HttpMethod.OPTIONS,
                        "/**"
                ).permitAll()

                // Health
                .requestMatchers(
                        "/api/health"
                ).permitAll()

                // Users
                .requestMatchers(
                        "/api/users/**"
                ).permitAll()

                // Jobs
                .requestMatchers(
                        HttpMethod.POST,
                        "/api/jobs"
                ).permitAll()

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/jobs/**"
                ).permitAll()

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/jobs/**"
                ).permitAll()

                // Job embeddings
                .requestMatchers(
                        "/api/job-embeddings/**"
                ).permitAll()

                // Resume embeddings
                .requestMatchers(
                        "/api/resume-embeddings/**"
                ).permitAll()

                // Resumes
                .requestMatchers(
                        "/api/resumes/**"
                ).permitAll()

                // Matches
                .requestMatchers(
                        "/api/matches/**"
                ).permitAll()

                // Applications
                .requestMatchers(
                        "/api/applications/**"
                ).permitAll()

                // Education
                .requestMatchers(
                        "/api/educations/**"
                ).permitAll()

                // Experience
                .requestMatchers(
                        "/api/experiences/**"
                ).permitAll()

                // Skills
                .requestMatchers(
                        "/api/skills/**"
                ).permitAll()

                // Resume skills
                .requestMatchers(
                        "/api/resume-skills/**"
                ).permitAll()

                // Screening
                .requestMatchers(
                        "/api/screening/**"
                ).permitAll()

                // Screening results
                .requestMatchers(
                        "/api/screening-results/**"
                ).permitAll()

                // Anything else
                .anyRequest().authenticated()
            );

        return http.build();
    }
}