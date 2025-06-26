package br.com.gestao_hospitalar.auth_service.entity;

import br.com.gestao_hospitalar.auth_service.enums.UserType;
import jakarta.persistence.*;
import java.util.UUID;
import lombok.Data;

@Entity
@Data
@Table(name = "users")
public class User {

  @Id
  @GeneratedValue
  private UUID id; // UUID primário

  @Column(unique = true, nullable = false, length = 11)
  private String cpf;

  @Column(unique = true, nullable = false)
  private String email;

  @Column(nullable = false, length = 255)
  private String password;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private UserType type;
}
