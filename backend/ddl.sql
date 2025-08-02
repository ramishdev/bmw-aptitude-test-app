CREATE DATABASE IF NOT EXISTS bmw_it_test;
USE bmw_it_test;

CREATE TABLE IF NOT EXISTS cars (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  brand             VARCHAR(50),
  model             VARCHAR(100),
  accel_sec         DECIMAL(4,1),
  top_speed_kmh     INT,
  range_km          INT,
  efficiency_whkm   INT,
  fast_charge_kmh   INT,
  rapid_charge      VARCHAR(3),
  power_train       VARCHAR(10),
  plug_type         VARCHAR(20),
  body_style        VARCHAR(20),
  segment           VARCHAR(5),
  seats             TINYINT,
  price_euro        INT,
  date              DATE
);