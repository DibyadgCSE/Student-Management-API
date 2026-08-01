require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function initializeDatabase() {
  const client = await db.getClient();
  try {
    console.log('🔄 Initializing Database Schema...');
    
    // Read SQL schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema SQL commands
    await client.query(sql);
    console.log('✅ PostgreSQL Schema & Tables created successfully!');

    // Seed default Admin User if not already present
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    const existingAdmin = await client.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    
    if (existingAdmin.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      await client.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, $4)`,
        ['Super Admin', adminEmail, hashedPassword, 'admin']
      );
      console.log(`👤 Default Admin user seeded: ${adminEmail} / ${adminPassword}`);
    } else {
      console.log('ℹ️ Admin user already exists.');
    }

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

initializeDatabase();
