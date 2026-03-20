import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  return NextResponse.json(user?.apps || []);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const app = await request.json();
  await dbConnect();

  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    { $push: { apps: app } },
    { new: true, upsert: true }
  );

  return NextResponse.json(user.apps);
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await request.json();
  await dbConnect();

  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    { $pull: { apps: { id } } },
    { new: true }
  );

  return NextResponse.json(user.apps);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apps = await request.json();
  await dbConnect();

  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    { $set: { apps } },
    { new: true }
  );

  return NextResponse.json(user.apps);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, ...updatedFields } = await request.json();
  await dbConnect();

  const user = await User.findOneAndUpdate(
    { 
      email: session.user.email,
      "apps.id": id 
    },
    { 
      $set: {
        "apps.$.name": updatedFields.name,
        "apps.$.url": updatedFields.url,
        "apps.$.icon": updatedFields.icon,
      }
    },
    { new: true }
  );

  if (!user) {
    // Fallback if the first query failed (e.g. apps.id not found or structure issue)
    // Sometimes $set with $ positional operator fails if not matched correctly
    return NextResponse.json({ error: 'App not found' }, { status: 404 });
  }

  return NextResponse.json(user.apps);
}
