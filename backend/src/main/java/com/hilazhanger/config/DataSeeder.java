package com.hilazhanger.config;

import com.hilazhanger.domain.entity.User;
import com.hilazhanger.domain.enums.UserRole;
import com.hilazhanger.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    @Order(1)
    CommandLineRunner seedUsers(
            UserRepository userRepository,
            PasswordEncoder encoder,
            @Value("${app.seed.admin-email:}") String adminEmail,
            @Value("${app.seed.admin-password:}") String adminPassword,
            @Value("${app.seed.admin-reset-password:false}") boolean resetAdminPassword
    ) {
        return args -> {
            if (adminEmail == null || adminEmail.isBlank()) {
                log.warn("Admin seed skipped: APP_SEED_ADMIN_EMAIL is not set");
                return;
            }
            if (adminPassword == null || adminPassword.isBlank()) {
                log.warn("Admin seed skipped: APP_SEED_ADMIN_PASSWORD is not set");
                return;
            }

            try {
                seedAdmin(userRepository, encoder, adminEmail, adminPassword, resetAdminPassword);
                log.info("Admin seed complete for {}", adminEmail.trim().toLowerCase());
            } catch (Exception ex) {
                log.error("Admin seed failed for {}: {}", adminEmail.trim().toLowerCase(), ex.getMessage(), ex);
                throw ex;
            }
        };
    }

    private void seedAdmin(
            UserRepository repo,
            PasswordEncoder encoder,
            String email,
            String password,
            boolean resetPassword
    ) {
        String normalizedEmail = email.trim().toLowerCase();
        var existing = repo.findByEmail(normalizedEmail);
        if (existing.isPresent()) {
            if (!resetPassword) {
                return;
            }
            User user = existing.get();
            user.setPasswordHash(encoder.encode(password));
            user.setRole(UserRole.ADMIN);
            user.setActive(true);
            repo.save(user);
            return;
        }

        repo.save(User.builder()
                .email(normalizedEmail)
                .fullName("Admin")
                .passwordHash(encoder.encode(password))
                .role(UserRole.ADMIN)
                .build());
    }
}
