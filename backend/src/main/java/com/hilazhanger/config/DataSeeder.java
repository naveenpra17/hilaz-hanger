package com.hilazhanger.config;

import com.hilazhanger.domain.entity.User;
import com.hilazhanger.domain.enums.UserRole;
import com.hilazhanger.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedUsers(UserRepository userRepository, PasswordEncoder encoder) {
        return args -> {
            seedIfMissing(userRepository, encoder, "admin@hilazhanger.com", "Admin", "Admin@123", UserRole.ADMIN);
            seedIfMissing(userRepository, encoder, "customer@hilazhanger.com", "Customer", "Customer@123", UserRole.CUSTOMER);
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
