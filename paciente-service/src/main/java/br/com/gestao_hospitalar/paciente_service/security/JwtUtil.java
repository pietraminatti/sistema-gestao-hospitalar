package br.com.gestao_hospitalar.paciente_service.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

  @Value("${jwt.secret}")
  private String jwtSecret;

  private Key key;

  @PostConstruct
  public void init() {
    this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
  }

  public Jws<Claims> validateToken(String token) {
    return Jwts.parserBuilder()
      .setSigningKey(key)
      .build()
      .parseClaimsJws(token);
  }

  public boolean isTokenExpired(String token) {
    Date expiration = validateToken(token).getBody().getExpiration();
    return expiration.before(new Date());
  }

  public Map<String, Object> getClaims(String token) {
    return validateToken(token).getBody();
  }
}
