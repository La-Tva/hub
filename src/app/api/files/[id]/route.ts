import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FileModel from '@/models/File';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const file = await FileModel.findById(id);

    if (!file) {
      return new NextResponse('File not found', { status: 404 });
    }

    return new NextResponse(file.data, {
      headers: {
        'Content-Type': file.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('File retrieval error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
