package com.dajiangtang.common.config;

import javax.sql.DataSource;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

@Configuration
@EnableConfigurationProperties(DataSourceProperties.class)
@ConditionalOnProperty(name = "app.persistence", havingValue = "jdbc")
public class JdbcPersistenceConfig {

    @Bean
    @ConfigurationProperties("spring.datasource.hikari")
    public HikariConfig hikariConfig() {
        return new HikariConfig();
    }

    @Bean
    public HikariDataSource dataSource(DataSourceProperties properties, HikariConfig hikariConfig) {
        if (!hasText(properties.getUrl())) {
            throw new IllegalStateException("JDBC 数据源 URL 未配置，请确认已启用 jdbc profile 或设置 spring.datasource.url。");
        }
        hikariConfig.setJdbcUrl(properties.getUrl());
        hikariConfig.setUsername(properties.getUsername());
        hikariConfig.setPassword(properties.getPassword());
        if (hasText(properties.getDriverClassName())) {
            hikariConfig.setDriverClassName(properties.getDriverClassName());
        }
        return new HikariDataSource(hikariConfig);
    }

    @Bean
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
