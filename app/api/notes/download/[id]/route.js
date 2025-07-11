import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

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

    const filePath = path.join(process.cwd(), 'public', 'uploads', note.filename);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { message: 'File not found' },
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
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = note.mimeType || 'application/octet-stream';
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${note.filename}"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}