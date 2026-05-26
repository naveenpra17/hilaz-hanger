package com.hilazhanger.config;

import com.hilazhanger.domain.entity.User;
import com.hilazhanger.domain.enums.UserRole;
import com.hilazhanger.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedUsers(
            UserRepository userRepository,
            PasswordEncoder encoder,
            @Value("${app.seed.admin-email:}") String adminEmail,
            @Value("${app.seed.admin-password:}") String adminPassword
    ) {
        return args -> {
            if (adminEmail != null && !adminEmail.isBlank()
                    && adminPassword != null && !adminPassword.isBlank()) {
                seedIfMissing(userRepository, encoder, adminEmail, "Admin", adminPassword, UserRole.ADMIN);
            }
        };
    }

    private void seedIfMissing(UserRepository repo, PasswordEncoder encoder,
                               String email, String name, String password, UserRole role) {
        if (!repo.existsByEmail(email)) {
            repo.save(User.builder()
                    .email(email)
                    .fullName(name)
                    .passwordHash(encoder.encode(password))
                    .role(role)
                    .build());
        }
    }
}
