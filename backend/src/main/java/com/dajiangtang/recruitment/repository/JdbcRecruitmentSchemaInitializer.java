package com.dajiangtang.recruitment.repository;

import java.util.List;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
@ConditionalOnProperty(name = "app.persistence", havingValue = "jdbc")
public class JdbcRecruitmentSchemaInitializer {

    private final JdbcTemplate jdbcTemplate;

    public JdbcRecruitmentSchemaInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void ensureRecruitmentColumns() {
        ensureSupportTables();
        List<ColumnDefinition> columns = List.of(
                new ColumnDefinition("department", "ALTER TABLE recruitments ADD COLUMN department VARCHAR(128)"),
                new ColumnDefinition("recruitment_post", "ALTER TABLE recruitments ADD COLUMN recruitment_post VARCHAR(128)"),
                new ColumnDefinition("job_tags", "ALTER TABLE recruitments ADD COLUMN job_tags VARCHAR(255)"),
                new ColumnDefinition("work_location", "ALTER TABLE recruitments ADD COLUMN work_location VARCHAR(255)"),
                new ColumnDefinition("required_arrival_date", "ALTER TABLE recruitments ADD COLUMN required_arrival_date DATE"),
                new ColumnDefinition("recruitment_progress", "ALTER TABLE recruitments ADD COLUMN recruitment_progress VARCHAR(64)"),
                new ColumnDefinition("job_description", "ALTER TABLE recruitments ADD COLUMN job_description TEXT"),
                new ColumnDefinition("job_requirement", "ALTER TABLE recruitments ADD COLUMN job_requirement TEXT"),
                new ColumnDefinition("skill_requirement", "ALTER TABLE recruitments ADD COLUMN skill_requirement TEXT"),
                new ColumnDefinition("welfare", "ALTER TABLE recruitments ADD COLUMN welfare TEXT"),
                new ColumnDefinition("follower", "ALTER TABLE recruitments ADD COLUMN follower VARCHAR(128)"),
                new ColumnDefinition("level", "ALTER TABLE recruitments ADD COLUMN level VARCHAR(64)"),
                new ColumnDefinition("remark", "ALTER TABLE recruitments ADD COLUMN remark TEXT")
        );

        columns.stream()
                .filter(column -> !columnExists(column.name()))
                .forEach(column -> jdbcTemplate.execute(column.alterSql()));

        jdbcTemplate.update("""
                UPDATE recruitments
                SET department = COALESCE(NULLIF(department, ''), '业务部'),
                    recruitment_post = COALESCE(NULLIF(recruitment_post, ''), position),
                    job_tags = COALESCE(NULLIF(job_tags, ''), IF(cspm_preferred, 'CSPM优先', '')),
                    work_location = COALESCE(NULLIF(work_location, ''), city),
                    recruitment_progress = COALESCE(NULLIF(recruitment_progress, ''), status),
                    job_description = COALESCE(NULLIF(job_description, ''), CONCAT('负责', position, '相关项目规划、交付推进、风险控制与跨部门协同，确保岗位目标按期达成。')),
                    job_requirement = COALESCE(NULLIF(job_requirement, ''), '具备相关岗位经验，熟悉项目管理流程，沟通协调能力强，能够独立推进复杂任务。'),
                    skill_requirement = COALESCE(NULLIF(skill_requirement, ''), '项目管理,沟通协作,风险控制,需求分析'),
                    welfare = COALESCE(NULLIF(welfare, ''), '五险一金,带薪年假,绩效奖金,定期体检'),
                    follower = COALESCE(NULLIF(follower, ''), owner),
                    level = COALESCE(NULLIF(level, ''), '待定'),
                    remark = COALESCE(remark, '')
                """);
    }

