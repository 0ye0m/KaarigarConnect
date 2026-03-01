import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const worker = await db.workerProfile.findUnique({
      where: { id },
      include: {
        user: true,
        reviews: {
          include: {
            customer: true,
          },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
      },
    });

    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    return NextResponse.json({ worker });
  } catch (error) {
    console.error('Get worker error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if user is admin or the worker themselves
    const user = await db.profile.findUnique({
      where: { id: userId },
    });

    const workerProfile = await db.workerProfile.findUnique({
      where: { id },
    });

    if (!workerProfile) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    if (user?.role !== 'admin' && workerProfile.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData: any = {};
    
    if (body.is_verified !== undefined) updateData.is_verified = body.is_verified;
    if (body.is_available !== undefined) updateData.is_available = body.is_available;
    if (body.skill_category) updateData.skill_category = body.skill_category;
    if (body.experience_years !== undefined) updateData.experience_years = body.experience_years;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.hourly_rate !== undefined) updateData.hourly_rate = body.hourly_rate;
    if (body.latitude !== undefined) updateData.latitude = body.latitude;
    if (body.longitude !== undefined) updateData.longitude = body.longitude;
    if (body.radius_km !== undefined) updateData.radius_km = body.radius_km;

    const worker = await db.workerProfile.update({
      where: { id },
      data: updateData,
      include: { user: true },
    });

    return NextResponse.json({ worker });
  } catch (error) {
    console.error('Update worker error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
