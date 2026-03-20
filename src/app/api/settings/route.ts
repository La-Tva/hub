import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json(user.settings);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  await dbConnect();

  const updateData: any = {};
  const pushData: any = {};
  
  if (body.wallpaper) {
    updateData["settings.wallpaper"] = body.wallpaper;
    pushData["settings.wallpaperHistory"] = body.wallpaper;
  }
  if (body.theme) updateData["settings.theme"] = body.theme;
  if (body.clockFormat) updateData["settings.clockFormat"] = body.clockFormat;

  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    { 
      $set: updateData,
      ...(Object.keys(pushData).length > 0 ? { $addToSet: pushData } : {})
    },
    { new: true, upsert: true }
  );

  return NextResponse.json(user.settings);
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  await dbConnect();

  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    { $pull: { "settings.wallpaperHistory": body.wallpaper } },
    { new: true }
  );

  return NextResponse.json(user.settings);
}
