import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyToken } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request, { params }) {
  try {
    // ✅ Authenticate
    const token = request.cookies.get('admin-token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const client = await clientPromise;
    const db = client.db('sm-academy');

    // ✅ Find the note
    const note = await db.collection('notes').findOne({ _id: new ObjectId(id) });
    if (!note) {
      return NextResponse.json({ message: 'Note not found' }, { status: 404 });
    }

    // ✅ Delete from Cloudinary if publicId exists
    if (note.publicId) {
      try {
        await cloudinary.uploader.destroy(note.publicId);
        console.log(`Cloudinary file ${note.publicId} deleted.`);
      } catch (cloudErr) {
        console.warn(`Failed to delete Cloudinary file: ${cloudErr.message}`);
      }
    }

    // ✅ Delete from MongoDB
    await db.collection('notes').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
