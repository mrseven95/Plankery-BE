// MongoDB initialization script
db = db.getSiblingDB('plankery');

// Create application user
db.createUser({
  user: 'plankery_user',
  pwd: 'plankery_password',
  roles: [
    {
      role: 'readWrite',
      db: 'plankery'
    }
  ]
});

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
          description: 'Email must be a valid email address'
        },
        password: {
          bsonType: 'string',
          minLength: 6,
          description: 'Password must be at least 6 characters'
        },
        firstName: {
          bsonType: 'string',
          minLength: 1,
          description: 'First name is required'
        },
        lastName: {
          bsonType: 'string',
          minLength: 1,
          description: 'Last name is required'
        },
        isActive: {
          bsonType: 'bool',
          description: 'isActive must be a boolean'
        }
      }
    }
  }
});

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });
db.users.createIndex({ isActive: 1 });

print('Database initialization completed successfully!');
