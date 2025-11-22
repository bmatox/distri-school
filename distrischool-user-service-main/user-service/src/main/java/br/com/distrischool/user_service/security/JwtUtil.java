package br.com.distrischool.user_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

  @Value("${jwt.secret}")
  private String secret;

  @Value("${jwt.expiration:86400000}") // Default: 24 hours in milliseconds
  private Long expiration;

  private Key signingKey;

  private Key getSigningKey() {
    if (signingKey == null) {
      signingKey = Keys.hmacShaKeyFor(secret.getBytes());
    }
    return signingKey;
  }

  public String generateToken(Long userId, String email, String role) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("userId", userId);
    claims.put("email", email);
    claims.put("role", role);

    return Jwts.builder()
        .claims(claims)
        .subject(email)
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + expiration))
        .signWith(getSigningKey())
        .compact();
  }

  public Claims validateAndExtractClaims(String token) {
    return Jwts.parser()
        .verifyWith(Keys.hmacShaKeyFor(secret.getBytes()))
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }

  public boolean isTokenValid(String token) {
    try {
      Claims claims = validateAndExtractClaims(token);
      return !claims.getExpiration().before(new Date());
    } catch (Exception e) {
      return false;
    }
  }

  public String extractEmail(String token) {
    return validateAndExtractClaims(token).getSubject();
  }

  public Long extractUserId(String token) {
    return validateAndExtractClaims(token).get("userId", Long.class);
  }

  public String extractRole(String token) {
    return validateAndExtractClaims(token).get("role", String.class);
  }
}
