import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('sm-academy');
    
    // Check if admin already exists
    const existingAdmin = await db.collection('admins').findOne({ username });
    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Admin already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    
    const admin = {
      username,
      password: hashedPassword,
      createdAt: new Date()
    };

    await db.collection('admins').insertOne(admin);

    return NextResponse.json({ message: 'Admin created successfully' });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('sm-academy');
    
    const adminCount = await db.collection('admins').countDocuments();
    
    return NextResponse.json({ 
      hasAdmin: adminCount > 0,
      adminCount 
    });
  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}