import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Note ID is required' },
        { status: 400 }
      );
    }

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

    // Return the file URL with proper headers for download
    try {
      const fileResponse = await fetch(note.fileUrl);
      
      if (!fileResponse.ok) {
        return NextResponse.json(
          { message: 'File not accessible' },
          { status: 404 }
        );
      }

      const fileBuffer = await fileResponse.arrayBuffer();
      const fileName = note.title.replace(/[^a-zA-Z0-9]/g, '_') + '.' + (note.format || 'pdf');
      
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': note.mimeType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': fileBuffer.byteLength.toString(),
        },
      });
    } catch (fetchError) {
      console.error('Error fetching file from Cloudinary:', fetchError);
      // Fallback to redirect if fetch fails
      return NextResponse.redirect(note.fileUrl);
    }
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}