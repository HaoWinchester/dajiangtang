CREATE DATABASE IF NOT EXISTS dajiangtang
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='登录与注册账号';

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='招聘信息列表';

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='企业中心资料';

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='人才库列表与详情';

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='人才资格证书';

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='招聘申请';

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='学员基本信息';

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='工作经历';

CREATE TABLE project_experiences (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  account_username VARCHAR(64) NOT NULL,
  start_date DATE,
  end_date DATE,
  content TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_project_account (account_username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='项目经历';

CREATE TABLE honors (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  account_username VARCHAR(64) NOT NULL,
  start_date DATE,
  end_date DATE,
  content TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_honors_account (account_username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='获得荣誉';

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='教育经历';

CREATE TABLE qualification_certificates (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  account_username VARCHAR(64) NOT NULL,
  has_cspm BOOLEAN NOT NULL DEFAULT FALSE,
  other_certificates TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_cert_account (account_username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='资格证书';

SET FOREIGN_KEY_CHECKS = 1;

USE dajiangtang;

SET NAMES utf8mb4;

INSERT INTO user_accounts (username, password_hash, phone, role, created_at) VALUES
('admin', 'a36aef5a11c4073fbe60314fc9df530a9d5f986533594d1f5190742ff9e0e408', '13800000000', 'ADMIN', '2026-05-03 00:00:00'),
('cspm_user', 'f0fe04e5c1df6c096f12d70c4229fcfcbc5d151bea3cb63e2c15d3bd87f3eb5b', '13800000001', 'USER', '2026-05-03 00:00:00'),
('cspm_company', 'f0fe04e5c1df6c096f12d70c4229fcfcbc5d151bea3cb63e2c15d3bd87f3eb5b', '13800000002', 'COMPANY', '2026-05-03 00:00:00');

INSERT INTO recruitments (id, position, salary, company_name, city, owner, headcount, cspm_preferred, status, contact_phone, published_at, updated_at) VALUES
('rec-001', '项目经理', '15k-25k', '北京示例科技有限公司', '北京市', '赵义民', 3, TRUE, 'RECRUITING', '13800000000', '2026-04-20 09:00:00', '2026-04-25 09:00:00'),
('rec-002', 'Java 后端工程师', '20k-35k', '上海云启软件有限公司', '上海市', '钱启航', 5, FALSE, 'ACTIVE', '13800000000', '2026-04-21 09:00:00', '2026-04-26 09:00:00'),
('rec-003', '前端工程师', '18k-30k', '深圳灵犀互动有限公司', '深圳市', '孙若水', 4, FALSE, 'RECRUITING', '13800000000', '2026-04-22 09:00:00', '2026-04-22 09:00:00'),
('rec-004', '数据分析师', '16k-28k', '杭州数智科技有限公司', '杭州市', '李文清', 2, TRUE, 'ACTIVE', '13800000000', '2026-04-19 09:00:00', '2026-04-27 09:00:00'),
('rec-005', '产品经理', '18k-32k', '北京创想网络有限公司', '北京市', '周一鸣', 1, FALSE, 'ACTIVE', '13800000000', '2026-04-18 09:00:00', '2026-04-24 09:00:00'),
('rec-006', '测试工程师', '12k-20k', '广州质量云有限公司', '广州市', '吴知远', 3, FALSE, 'RECRUITING', '13800000000', '2026-04-17 09:00:00', '2026-04-23 09:00:00'),
('rec-007', '运维工程师', '14k-24k', '成都稳定科技有限公司', '成都市', '郑青山', 2, FALSE, 'ACTIVE', '13800000000', '2026-04-16 09:00:00', '2026-04-21 09:00:00'),
('rec-008', '算法工程师', '28k-45k', '上海智算未来有限公司', '上海市', '王可为', 2, TRUE, 'RECRUITING', '13800000000', '2026-04-15 09:00:00', '2026-04-28 09:00:00'),
('rec-009', '安全工程师', '22k-38k', '南京安云科技有限公司', '南京市', '冯澄', 1, TRUE, 'ACTIVE', '13800000000', '2026-04-14 09:00:00', '2026-04-20 09:00:00'),
('rec-010', '销售经理', '13k-25k', '武汉拓客科技有限公司', '武汉市', '陈远', 6, FALSE, 'RECRUITING', '13800000000', '2026-04-13 09:00:00', '2026-04-19 09:00:00'),
('rec-011', '人力资源专员', '9k-15k', '西安诚聘服务有限公司', '西安市', '刘晓', 2, FALSE, 'ACTIVE', '13800000000', '2026-04-12 09:00:00', '2026-04-18 09:00:00'),
('rec-012', '客户成功经理', '12k-22k', '深圳企服科技有限公司', '深圳市', '何念', 3, FALSE, 'RECRUITING', '13800000000', '2026-04-11 09:00:00', '2026-04-17 09:00:00'),
('rec-013', 'Java 架构师', '35k-55k', '北京平台科技有限公司', '北京市', '马骁', 1, TRUE, 'ACTIVE', '13800000000', '2026-04-23 09:00:00', '2026-04-29 09:00:00'),
('rec-014', 'CSPM 顾问', '25k-40k', '北京合规科技有限公司', '北京市', '唐砚', 1, TRUE, 'CLOSED', '13800000000', '2026-04-24 09:00:00', '2026-04-30 09:00:00'),
('rec-015', '招聘专员', '8k-13k', '上海人才服务有限公司', '上海市', '朱宁', 2, FALSE, 'PAUSED', '13800000000', '2026-04-10 09:00:00', '2026-04-16 09:00:00');

UPDATE recruitments
SET department = COALESCE(department, '业务部'),
    recruitment_post = COALESCE(recruitment_post, position),
    job_tags = IF(cspm_preferred, 'CSPM优先,项目管理', '项目管理'),
    work_location = CONCAT(city, '核心商务区'),
    required_arrival_date = '2026-06-01',
    recruitment_progress = CASE status
      WHEN 'ACTIVE' THEN '简历筛选中'
      WHEN 'RECRUITING' THEN '面试推进中'
      WHEN 'PAUSED' THEN '暂缓招聘'
      ELSE '已关闭'
    END,
    job_description = CONCAT('负责', position, '相关项目规划、交付推进、风险控制与跨部门协同，确保岗位目标按期达成。'),
    job_requirement = '具备相关岗位经验，熟悉项目管理流程，沟通协调能力强，能够独立推进复杂任务。',
    skill_requirement = '项目管理,沟通协作,风险控制,需求分析',
    welfare = '五险一金,带薪年假,绩效奖金,定期体检',
    follower = owner,
    level = 'P4',
    remark = '数据库初始化岗位，详情字段完整可用于客户演示。';

INSERT INTO companies (account_username, company_type, company_name, full_name, company_size, industry, city, contact_name, work_time, welfare_insurance, welfare_allowance, maintainer, phone, website, address, email, description, status, user_level, remark, fields_json) VALUES
('cspm_company', '民营企业', '智博未来科技有限公司', '智博未来科技有限公司', '100-499人', '人工智能 / 云计算', '上海市', '陈静', '09:00-18:00', '五险一金', '餐补/交通补助', '张建国', '021-88889999', 'www.zhibo_future.tech', '张江高科技园区张衡路1000号智博大厦12层', 'contact@zhibo_future.com', '智博未来科技成立于2015年，是一家专注于政企数字化转型的领先服务商。', '活跃', '重点用户', '该客户目前正在进行B轮融资，扩招需求明显。', JSON_OBJECT('公司名称 *', '智博未来科技有限公司', '公司类型', '民营企业', '所属行业', '人工智能 / 云计算', '人员规模', '100-499人', '客户简介', '智博未来科技成立于2015年，是一家专注于政企数字化转型的领先服务商。', '联系人姓名', '陈静', '企业总机', '021-88889999', '商务邮箱', 'contact@zhibo_future.com', '官方网址', 'www.zhibo_future.tech', '详细办公地址', '张江高科技园区张衡路1000号智博大厦12层', '五险一金 (全额缴纳)', true, '餐补/交通补助', true, '年度体检 & 团建', true, '输入仅内部可见的备注信息...', '该客户目前正在进行B轮融资，扩招需求明显。')),
(NULL, '国有企业', '中信咨询集团', '中信咨询集团有限公司', '1000人以上', '金融', '北京市', '李经理', '9:00-18:00', '五险一金', '餐补', '贺强', '010-88888888', 'https://example.cn', '北京市朝阳区示例路 200 号', 'contact@example.cn', '提供咨询、项目治理与人才服务。', '正常', '重点用户', '演示企业数据', NULL);

INSERT INTO talents (masked_name, gender, job_intention, expected_city, current_company, position_title, current_city, industry, personal_advantage, profile, contact_owner) VALUES
('张*明', '男', '高级项目经理', '上海市', '华东数字科技有限公司', '项目经理', '上海市', '互联网', '具备跨部门项目治理、进度风险控制与团队协同经验。', '10 年项目管理经验，主导多个企业数字化转型项目。', '赵义民'),
('李*华', '女', 'PMO 负责人', '北京市', '中信咨询集团', 'PMO 主管', '北京市', '金融', '熟悉大型集团项目集管理、预算控制和流程标准化。', '8 年金融行业 PMO 经验，持有 CSPM 相关证书。', '贺强'),
('王*雪', '女', '项目顾问', '深圳市', '深圳智造科技有限公司', '项目顾问', '深圳市', '互联网', '擅长敏捷项目推进、需求拆解和干系人沟通。', '6 年项目交付经验，服务制造与互联网客户。', '蔡钰炜'),
('陈*刚', '男', '制造业项目经理', '上海市', '苏州精工智能制造有限公司', '项目经理', '上海市', '制造业', '熟悉智能制造项目现场交付、质量管理和供应商协同。', '12 年制造业项目管理经验，主导多地工厂改造项目。', '赵义民');

INSERT INTO talent_certificates (talent_id, certificate_name, certificate_level, issued_at) VALUES
(1, 'CSPM', '三级', '2024-06-01'),
(2, 'CSPM', '四级', '2023-10-01'),
(3, 'PMP', '认证', '2022-05-01'),
(4, 'CSPM', '三级', '2024-03-01');
