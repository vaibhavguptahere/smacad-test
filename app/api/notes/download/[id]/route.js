import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const client = await clientPromise;
    const db = client.db('sm-academy');
    
    const note = await db.collection('notes').findOne({ _id: new ObjectId(id) });
    
    if (!note) {
      return NextResponse.json(
        { message: 'Note not found' },
        { status: 404 }
      );
    }

    if (!note.fileUrl) {
      return NextResponse.json(
        { message: 'File URL not found' },
        { status: 404 }
      );
    }

    // Increment download count
    await db.collection('notes').updateOne(
      { _id: new ObjectId(id) },
      { 
        $inc: { downloadCount: 1 },
        $set: { lastDownloaded: new Date() }
      }
    );

    // Log download activity
    await db.collection('downloads').insertOne({
      noteId: new ObjectId(id),
      noteTitle: note.title,
      subject: note.subject,
      topic: note.topic,
      downloadedAt: new Date(),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown'
    });

    // Redirect to Cloudinary URL for direct download
    return NextResponse.redirect(note.fileUrl);
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}