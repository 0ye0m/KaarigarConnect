import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.profile.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let bookings;

    if (user.role === 'customer') {
      bookings = await db.booking.findMany({
        where: { customer_id: userId },
        include: {
          worker: {
            include: {
              user: true,
            },
          },
          messages: {
            include: {
              sender: true,
            },
            orderBy: { created_at: 'asc' },
          },
          review: true,
        },
        orderBy: { created_at: 'desc' },
      });
    } else if (user.role === 'worker') {
      const workerProfile = await db.workerProfile.findUnique({
        where: { user_id: userId },
      });

      if (!workerProfile) {
        return NextResponse.json(
          { error: 'Worker profile not found' },
          { status: 404 }
        );
      }

      bookings = await db.booking.findMany({
        where: { worker_id: workerProfile.id },
        include: {
          customer: true,
          messages: {
            include: {
              sender: true,
            },
            orderBy: { created_at: 'asc' },
          },
          review: true,
        },
        orderBy: { created_at: 'desc' },
      });
    } else {
      // Admin can see all
      bookings = await db.booking.findMany({
        include: {
          customer: true,
          worker: {
            include: {
              user: true,
            },
          },
          messages: {
            include: {
              sender: true,
            },
            orderBy: { created_at: 'asc' },
          },
          review: true,
        },
        orderBy: { created_at: 'desc' },
      });
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      worker_id,
      service_type,
      description,
      scheduled_date,
      scheduled_time,
      address,
      latitude,
      longitude,
    } = body;

    const booking = await db.booking.create({
      data: {
        id: uuidv4(),
        customer_id: userId,
        worker_id,
        service_type,
        description,
        scheduled_date: new Date(scheduled_date),
        scheduled_time,
        address,
        latitude,
        longitude,
        status: 'pending',
      },
      include: {
        customer: true,
        worker: {
          include: {
            user: true,
          },
        },
      },
    });

    // Create notification for worker
    const worker = await db.workerProfile.findUnique({
      where: { id: worker_id },
      include: { user: true },
    });

    if (worker) {
      await db.notification.create({
        data: {
          id: uuidv4(),
          user_id: worker.user_id,
          title: 'New Booking Request',
          message: `New booking request for ${service_type} from ${booking.customer.full_name || 'A customer'}`,
          type: 'booking_request',
          booking_id: booking.id,
        },
      });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
