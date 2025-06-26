package br.com.gestao_hospitalar.auth_service.security;

import br.com.gestao_hospitalar.auth_service.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

  @Value("${jwt.secret}")
  String jwtSecret;

  @Value("${jwt.expiration}")
  long jwtExpirationInMs;

  private Key getSigningKey() {
    return Keys.hmacShaKeyFor(jwtSecret.getBytes());
  }

  public String generateToken(User user) {
    return Jwts.builder()
      .setSubject(user.getId().toString())
      .claim("email", user.getEmail())
      .claim("cpf", user.getCpf())
      .claim("type", user.getType())
      .setIssuedAt(new Date())
      .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationInMs))
      .signWith(getSigningKey(), SignatureAlgorithm.HS256)
      .compact();
  }
}
