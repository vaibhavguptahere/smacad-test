import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('sm-academy');
    
    const notes = await db.collection('notes')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Notes fetch error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}