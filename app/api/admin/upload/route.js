import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Optional: disable body parser if this is inside `pages/api`
// export const config = { api: { bodyParser: false } };

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    // ✅ Verify token
    const token = request.cookies.get('admin-token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Parse form fields
    const formData = await request.formData();
    const file = formData.get('file');
    const title = formData.get('title');
    const className = formData.get('class');
    const subject = formData.get('subject');
    const topic = formData.get('topic');
    const description = formData.get('description');

    if (!file || !title || !className || !subject || !topic) {
      return NextResponse.json(
        { message: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // ✅ Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ✅ Upload to Cloudinary
    const uploadToCloudinary = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'notes-uploads' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

    const result = await uploadToCloudinary();

    // ✅ Save metadata to MongoDB
    const client = await clientPromise;
    const db = client.db('sm-academy');

    const note = {
      title,
      class: className,
      subject,
      topic,
      description,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type,
      fileType: file.type,
      mimeType: file.type,
      size: file.size,
      createdAt: new Date(),
    };

    await db.collection('notes').insertOne(note);

    return NextResponse.json({ message: 'File uploaded successfully', url: result.secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
