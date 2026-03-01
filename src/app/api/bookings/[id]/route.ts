import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        worker: {
          include: {
            user: true,
            reviews: {
              include: {
                customer: true,
              },
              orderBy: { created_at: 'desc' },
            },
          },
        },
        messages: {
          include: {
            sender: true,
          },
          orderBy: { created_at: 'asc' },
        },
        review: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
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
    const { status, price_quoted, price_agreed, customer_confirmed } = body;

    const booking = await db.booking.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(price_quoted !== undefined && { price_quoted }),
        ...(price_agreed !== undefined && { price_agreed }),
        ...(customer_confirmed !== undefined && { customer_confirmed }),
        updated_at: new Date(),
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

    // Create notifications based on status change
    if (status === 'accepted') {
      await db.notification.create({
        data: {
          id: uuidv4(),
          user_id: booking.customer_id,
          title: 'Booking Accepted',
          message: `Your booking for ${booking.service_type} has been accepted`,
          type: 'booking_accepted',
          booking_id: booking.id,
        },
      });
    } else if (status === 'rejected') {
      await db.notification.create({
        data: {
          id: uuidv4(),
          user_id: booking.customer_id,
          title: 'Booking Rejected',
          message: `Your booking for ${booking.service_type} has been rejected`,
          type: 'booking_rejected',
          booking_id: booking.id,
        },
      });
    } else if (status === 'completed') {
      // Update worker stats
      await db.workerProfile.update({
        where: { id: booking.worker_id },
        data: {
          total_jobs: { increment: 1 },
        },
      });

      await db.notification.create({
        data: {
          id: uuidv4(),
          user_id: booking.customer_id,
          title: 'Job Completed',
          message: `Your booking for ${booking.service_type} has been marked as completed. Please leave a review.`,
          type: 'review_received',
          booking_id: booking.id,
        },
      });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
