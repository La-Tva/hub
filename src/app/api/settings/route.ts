import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { pusherServer } from '@/lib/pusher';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json(user.settings);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
  if (body.notes !== undefined) updateData["settings.notes"] = body.notes;
  if (body.pomodoroSettings) {
    if (body.pomodoroSettings.work) updateData["settings.pomodoroSettings.work"] = body.pomodoroSettings.work;
    if (body.pomodoroSettings.shortBreak) updateData["settings.pomodoroSettings.shortBreak"] = body.pomodoroSettings.shortBreak;
    if (body.pomodoroSettings.longBreak) updateData["settings.pomodoroSettings.longBreak"] = body.pomodoroSettings.longBreak;
  }
  if (body.isSpotifyActive !== undefined) updateData["settings.isSpotifyActive"] = body.isSpotifyActive;
  if (body.spotifyPlaylistId) updateData["settings.spotifyPlaylistId"] = body.spotifyPlaylistId;
  if (body.clipboardContent !== undefined) updateData["settings.clipboardContent"] = body.clipboardContent;
  if (body.showClipboard !== undefined) updateData["settings.showClipboard"] = body.showClipboard;

  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    { 
      $set: updateData,
      ...(Object.keys(pushData).length > 0 ? { $addToSet: pushData } : {})
    },
    { new: true, upsert: true }
  );

  // Trigger Pusher event for Handoff
  if (pusherServer && session.user.name) {
    const channelName = `user-${encodeURIComponent(session.user.name.toLowerCase())}`;
    pusherServer.trigger(channelName, 'sync', body).catch(e => console.error('[Pusher] Error:', e));
  }

  return NextResponse.json(user.settings);
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  await dbConnect();

  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    { $pull: { "settings.wallpaperHistory": body.wallpaper } },
    { new: true }
  );

  return NextResponse.json(user.settings);
}
