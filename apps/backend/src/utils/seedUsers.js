const bcrypt = require('bcryptjs');
const db = require('../services/database.js');
const logger = require('./logger.js');

/**
 * Seed default users if they don't exist
 * This helps with initial setup and testing
 */
async function seedDefaultUsers() {
  try {
    logger.info('Checking for default users...');

    // Hash for password "password123"
    const defaultPassword = 'password123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const defaultUsers = [
      {
        email: 'admin@test.com',
        name: 'Admin User',
        role: 'admin',
        password: passwordHash,
        is_active: true,
      },
      {
        email: 'tech@test.com',
        name: 'Technical Official',
        role: 'technical',
        password: passwordHash,
        is_active: true,
      },
      {
        email: 'ref@test.com',
        name: 'Referee',
        role: 'referee',
        password: passwordHash,
        is_active: true,
      },
    ];

    // Check and create each user if they don't exist
    for (const user of defaultUsers) {
      const { data: existingUser, error: selectError } = await db.supabase
        .from('wl_users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (selectError?.code === 'PGRST116') {
        // User doesn't exist, create it
        const { error: insertError, data: newUser } = await db.supabase
          .from('wl_users')
          .insert([user])
          .select();

        if (insertError) {
          logger.error(`Failed to create user ${user.email}: ${insertError.message}`);
        } else {
          logger.info(`✓ Created user: ${user.email}`);
        }
      } else if (!selectError && existingUser) {
        logger.info(`✓ User already exists: ${user.email}`);
      } else if (selectError) {
        logger.error(`Error checking user ${user.email}: ${selectError.message}`);
      }
    }

    logger.info('User seeding complete');
  } catch (error) {
    logger.error('Error seeding users:', error);
  }
}

module.exports = seedDefaultUsers;
