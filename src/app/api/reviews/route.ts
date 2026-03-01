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
    const { booking_id, rating, review_text } = body;

    if (!booking_id || !rating) {
      return NextResponse.json(
        { error: 'Booking ID and rating are required' },
        { status: 400 }
      );
    }

    // Check if booking exists and is completed
    const booking = await db.booking.findUnique({
      where: { id: booking_id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only review completed bookings' },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await db.review.findUnique({
      where: { booking_id },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Review already exists for this booking' },
        { status: 400 }
      );
    }

    // Create review
    const review = await db.review.create({
      data: {
        id: uuidv4(),
        booking_id,
        customer_id: userId,
        worker_id: booking.worker_id,
        rating,
        review_text,
      },
      include: {
        customer: true,
      },
    });

    // Update worker rating
    const workerReviews = await db.review.findMany({
      where: { worker_id: booking.worker_id },
    });

    const avgRating =
      workerReviews.reduce((acc, r) => acc + r.rating, 0) / workerReviews.length;

    await db.workerProfile.update({
      where: { id: booking.worker_id },
      data: {
        rating: avgRating,
        rating_count: workerReviews.length,
      },
    });

    // Notify worker
    const worker = await db.workerProfile.findUnique({
      where: { id: booking.worker_id },
    });

    if (worker) {
      await db.notification.create({
        data: {
          id: uuidv4(),
          user_id: worker.user_id,
          title: 'New Review',
          message: `You received a ${rating}-star review for ${booking.service_type}`,
          type: 'review_received',
          booking_id,
        },
      });
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
