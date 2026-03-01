import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// GET profile by email
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const profile = await db.profile.findUnique({
      where: { email },
      include: {
        worker_profile: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        role: profile.role,
        avatar_url: profile.avatar_url,
        city: profile.city,
        address: profile.address,
        latitude: profile.latitude,
        longitude: profile.longitude,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Get profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const profile = await db.profile.findUnique({
      where: { email },
      include: {
        worker_profile: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        role: profile.role,
        avatar_url: profile.avatar_url,
        city: profile.city,
        address: profile.address,
        latitude: profile.latitude,
        longitude: profile.longitude,
      },
    });
  } catch (error) {
    console.error('Profile sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Create new profile (called during registration)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, supabase_id, full_name, phone, role = 'customer', password } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if profile already exists
    const existingProfile = await db.profile.findUnique({
      where: { email },
    });

    if (existingProfile) {
      return NextResponse.json({ 
        error: 'An account with this email already exists',
      }, { status: 400 });
    }

    // Hash password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Create profile
    const profile = await db.profile.create({
      data: {
        id: supabase_id || uuidv4(),
        email,
        password: hashedPassword,
        full_name: full_name || null,
        phone: phone || null,
        role,
      },
    });

    // If role is worker, create worker profile
    if (role === 'worker') {
      await db.workerProfile.create({
        data: {
          id: uuidv4(),
          user_id: profile.id,
          skill_category: 'plumber',
          experience_years: 0,
          hourly_rate: 0,
          is_available: true,
          is_verified: false,
        },
      });
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        role: profile.role,
        avatar_url: profile.avatar_url,
        city: profile.city,
        address: profile.address,
      },
    });
  } catch (error) {
    console.error('Create profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
