// const { MongoClient } = require('mongodb');
// const bcrypt = require('bcryptjs');

// async function setupAdmin() {
//   const uri = process.env.MONGODB_URI;
  
//   if (!uri) {
//     console.error('❌ MONGODB_URI environment variable is not set');
//     process.exit(1);
//   }

//   console.log("Connecting to MongoDB cluster...");
//   const client = new MongoClient(uri);

//   try {
//     await client.connect();
//     console.log("✅ Connected to MongoDB cluster");

//     const db = client.db('sm-academy');
    
//     // Check if admin already exists
//     const existingAdmin = await db.collection('admins').findOne({ username: 'admin' });
    
//     if (existingAdmin) {
//       console.log('⚠️ Admin already exists');
//       console.log('Username: admin');
//       console.log('Use the existing credentials or delete the admin from database to create new one');
//       return;
//     }

//     // Create default admin
//     const defaultPassword = 'admin123';
//     const hashedPassword = await bcrypt.hash(defaultPassword, 12);
//     const admin = {
//       username: 'admin',
//       password: hashedPassword,
//       createdAt: new Date()
//     };

//     const result = await db.collection('admins').insertOne(admin);
//     console.log('✅ Default admin created successfully!');
//     console.log('Admin ID:', result.insertedId);
//     console.log('');
//     console.log('🔑 Login Credentials:');
//     console.log('Username: admin');
//     console.log('Password: admin123');
//     console.log('');
//     console.log('⚠️ Please change the default password after first login!');
    
//   } catch (error) {
//     console.error('❌ Setup error:', error.message);
    
//     if (error.message.includes('authentication failed')) {
//       console.log('');
//       console.log('💡 Troubleshooting tips:');
//       console.log('1. Check your MongoDB connection string');
//       console.log('2. Verify your database user credentials');
//       console.log('3. Ensure your IP is whitelisted in MongoDB Atlas');
//     }
//   } finally {
//     await client.close();
//     console.log("🔒 MongoDB connection closed");
//   }
// }

// // Check if MONGODB_URI is provided
// if (!process.env.MONGODB_URI) {
//   console.error('❌ Please set MONGODB_URI environment variable');
//   process.exit(1);
// }

// setupAdmin();
