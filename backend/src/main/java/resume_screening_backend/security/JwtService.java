package resume_screening_backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import resume_screening_backend.entity.User;

import java.util.UUID;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationTime;
    private final long emailVerificationExpirationTime;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expirationTime,
            @Value("${jwt.email-verification-expiration}") long emailVerificationExpirationTime
    ) {
        this.secretKey = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );

        this.expirationTime = expirationTime;
        this.emailVerificationExpirationTime = emailVerificationExpirationTime;
    }

    public String generateToken(User user) {

    Date issuedAt = new Date();

    Date expiration = new Date(
            issuedAt.getTime() + expirationTime
    );

    return Jwts.builder()
            .subject(user.getEmail())
            .claim(
                    "userUuid",
                    user.getUserUuid().toString()
            )
            .claim("role", user.getRole())
            .issuedAt(issuedAt)
            .expiration(expiration)
            .signWith(secretKey)
            .compact();
}

    public String generateEmailVerificationToken(String email) {

        Date issuedAt = new Date();

        Date expiration = new Date(
                issuedAt.getTime() + emailVerificationExpirationTime
        );

        return Jwts.builder()
                .subject(email)
                .claim("tokenType", "EMAIL_VERIFICATION")
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    public UUID extractUserUuid(String token) {

    String uuid = extractClaims(token)
            .get("userUuid", String.class);

    return UUID.fromString(uuid);
}

    public String extractRole(String token) {
        return extractClaims(token)
                .get("role", String.class);
    }

    public boolean isTokenValid(String token, User user) {

        try {

            String email = extractEmail(token);

            return email.equals(user.getEmail())
                    && !isTokenExpired(token);

        } catch (Exception e) {

            return false;
        }
    }

    public boolean isEmailVerificationTokenValid(
            String token,
            String email
    ) {

        try {

            Claims claims = extractClaims(token);

            String tokenEmail = claims.getSubject();

            String tokenType = claims.get(
                    "tokenType",
                    String.class
            );

            return email.equals(tokenEmail)
                    && "EMAIL_VERIFICATION".equals(tokenType)
                    && !isTokenExpired(token);

        } catch (Exception e) {

            return false;
        }
    }

    private boolean isTokenExpired(String token) {

        return extractClaims(token)
                .getExpiration()
                .before(new Date());
    }

    private Claims extractClaims(String token) {

        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}