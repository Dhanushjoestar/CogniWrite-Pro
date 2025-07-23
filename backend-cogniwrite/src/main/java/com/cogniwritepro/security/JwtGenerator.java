// src/main/java/com/cogniwritepro/security/JwtGenerator.java
package com.cogniwritepro.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys; // Ensure this is imported
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtGenerator {

    // Inject JWT secret key from application.properties
    @Value("${jwt.secret}")
    private String jwtSecret;

    // Inject JWT expiration time from application.properties
    @Value("${jwt.expiration.ms}")
    private long jwtExpirationMs;

    // Helper method to get the signing key
    private Key getSigningKey() {
        // Use Keys.hmacShaKeyFor to generate a secure key from your secret string
        // It's crucial that this secret is strong and kept secure.
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // Generate JWT token
    public String generateToken(Authentication authentication) {
        String username = authentication.getName();
        Date currentDate = new Date();
        Date expireDate = new Date(currentDate.getTime() + jwtExpirationMs);

        String token = Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(expireDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512) // Use HS512 with the generated key
                .compact();
        return token;
    }
    public String getUsernameFromJwt(String token) {

        Claims claims = Jwts.parser()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    // This method is not strictly needed for basic login but kept for completeness
    public boolean validateToken(String token) {
        try {
            // The parserBuilder() method is part of JJWT API 0.11.0 and above.
            Claims claims = Jwts.parser()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return true;
        } catch (Exception ex) {
            // Log specific exceptions for debugging (e.g., ExpiredJwtException, MalformedJwtException)
            throw new AuthenticationCredentialsNotFoundException("JWT was expired or incorrect", ex);
        }
    }
}
