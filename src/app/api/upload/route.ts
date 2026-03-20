import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import FileModel from "@/models/File";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" });
    }

    await dbConnect();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const newFile = await FileModel.create({
      name: file.name,
      data: buffer,
      contentType: file.type,
      userId: session?.user?.email, // Using email as user identifier for now
    });

    return NextResponse.json({ 
      success: true, 
      url: `/api/files/${newFile._id}` 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
