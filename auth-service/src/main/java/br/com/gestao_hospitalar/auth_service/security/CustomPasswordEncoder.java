package br.com.gestao_hospitalar.auth_service.security;

import org.springframework.stereotype.Component;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class CustomPasswordEncoder {

    private static final int SALT_LENGTH = 16; // 128 bits

    public String encodeWithSHA256(String rawPassword) {
        // Gera salt aleatório em bytes
        byte[] saltBytes = new byte[SALT_LENGTH];
        new SecureRandom().nextBytes(saltBytes);
        String saltBase64 = Base64.getEncoder().encodeToString(saltBytes);

        // Aplica SHA-256 com o salt
        String hash = hashWithSHA256(rawPassword, saltBase64);

        // Armazena como "salt:hash"
        return saltBase64 + ":" + hash;
    }

    public boolean matches(String rawPassword, String encodedPassword) {
        String[] parts = encodedPassword.split(":");
        if (parts.length != 2) return false;

        String saltBase64 = parts[0];
        String storedHash = parts[1];

        String computedHash = hashWithSHA256(rawPassword, saltBase64);

        return storedHash.equals(computedHash);
    }

    private String hashWithSHA256(String password, String saltBase64) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            // Decodifica salt de Base64 para bytes
            byte[] saltBytes = Base64.getDecoder().decode(saltBase64);
            byte[] passwordBytes = password.getBytes("UTF-8");

            // Concatena salt + password em bytes
            byte[] saltedPasswordBytes = new byte[saltBytes.length + passwordBytes.length];
            System.arraycopy(saltBytes, 0, saltedPasswordBytes, 0, saltBytes.length);
            System.arraycopy(passwordBytes, 0, saltedPasswordBytes, saltBytes.length, passwordBytes.length);

            // Calcula hash SHA-256
            byte[] hashBytes = digest.digest(saltedPasswordBytes);

            // Retorna hash codificado em Base64
            return Base64.getEncoder().encodeToString(hashBytes);

        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar hash SHA-256", e);
        }
    }
}
