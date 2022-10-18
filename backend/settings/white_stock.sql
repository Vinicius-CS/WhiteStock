CREATE DATABASE IF NOT EXISTS white_stock DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE white_stock;

CREATE TABLE IF NOT EXISTS company (
  id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  cnpj VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  photo VARCHAR(255) NOT NULL,
  plan int(11) NOT NULL,
  payment_type ENUM('month','year') NOT NULL DEFAULT 'month',
  enabled ENUM('true','false') NOT NULL DEFAULT 'true'
);

CREATE TABLE IF NOT EXISTS plan (
  id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description VARCHAR(255) NOT NULL,
  month_price decimal(7,2) NOT NULL,
  year_price decimal(7,2) NOT NULL,
  enabled ENUM('true','false') NOT NULL DEFAULT 'true'
);

CREATE TABLE IF NOT EXISTS resource (
  id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description VARCHAR(255) NOT NULL,
  enabled ENUM('true','false') NOT NULL DEFAULT 'true'
);

CREATE TABLE IF NOT EXISTS plan_resource (
  id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  plan_id int(11) NOT NULL,
  resource_id int(11) NOT NULL,
  enabled ENUM('true','false') NOT NULL DEFAULT 'true',
  FOREIGN KEY (resource_id) REFERENCES resource(id)
);

CREATE TABLE IF NOT EXISTS role (
  id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description VARCHAR(255) NOT NULL,
  company_id INT(11) NOT NULL,
  enabled ENUM('true','false') NOT NULL DEFAULT 'true',
  FOREIGN KEY (company_id) REFERENCES company(id)
);

CREATE TABLE IF NOT EXISTS permission (
  id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description VARCHAR(255) NOT NULL,
  role_id INT(11) NOT NULL,
  company_id INT(11) NOT NULL,
  enabled ENUM('true','false') NOT NULL DEFAULT 'true',
  FOREIGN KEY (role_id) REFERENCES role(id),
  FOREIGN KEY (company_id) REFERENCES company(id)
);

CREATE TABLE IF NOT EXISTS collaborator (
  id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  cpf VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  gender ENUM('female','male') NOT NULL,
  photo VARCHAR(255) NOT NULL,
  role_id INT(11) NOT NULL,
  company_id INT(11) NOT NULL,
  enabled ENUM('true','false') NOT NULL DEFAULT 'true',
  FOREIGN KEY (role_id) REFERENCES role(id),
  FOREIGN KEY (company_id) REFERENCES company(id)
);

CREATE TABLE IF NOT EXISTS product_category (
  id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  company_id INT(11) NOT NULL,
  enabled ENUM('true','false') NOT NULL DEFAULT 'true',
  FOREIGN KEY (company_id) REFERENCES company(id)
);

CREATE TABLE IF NOT EXISTS product (
  id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  photo VARCHAR(255) NOT NULL,
  stock INT(11) NOT NULL DEFAULT 0,
  category_id INT(11) NOT NULL,
  company_id INT(11) NOT NULL,
  enabled ENUM('true','false') NOT NULL DEFAULT 'true',
  FOREIGN KEY (category_id) REFERENCES product_category(id),
  FOREIGN KEY (company_id) REFERENCES company(id)
);

INSERT INTO plan (name, description, month_price, year_price, enabled) VALUES ('Start', 'Ideal para pequenas empresas.', '49.99', '539.89', 'true'), ('Lite', 'Ideal para médias empresas.', '69.99', '671.89', 'true'), ('Pro', 'Ideal para grandes empresas.', '89.99', '755.89', 'true');