/*
This file contains the SQL statements to create or update the database schema.
Run these statements in your MySQL database to set up the required tables.
*/

// Users table
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fullName VARCHAR(100) NOT NULL,
  indexNumber VARCHAR(50),
  phoneNumber VARCHAR(20),
  role ENUM('student', 'supervisor', 'admin', 'faculty') NOT NULL DEFAULT 'student',
  department VARCHAR(100),
  profileImage VARCHAR(255),
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`

// Resources table
const createResourcesTable = `
CREATE TABLE IF NOT EXISTS resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('mini-project', 'final-project', 'past-exam', 'thesis') NOT NULL,
  department VARCHAR(100) NOT NULL,
  filePath VARCHAR(255) NOT NULL,
  fileSize INT NOT NULL,
  fileType VARCHAR(100) NOT NULL,
  uploadedBy INT NOT NULL,
  studentId INT,
  supervisorId INT,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  rejectionReason TEXT,
  views INT DEFAULT 0,
  downloads INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (uploadedBy) REFERENCES users(id),
  FOREIGN KEY (studentId) REFERENCES users(id),
  FOREIGN KEY (supervisorId) REFERENCES users(id)
)`

// Resource metadata table
const createResourceMetadataTable = `
CREATE TABLE IF NOT EXISTS resource_metadata (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resourceId INT NOT NULL,
  year VARCHAR(4),
  semester VARCHAR(20),
  course VARCHAR(100),
  tags TEXT,
  FOREIGN KEY (resourceId) REFERENCES resources(id) ON DELETE CASCADE
)`

// Resource access logs table
const createResourceAccessLogsTable = `
CREATE TABLE IF NOT EXISTS resource_access_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resourceId INT NOT NULL,
  userId INT NOT NULL,
  action ENUM('view', 'download') NOT NULL,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resourceId) REFERENCES resources(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id)
)`

// Comments table
const createCommentsTable = `
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resourceId INT NOT NULL,
  userId INT NOT NULL,
  content TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (resourceId) REFERENCES resources(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id)
)`

// Bookmarks table
const createBookmarksTable = `
CREATE TABLE IF NOT EXISTS bookmarks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resourceId INT NOT NULL,
  userId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resourceId) REFERENCES resources(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id),
  UNIQUE KEY user_resource (userId, resourceId)
)`

module.exports = {
  createUsersTable,
  createResourcesTable,
  createResourceMetadataTable,
  createResourceAccessLogsTable,
  createCommentsTable,
  createBookmarksTable,
}
