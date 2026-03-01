import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get('skill');
    const maxDistance = parseFloat(searchParams.get('maxDistance') || '50');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const maxRate = parseFloat(searchParams.get('maxRate') || '10000');
    const availableOnly = searchParams.get('availableOnly') === 'true';
    const userLat = parseFloat(searchParams.get('lat') || '0');
    const userLng = parseFloat(searchParams.get('lng') || '0');

    let workers = await db.workerProfile.findMany({
      where: {
        ...(skill && { skill_category: skill }),
        ...(availableOnly && { is_available: true }),
        hourly_rate: { lte: maxRate },
        rating: { gte: minRating },
      },
      include: {
        user: true,
        reviews: {
          include: {
            customer: true,
          },
          orderBy: { created_at: 'desc' },
          take: 5,
        },
      },
    });

    // Filter by distance if coordinates provided
    if (userLat && userLng) {
      workers = workers.filter((worker) => {
        if (!worker.latitude || !worker.longitude) return false;
        const distance = calculateDistance(
          userLat,
          userLng,
          worker.latitude,
          worker.longitude
        );
        return distance <= maxDistance;
      });

      // Add distance to each worker
      workers = workers.map((worker) => ({
        ...worker,
        distance: calculateDistance(
          userLat,
          userLng,
          worker.latitude || 0,
          worker.longitude || 0
        ),
      })) as typeof workers;

      // Sort by distance
      workers.sort((a, b) => {
        const distA = (a as any).distance || 0;
        const distB = (b as any).distance || 0;
        return distA - distB;
      });
    }

    return NextResponse.json({ workers });
  } catch (error) {
    console.error('Get workers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      skill_category,
      experience_years,
      bio,
      hourly_rate,
      latitude,
      longitude,
      radius_km,
    } = body;

    const worker = await db.workerProfile.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        skill_category,
        experience_years: experience_years || 0,
        bio,
        hourly_rate: hourly_rate || 0,
        latitude,
        longitude,
        radius_km: radius_km || 10,
      },
      update: {
        skill_category,
        experience_years,
        bio,
        hourly_rate,
        latitude,
        longitude,
        radius_km,
      },
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
