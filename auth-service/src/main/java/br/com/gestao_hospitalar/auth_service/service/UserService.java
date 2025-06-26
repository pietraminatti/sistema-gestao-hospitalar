package br.com.gestao_hospitalar.auth_service.service;

import br.com.gestao_hospitalar.auth_service.dto.*;
import br.com.gestao_hospitalar.auth_service.entity.User;
import br.com.gestao_hospitalar.auth_service.exception.ApiException;
import br.com.gestao_hospitalar.auth_service.repository.UserRepository;
import br.com.gestao_hospitalar.auth_service.security.CustomPasswordEncoder;
import br.com.gestao_hospitalar.auth_service.security.JwtTokenProvider;
import java.util.Random;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class UserService {

  @Autowired
  private UserRepository repository;

  @Autowired
  private CustomPasswordEncoder customPasswordEncoder;

  @Autowired
  private JavaMailSender mailSender;

  @Autowired
  private JwtTokenProvider jwtTokenProvider;

  // Agora retorna só o e-mail registrado
  public String registerUser(RegisterRequest request) {
    if (repository.existsByEmail(request.getEmail())) {
      throw new ApiException("E-mail já registrado", HttpStatus.CONFLICT);
    }
    if (repository.existsByCpf(request.getCpf())) {
      throw new ApiException("CPF já registrado", HttpStatus.CONFLICT);
    }

    String generatedPassword = generateRandomPassword();
    String hashedPassword = customPasswordEncoder.encodeWithSHA256(
      generatedPassword
    );

    User newUser = new User();
    newUser.setCpf(request.getCpf());
    newUser.setEmail(request.getEmail());
    newUser.setType(request.getType());
    newUser.setPassword(hashedPassword);

    repository.save(newUser);

    sendPasswordByEmail(newUser.getEmail(), generatedPassword);

    return newUser.getEmail();
  }

  // Retorna o token dentro do AuthResponse
  public AuthResponse authenticate(AuthRequest request) {
    String identifier = request.getIdentifier();
    String password = request.getPassword();

    User user = repository
      .findByEmail(identifier)
      .or(() -> repository.findByCpf(identifier))
      .orElseThrow(() ->
        new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND)
      );

    if (!customPasswordEncoder.matches(password, user.getPassword())) {
      throw new ApiException("Senha inválida", HttpStatus.BAD_REQUEST);
    }

    return new AuthResponse(jwtTokenProvider.generateToken(user));
  }

  public ApiResponse handleForgotPassword(ForgotPasswordRequest request) {
    User user = repository
      .findByEmail(request.getEmail())
      .orElseThrow(() ->
        new ApiException("E-mail não encontrado", HttpStatus.NOT_FOUND)
      );

    String newPassword = generateRandomPassword();
    String hashedPassword = customPasswordEncoder.encodeWithSHA256(newPassword);

    user.setPassword(hashedPassword);
    repository.save(user);

    sendPasswordByEmail(user.getEmail(), newPassword);

    return null;
  }

  private String generateRandomPassword() {
    return String.format("%04d", new Random().nextInt(10000));
  }

  private void sendPasswordByEmail(String to, String password) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(to);
    message.setSubject("Senha de acesso");
    message.setText(
      String.format(
        """
        Bem-vindo ao Sistema de Gestão Hospitalar!

        Sua senha de acesso é: %s

        Equipe TI Hospitalar
        """,
        password
      )
    );
    mailSender.send(message);
  }
}
