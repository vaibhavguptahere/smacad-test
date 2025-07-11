import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyToken } from '@/lib/auth';

export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    const client = await clientPromise;
    const db = client.db('sm-academy');
    
    const contact = await db.collection('contacts').findOne({ _id: new ObjectId(id) });
    
    if (!contact) {
      return NextResponse.json(
        { message: 'Contact not found' },
        { status: 404 }
      );
    }

    await db.collection('contacts').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { status } = await request.json();
    
    const client = await clientPromise;
    const db = client.db('sm-academy');
    
    const contact = await db.collection('contacts').findOne({ _id: new ObjectId(id) });
    
    if (!contact) {
      return NextResponse.json(
        { message: 'Contact not found' },
        { status: 404 }
      );
    }

    await db.collection('contacts').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: status,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({ message: 'Contact status updated successfully' });
  } catch (error) {
    console.error('Update contact error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}