    private void ensureSupportTables() {
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS user_accounts (
                  id BIGINT PRIMARY KEY AUTO_INCREMENT,
                  username VARCHAR(64) NOT NULL UNIQUE,
                  password_hash CHAR(64) NOT NULL,
                  phone VARCHAR(32) NOT NULL,
                  role VARCHAR(32) NOT NULL,
                  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS recruitments (
                  id VARCHAR(32) PRIMARY KEY,
                  position VARCHAR(128) NOT NULL,
                  salary VARCHAR(64) NOT NULL,
                  company_name VARCHAR(160) NOT NULL,
                  city VARCHAR(64) NOT NULL,
                  owner VARCHAR(64) NOT NULL,
                  headcount INT NOT NULL,
                  cspm_preferred BOOLEAN NOT NULL DEFAULT FALSE,
                  status VARCHAR(32) NOT NULL,
                  contact_phone VARCHAR(32) NOT NULL,
                  published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_recruitments_position (position),
                  INDEX idx_recruitments_city (city),
                  INDEX idx_recruitments_status (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS talents (
                  id BIGINT PRIMARY KEY AUTO_INCREMENT,
                  account_username VARCHAR(64) UNIQUE,
                  masked_name VARCHAR(64) NOT NULL,
                  gender VARCHAR(16),
                  job_intention VARCHAR(128),
                  expected_city VARCHAR(64),
                  current_company VARCHAR(160),
                  position_title VARCHAR(128),
                  current_city VARCHAR(64),
                  industry VARCHAR(128),
                  personal_advantage TEXT,
                  profile TEXT,
                  contact_owner VARCHAR(64),
                  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_talents_name (masked_name),
                  INDEX idx_talents_company (current_company),
                  INDEX idx_talents_city (current_city),
                  INDEX idx_talents_industry (industry)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """);
        if (!columnExists("talents", "account_username")) {
            jdbcTemplate.execute("ALTER TABLE talents ADD COLUMN account_username VARCHAR(64) UNIQUE");
        }
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS recruitment_applications (
                  id BIGINT PRIMARY KEY AUTO_INCREMENT,
                  recruitment_id VARCHAR(32) NOT NULL,
                  account_username VARCHAR(64) NOT NULL,
                  applicant_name VARCHAR(64) NOT NULL,
                  phone VARCHAR(32) NOT NULL,
                  note TEXT,
                  status VARCHAR(64) NOT NULL DEFAULT 'SUBMITTED',
                  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  INDEX idx_applications_recruitment (recruitment_id),
                  INDEX idx_applications_account (account_username),
                  INDEX idx_applications_phone (phone)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """);
        if (!columnExists("recruitment_applications", "account_username")) {
            jdbcTemplate.execute("ALTER TABLE recruitment_applications ADD COLUMN account_username VARCHAR(64) NOT NULL DEFAULT 'cspm_user'");
            jdbcTemplate.execute("ALTER TABLE recruitment_applications ALTER COLUMN account_username DROP DEFAULT");
        }
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS personal_profiles (
                  id BIGINT PRIMARY KEY AUTO_INCREMENT,
                  account_username VARCHAR(64) NOT NULL,
                  name VARCHAR(64),
                  gender VARCHAR(16),
                  ethnicity VARCHAR(32),
                  birthday DATE,
                  native_place VARCHAR(64),
                  political_status VARCHAR(64),
                  job_intention VARCHAR(128),
                  expected_salary VARCHAR(64),
                  phone VARCHAR(32),
                  address VARCHAR(255),
                  email VARCHAR(128),
                  city VARCHAR(64),
                  industry VARCHAR(128),
                  personal_advantage TEXT,
                  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  UNIQUE KEY uk_profiles_account (account_username)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS profile_module_records (
                  id BIGINT PRIMARY KEY AUTO_INCREMENT,
                  account_username VARCHAR(64) NOT NULL,
                  module_name VARCHAR(64) NOT NULL,
                  fields_json JSON NOT NULL,
                  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_profile_module_account (account_username, module_name)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS talent_certificates (
                  id BIGINT PRIMARY KEY AUTO_INCREMENT,
                  talent_id BIGINT NOT NULL,
                  certificate_name VARCHAR(128) NOT NULL,
                  certificate_level VARCHAR(64),
                  issued_at DATE,
                  INDEX idx_talent_certificates_talent (talent_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS companies (
                  id BIGINT PRIMARY KEY AUTO_INCREMENT,
                  account_username VARCHAR(64) UNIQUE,
                  company_type VARCHAR(64),
                  company_name VARCHAR(160) NOT NULL,
                  full_name VARCHAR(220),
                  company_size VARCHAR(64),
                  industry VARCHAR(128),
                  city VARCHAR(64),
                  contact_name VARCHAR(64),
                  work_time VARCHAR(64),
                  welfare_insurance VARCHAR(128),
                  welfare_allowance VARCHAR(128),
                  maintainer VARCHAR(64),
                  phone VARCHAR(32),
                  website VARCHAR(255),
                  address VARCHAR(255),
                  email VARCHAR(128),
                  description TEXT,
                  status VARCHAR(64),
                  user_level VARCHAR(64),
                  remark TEXT,
                  fields_json JSON,
                  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_companies_account (account_username),
                  INDEX idx_companies_name (company_name),
                  INDEX idx_companies_city (city),
                  INDEX idx_companies_industry (industry)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS user_uploads (
                  id BIGINT PRIMARY KEY AUTO_INCREMENT,
                  account_username VARCHAR(64) NOT NULL,
                  page_path VARCHAR(255) NOT NULL,
                  target VARCHAR(64) NOT NULL,
                  data_url LONGTEXT NOT NULL,
                  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  UNIQUE KEY uk_user_upload_target (account_username, page_path, target),
                  INDEX idx_user_upload_account (account_username)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """);
    }

    private boolean columnExists(String columnName) {
        return columnExists("recruitments", columnName);
    }

    private boolean columnExists(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                  AND table_name = ?
                  AND column_name = ?
                """, Integer.class, tableName, columnName);
        return count != null && count > 0;
    }

    private record ColumnDefinition(String name, String alterSql) {
    }
}
