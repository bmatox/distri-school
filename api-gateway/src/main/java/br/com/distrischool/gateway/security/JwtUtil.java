package br.com.distrischool.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

  @Value("${jwt.secret}")
  private String secret;

  private Key getSigningKey() {
    return Keys.hmacShaKeyFor(secret.getBytes());
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
      validateAndExtractClaims(token);
      return true;
    } catch (Exception e) {
      return false;
    }
  }
}
