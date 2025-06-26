package br.com.gestao_hospitalar.auth_service.controller;

import br.com.gestao_hospitalar.auth_service.dto.ApiResponse;
import br.com.gestao_hospitalar.auth_service.dto.AuthRequest;
import br.com.gestao_hospitalar.auth_service.dto.AuthResponse;
import br.com.gestao_hospitalar.auth_service.dto.ForgotPasswordRequest;
import br.com.gestao_hospitalar.auth_service.dto.RegisterRequest;
import br.com.gestao_hospitalar.auth_service.service.UserService;
import br.com.gestao_hospitalar.auth_service.util.ResponseUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class AuthController {

  @Autowired
  private UserService userService;

  @PostMapping("/register")
  public ResponseEntity<ApiResponse<String>> registerUser(
    HttpServletRequest request,
    @RequestBody @Valid RegisterRequest req
  ) {
    String email = userService.registerUser(req);

    ApiResponse<String> response = ResponseUtil.created(
      request.getRequestURI(),
      "Usuário registrado com sucesso. Senha enviada para o e-mail: " + email,
      email
    );

    return ResponseEntity.status(201).body(response);
  }

  @PostMapping("/login")
  public ResponseEntity<ApiResponse<AuthResponse>> login(
    HttpServletRequest request,
    @RequestBody @Valid AuthRequest authRequest
  ) {
    AuthResponse authResponse = userService.authenticate(authRequest);

    ApiResponse<AuthResponse> response = ResponseUtil.ok(
      request.getRequestURI(),
      "Login realizado com sucesso",
      authResponse
    );

    return ResponseEntity.ok(response);
  }

  @PostMapping("/forgot-password")
  public ResponseEntity<ApiResponse<Void>> forgotPassword(
    HttpServletRequest request,
    @RequestBody @Valid ForgotPasswordRequest req
  ) {
    userService.handleForgotPassword(req);

    ApiResponse<Void> response = ResponseUtil.ok(
      request.getRequestURI(),
      "Nova senha enviada para o e-mail: " + req.getEmail(),
      null
    );

    return ResponseEntity.ok(response);
  }
}
