import mongoose from 'mongoose';
import AdminUser from '../server/models/AdminUser.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await AdminUser.find({});
  console.log('Admins in DB:', users.map(u => ({ email: u.email, role: u.role })));
  process.exit(0);
}

checkAdmin();
