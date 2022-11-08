CREATE DATABASE IF NOT EXISTS white_stock DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE white_stock;

CREATE TABLE IF NOT EXISTS company (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  cnpj VARCHAR(20) NOT NULL UNIQUE,
  address VARCHAR(255) NOT NULL,
  photo VARCHAR(255) NOT NULL,
  plan INT(11) NOT NULL,
  payment_type ENUM('month','year') NOT NULL DEFAULT 'month',
  enabled ENUM('true','false') NOT NULL DEFAULT 'true',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE TABLE IF NOT EXISTS plan (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description VARCHAR(255) NOT NULL,
  month_price decimal(7,2) NOT NULL,
  year_price decimal(7,2) NOT NULL,
  resource JSON NOT NULL DEFAULT '{"collaborator":"0","product":"0","automation":"false","customization":"false"}',
  enabled ENUM('true','false') NOT NULL DEFAULT 'true'
);

CREATE TABLE IF NOT EXISTS collaborator (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  cpf VARCHAR(20) NOT NULL UNIQUE,
  gender ENUM('female','male') NOT NULL,
  photo VARCHAR(255) NOT NULL,
  company_id INT(11) NOT NULL,
  enabled ENUM('true','false') NOT NULL DEFAULT 'true',
  permission JSON NOT NULL DEFAULT '{"collaborator":{"view":"0","add":"0","edit":"0","delete":"0"},"product":{"view":"0","add":"0","edit":"0","delete":"0"},"category":{"view":"0","add":"0","edit":"0","delete":"0"},"company":{"view":"0","add":"0","edit":"0","delete":"0"}}',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (company_id) REFERENCES company(id)
);

CREATE TABLE IF NOT EXISTS product_category (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  company_id INT(11) NOT NULL,
  enabled ENUM('true','false') NOT NULL DEFAULT 'true',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (company_id) REFERENCES company(id)
);

CREATE TABLE IF NOT EXISTS product (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  photo VARCHAR(255) NOT NULL,
  category_id INT(11) NOT NULL,
  company_id INT(11) NOT NULL,
  enabled ENUM('true','false') NOT NULL DEFAULT 'true',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (category_id) REFERENCES product_category(id),
  FOREIGN KEY (company_id) REFERENCES company(id)
);

CREATE TABLE IF NOT EXISTS product_order (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  amount INT NOT NULL DEFAULT 0,
  product_id INT(11) NOT NULL,
  delivered_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (product_id) REFERENCES product(id)
);

CREATE TABLE IF NOT EXISTS product_output (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  amount INT NOT NULL DEFAULT 0,
  product_id INT(11) NOT NULL,
  bought_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES product(id)
);

INSERT INTO plan (name, description, month_price, year_price, enabled) VALUES ('Start', 'Ideal para pequenas empresas.', '49.99', '539.89', 'true'), ('Lite', 'Ideal para médias empresas.', '69.99', '671.89', 'true'), ('Pro', 'Ideal para grandes empresas.', '89.99', '755.89', 'true');