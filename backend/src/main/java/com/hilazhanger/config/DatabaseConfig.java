package com.hilazhanger.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Converts Render/Heroku postgres:// DATABASE_URL to JDBC for Spring Boot.
 */
@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    @ConditionalOnProperty(name = "DATABASE_URL")
    public DataSource dataSourceFromDatabaseUrl(@Value("${DATABASE_URL}") String databaseUrl) {
        HikariConfig config = new HikariConfig();
        ParsedUrl parsed = parsePostgresUrl(databaseUrl);
        config.setJdbcUrl(parsed.jdbcUrl());
        config.setUsername(parsed.username());
        config.setPassword(parsed.password());
        config.setMaximumPoolSize(5);
        return new HikariDataSource(config);
    }

    static ParsedUrl parsePostgresUrl(String url) {
        if (url.startsWith("jdbc:")) {
            return new ParsedUrl(url, null, null);
        }
        String normalized = url.replace("postgresql://", "postgres://");
        URI uri = URI.create(normalized);
        String user = "";
        String pass = "";
        if (uri.getUserInfo() != null) {
            String[] parts = uri.getUserInfo().split(":", 2);
            user = parts[0];
            if (parts.length > 1) pass = parts[1];
        }
        int port = uri.getPort() > 0 ? uri.getPort() : 5432;
        String jdbc = "jdbc:postgresql://" + uri.getHost() + ":" + port + uri.getPath() + "?sslmode=require";
        return new ParsedUrl(jdbc, user, pass);
    }

    record ParsedUrl(String jdbcUrl, String username, String password) {}
}
