-- Initialize databases for Capsule Event Platform
CREATE DATABASE IF NOT EXISTS eventhub;
CREATE DATABASE IF NOT EXISTS payment_db;
CREATE DATABASE IF NOT EXISTS venue_access_db;

-- Initialize payment_db tables
USE payment_db;
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
  transaction_id VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Initialize venue_access_db tables
USE venue_access_db;
CREATE TABLE IF NOT EXISTS access_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  event_id INT NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  access_status VARCHAR(50) NOT NULL DEFAULT 'VALID',
  checked_in_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
