CREATE TABLE payment_method_audit_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  parent_id BIGINT NOT NULL,
  payment_method_id BIGINT NOT NULL,
  action VARCHAR(50) NOT NULL,
  details VARCHAR(255) NOT NULL,
  performed_by BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES parents (id)
);
