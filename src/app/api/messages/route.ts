import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { booking_id, message } = body;

    if (!booking_id || !message) {
      return NextResponse.json(
        { error: 'Booking ID and message are required' },
        { status: 400 }
      );
    }

    const newMessage = await db.message.create({
      data: {
        id: uuidv4(),
        booking_id,
        sender_id: userId,
        message,
      },
      include: {
        sender: true,
      },
    });

    // Get booking to find the other participant
    const booking = await db.booking.findUnique({
      where: { id: booking_id },
      include: {
        customer: true,
        worker: {
          include: { user: true },
        },
      },
    });

    if (booking) {
      // Determine recipient
      const recipientId =
        booking.customer_id === userId
          ? booking.worker.user_id
          : booking.customer_id;

      // Create notification
      await db.notification.create({
        data: {
          id: uuidv4(),
          user_id: recipientId,
          title: 'New Message',
          message: `You have a new message about your booking`,
          type: 'new_message',
          booking_id,
        },
      });
    }

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { booking_id } = body;

    // Mark all messages as read for the current user in this booking
    await db.message.updateMany({
      where: {
        booking_id,
        sender_id: { not: userId },
        is_read: false,
      },
      data: {
        is_read: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark messages read error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
