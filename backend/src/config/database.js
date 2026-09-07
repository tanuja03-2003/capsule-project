const fs = require('fs');
const path = require('path');

//"Here we import the mysql2 driver, which allows our Node.js application to communicate with MySQL."
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dataDir = path.join(__dirname, '..', '..', 'data');
const dataFilePath = path.join(dataDir, 'eventhub.json');
let pool = null;

function getMysqlConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'eventhub',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
  };
}

//connection pool creation 

function getPool() {
  if (process.env.USE_MYSQL === 'false') {
    return null;
  }

  if (!pool) {
    pool = mysql.createPool(getMysqlConfig());
  }

  return pool;
}

async function testConnection() {
  const activePool = getPool();
  if (!activePool) {
    return false;
  }

  try {
    await activePool.query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
}

async function ensureMysqlSchema() {
  const activePool = getPool();
  if (!activePool) {
    return false;
  }

  try {
    await activePool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        event_date DATE,
        event_time TIME,
        price DECIMAL(10,2) DEFAULT 0,
        image_url TEXT,
        available_tickets INT DEFAULT 0,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await activePool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_users_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await activePool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NULL,
        event_id INT NOT NULL,
        person_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NULL,
        number_of_tickets INT NOT NULL,
        total_amount DECIMAL(10,2) DEFAULT 0,
        booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'CONFIRMED',
        PRIMARY KEY (id),
        KEY idx_event_id (event_id),
        KEY idx_user_id (user_id),
        CONSTRAINT fk_bookings_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await activePool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

  const schemaColumns = [
  ['users', 'email', 'ALTER TABLE users ADD COLUMN email VARCHAR(255) NULL AFTER name'],
  ['bookings', 'user_id', 'ALTER TABLE bookings ADD COLUMN user_id INT NULL AFTER id'],
  ['bookings', 'email', 'ALTER TABLE bookings ADD COLUMN email VARCHAR(255) NULL AFTER person_name'],
  ['bookings', 'total_amount', 'ALTER TABLE bookings ADD COLUMN total_amount DECIMAL(10,2) DEFAULT 0 AFTER number_of_tickets'],
  ['bookings', 'status', 'ALTER TABLE bookings ADD COLUMN status VARCHAR(50) DEFAULT "CONFIRMED" AFTER booking_date']
];

for (const [tableName, columnName, statement] of schemaColumns) {
  try {
    const [columns] = await activePool.query(
      `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      `,
      [tableName, columnName]
    );

    if (columns.length === 0) {
      await activePool.query(statement);
      console.log(`Added missing column ${tableName}.${columnName}`);
    }
  } catch (error) {
    console.warn(
      `Schema migration warning for ${tableName}.${columnName}:`,
      error.message
    );
  }
}

    return true;
  } catch (error) {
    console.warn('MySQL schema initialization failed:', error);
    return false;
  }
}

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFilePath)) {
    const initialData = {
      events: [
        {
          id: 1,
          name: 'Summer Music Festival',
          description: 'A vibrant outdoor concert featuring top artists.',
          location: 'Green Park',
          event_date: '2026-08-20',
          event_time: '19:00',
          price: 75.0,
          image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
          available_tickets: 100
        },
        {
          id: 2,
          name: 'Tech Innovation Expo',
          description: 'Explore the future of technology and AI.',
          location: 'Innovation Center',
          event_date: '2026-09-15',
          event_time: '10:00',
          price: 45.0,
          image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865',
          available_tickets: 80
        },
        {
          id: 3,
          name: 'Cultural Heritage Night',
          description: 'An evening celebrating art, dance, and tradition.',
          location: 'City Hall Arena',
          event_date: '2026-10-05',
          event_time: '18:30',
          price: 30.0,
          image_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a',
          available_tickets: 60
        }
      ],
      bookings: [],
      contacts: []
    };

    fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2));
  }
}

function normalizeDatabaseData(data) {
  if (!data.bookings || !Array.isArray(data.bookings)) {
    data.bookings = [];
  }

  data.bookings = data.bookings.map((booking) => {
    if (!booking.person_name && booking.customer_name) {
      booking.person_name = booking.customer_name;
    }
    if (!booking.customer_name && booking.person_name) {
      booking.customer_name = booking.person_name;
    }
    if (!booking.person_name && !booking.customer_name) {
      booking.person_name = 'Guest';
      booking.customer_name = 'Guest';
    }
    return booking;
  });

  return data;
}

function readDatabase() {
  ensureDataFile();
  const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  return normalizeDatabaseData(data);
}

function writeDatabase(data) {
  const normalizedData = normalizeDatabaseData(data);
  fs.writeFileSync(dataFilePath, JSON.stringify(normalizedData, null, 2));
}

async function initializeDatabase() {
  const mysqlReady = await ensureMysqlSchema(); //This gives Node.js the ability to communicate with MySQL.
  if (mysqlReady) {
    return;
  }

  const data = readDatabase();
  if (!data.events || data.events.length === 0) {
    data.events = [
      {
        id: 1,
        name: 'Summer Music Festival',
        description: 'A vibrant outdoor concert featuring top artists.',
        location: 'Green Park',
        event_date: '2026-08-20',
        event_time: '19:00',
        price: 75.0,
        image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
        available_tickets: 100
      },
      {
        id: 2,
        name: 'Tech Innovation Expo',
        description: 'Explore the future of technology and AI.',
        location: 'Innovation Center',
        event_date: '2026-09-15',
        event_time: '10:00',
        price: 45.0,
        image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865',
        available_tickets: 80
      },
      {
        id: 3,
        name: 'Cultural Heritage Night',
        description: 'An evening celebrating art, dance, and tradition.',
        location: 'City Hall Arena',
        event_date: '2026-10-05',
        event_time: '18:30',
        price: 30.0,
        image_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a',
        available_tickets: 60
      }
    ];
    data.bookings = [];
    data.contacts = [];
    writeDatabase(data);
  }
}

module.exports = {
  getPool,
  testConnection,
  ensureMysqlSchema,
  readDatabase,
  writeDatabase,
  initializeDatabase
};
