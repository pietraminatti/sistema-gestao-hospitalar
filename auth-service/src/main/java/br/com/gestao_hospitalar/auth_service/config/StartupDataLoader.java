package br.com.gestao_hospitalar.auth_service.config;

import br.com.gestao_hospitalar.auth_service.entity.User;
import br.com.gestao_hospitalar.auth_service.enums.UserType;
import br.com.gestao_hospitalar.auth_service.repository.UserRepository;
import br.com.gestao_hospitalar.auth_service.security.CustomPasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class StartupDataLoader implements CommandLineRunner {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private CustomPasswordEncoder customPasswordEncoder;

  @Override
  public void run(String... args) {
    String cpf = "90769281001";

    if (userRepository.findByCpf(cpf).isEmpty()) {
      String password = "TADS";
      String hashedPassword = customPasswordEncoder.encodeWithSHA256(password);

      User user = new User();
      user.setCpf(cpf);
      user.setEmail("admin@hospital.com");
      user.setPassword(hashedPassword);
      user.setType(UserType.ADMIN);

      userRepository.save(user);
      System.out.println("✅ Usuário admin inserido com sucesso.");
    }
  }
}
