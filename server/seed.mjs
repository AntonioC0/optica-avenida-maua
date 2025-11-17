import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { createSecureContext } from 'tls';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL não está definida');
  process.exit(1);
}

async function seed() {
  let connection;
  try {
    // Parse DATABASE_URL
    const url = new URL(DATABASE_URL);
    const config = {
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      port: url.port || 3306,
      ssl: {
        rejectUnauthorized: false,
      },
    };

    connection = await mysql.createConnection(config);

    // Check if admin user already exists
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE name = ? AND role = ?',
      ['Admin', 'owner']
    );

    if (rows.length > 0) {
      console.log('✓ Usuário admin já existe');
      await connection.end();
      return;
    }

    // Create admin user with a special openId
    const adminOpenId = 'admin-default-user-' + Date.now();
    await connection.execute(
      'INSERT INTO users (openId, name, email, loginMethod, role, lastSignedIn) VALUES (?, ?, ?, ?, ?, NOW())',
      [adminOpenId, 'Admin', 'admin@optica.local', 'local', 'owner']
    );

    console.log('✓ Usuário admin criado com sucesso');
    console.log('  - Nome: Admin');
    console.log('  - Role: owner');
    console.log('  - OpenID:', adminOpenId);

    await connection.end();
  } catch (error) {
    console.error('Erro ao executar seed:', error.message);
    process.exit(1);
  }
}

seed();
