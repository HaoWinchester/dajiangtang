CREATE DATABASE IF NOT EXISTS dajiangtang
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE dajiangtang;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS qualification_certificates;
DROP TABLE IF EXISTS profile_module_records;
DROP TABLE IF EXISTS education_experiences;
DROP TABLE IF EXISTS honors;
DROP TABLE IF EXISTS project_experiences;
DROP TABLE IF EXISTS work_experiences;
DROP TABLE IF EXISTS personal_profiles;
DROP TABLE IF EXISTS user_uploads;
DROP TABLE IF EXISTS recruitment_applications;
DROP TABLE IF EXISTS talent_certificates;
DROP TABLE IF EXISTS talents;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS recruitments;
DROP TABLE IF EXISTS user_accounts;

CREATE TABLE user_accounts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash CHAR(64) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  role ENUM('ADMIN', 'USER', 'COMPANY') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录与注册账号';

CREATE TABLE recruitments (
  id VARCHAR(32) PRIMARY KEY,
  position VARCHAR(128) NOT NULL,
  salary VARCHAR(64) NOT NULL,
  company_name VARCHAR(160) NOT NULL,
  department VARCHAR(128),
  recruitment_post VARCHAR(128),
  job_tags VARCHAR(255),
  city VARCHAR(64) NOT NULL,
  work_location VARCHAR(255),
  owner VARCHAR(64) NOT NULL,
  headcount INT NOT NULL,
  cspm_preferred BOOLEAN NOT NULL DEFAULT FALSE COMMENT '首页与列表展示时是否标记为CSPM优先',
  status ENUM('ACTIVE', 'RECRUITING', 'PAUSED', 'CLOSED') NOT NULL,
  contact_phone VARCHAR(32) NOT NULL,
  required_arrival_date DATE,
  recruitment_progress VARCHAR(64),
  job_description TEXT,
  job_requirement TEXT,
  skill_requirement TEXT,
  welfare TEXT,
  follower VARCHAR(128),
  level VARCHAR(64),
  remark TEXT,
  published_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  INDEX idx_recruitments_position (position),
  INDEX idx_recruitments_city (city),
  INDEX idx_recruitments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='招聘信息列表';

CREATE TABLE companies (
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
  user_level ENUM('重点用户', '一般用户') DEFAULT '一般用户',
  remark TEXT,
  fields_json JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_companies_account (account_username),
  INDEX idx_companies_name (company_name),
  INDEX idx_companies_city (city),
  INDEX idx_companies_industry (industry)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业中心资料';

CREATE TABLE talents (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人才库列表与详情';

CREATE TABLE profile_module_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  account_username VARCHAR(64) NOT NULL,
  module_name VARCHAR(64) NOT NULL,
  fields_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_profile_module_account (account_username, module_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='个人中心多轮资料记录';

CREATE TABLE talent_certificates (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  talent_id BIGINT NOT NULL,
  certificate_name VARCHAR(128) NOT NULL,
  certificate_level VARCHAR(64),
  issued_at DATE,
  FOREIGN KEY (talent_id) REFERENCES talents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人才资格证书';

CREATE TABLE recruitment_applications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  recruitment_id VARCHAR(32) NOT NULL,
  account_username VARCHAR(64) NOT NULL,
  applicant_name VARCHAR(64) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  note TEXT,
  status VARCHAR(64) NOT NULL DEFAULT '已提交',
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recruitment_id) REFERENCES recruitments(id) ON DELETE CASCADE,
  INDEX idx_applications_recruitment (recruitment_id),
  INDEX idx_applications_account (account_username),
  INDEX idx_applications_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='招聘申请';

CREATE TABLE user_uploads (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  account_username VARCHAR(64) NOT NULL,
  page_path VARCHAR(255) NOT NULL,
  target VARCHAR(64) NOT NULL,
  data_url LONGTEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_upload_target (account_username, page_path, target),
  INDEX idx_user_upload_account (account_username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户上传图片数据';

CREATE TABLE personal_profiles (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学员基本信息';

CREATE TABLE work_experiences (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  account_username VARCHAR(64) NOT NULL,
  start_date DATE,
  end_date DATE,
  company_name VARCHAR(160),
  duty TEXT,
  position_title VARCHAR(128),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_work_account (account_username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作经历';

CREATE TABLE project_experiences (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  account_username VARCHAR(64) NOT NULL,
  start_date DATE,
  end_date DATE,
  content TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_project_account (account_username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目经历';

CREATE TABLE honors (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  account_username VARCHAR(64) NOT NULL,
  start_date DATE,
  end_date DATE,
  content TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_honors_account (account_username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='获得荣誉';

CREATE TABLE education_experiences (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  account_username VARCHAR(64) NOT NULL,
  school VARCHAR(160),
  major VARCHAR(128),
  education_level VARCHAR(64),
  degree VARCHAR(64),
  enrollment_date DATE,
  graduation_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_education_account (account_username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教育经历';

CREATE TABLE qualification_certificates (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  account_username VARCHAR(64) NOT NULL,
  has_cspm BOOLEAN NOT NULL DEFAULT FALSE,
  other_certificates TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_cert_account (account_username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资格证书';

SET FOREIGN_KEY_CHECKS = 1;
