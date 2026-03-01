import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST() {
  try {
    // Check if already seeded
    const existingUsers = await db.profile.findMany();
    if (existingUsers.length > 0) {
      return NextResponse.json({ message: 'Database already seeded', count: existingUsers.length });
    }

    const hashedPassword = await bcrypt.hash('demo123', 10);

    // Create admin
    const admin = await db.profile.create({
      data: {
        id: uuidv4(),
        email: 'admin@kaarigar.com',
        password: hashedPassword,
        full_name: 'Admin User',
        phone: '+91 9876543210',
        role: 'admin',
        city: 'Nagpur',
      },
    });

    // Create demo customer
    const customer = await db.profile.create({
      data: {
        id: uuidv4(),
        email: 'customer@demo.com',
        password: hashedPassword,
        full_name: 'Rahul Sharma',
        phone: '+91 9876543211',
        role: 'customer',
        city: 'Nagpur',
        address: '123 MG Road, Nagpur',
        latitude: 21.1458,
        longitude: 79.0882,
      },
    });

    // Create demo workers
    const workerData = [
      {
        full_name: 'Rajesh Kumar',
        email: 'worker@demo.com',
        phone: '+91 9876543212',
        skill_category: 'plumber',
        experience_years: 8,
        bio: 'Experienced plumber specializing in residential and commercial plumbing. Available 24/7 for emergencies.',
        hourly_rate: 500,
        is_available: true,
        is_verified: true,
        rating: 4.8,
        rating_count: 45,
        total_jobs: 45,
        latitude: 21.1480,
        longitude: 79.0900,
      },
      {
        full_name: 'Suresh Patil',
        email: 'suresh@demo.com',
        phone: '+91 9876543213',
        skill_category: 'electrician',
        experience_years: 12,
        bio: 'Licensed electrician with expertise in home wiring, appliance repair, and electrical installations.',
        hourly_rate: 600,
        is_available: true,
        is_verified: true,
        rating: 4.9,
        rating_count: 62,
        total_jobs: 62,
        latitude: 21.1500,
        longitude: 79.0850,
      },
      {
        full_name: 'Amit Joshi',
        email: 'amit@demo.com',
        phone: '+91 9876543214',
        skill_category: 'carpenter',
        experience_years: 10,
        bio: 'Skilled carpenter for furniture repair, custom woodwork, and home renovation projects.',
        hourly_rate: 550,
        is_available: true,
        is_verified: true,
        rating: 4.7,
        rating_count: 38,
        total_jobs: 38,
        latitude: 21.1420,
        longitude: 79.0920,
      },
      {
        full_name: 'Deepak Yadav',
        email: 'deepak@demo.com',
        phone: '+91 9876543215',
        skill_category: 'painter',
        experience_years: 6,
        bio: 'Professional painter for interior and exterior painting, wallpaper installation, and renovation.',
        hourly_rate: 450,
        is_available: true,
        is_verified: false,
        rating: 4.5,
        rating_count: 28,
        total_jobs: 28,
        latitude: 21.1460,
        longitude: 79.0950,
      },
      {
        full_name: 'Vikram Singh',
        email: 'vikram@demo.com',
        phone: '+91 9876543216',
        skill_category: 'mechanic',
        experience_years: 15,
        bio: 'Expert mechanic for two-wheelers and four-wheelers. Specialized in engine repair and maintenance.',
        hourly_rate: 700,
        is_available: false,
        is_verified: true,
        rating: 4.6,
        rating_count: 55,
        total_jobs: 55,
        latitude: 21.1520,
        longitude: 79.0800,
      },
      {
        full_name: 'Priya Devi',
        email: 'priya@demo.com',
        phone: '+91 9876543217',
        skill_category: 'cleaner',
        experience_years: 4,
        bio: 'Professional home cleaning services. Deep cleaning, regular maintenance, and move-in/out cleaning.',
        hourly_rate: 300,
        is_available: true,
        is_verified: true,
        rating: 4.8,
        rating_count: 42,
        total_jobs: 42,
        latitude: 21.1440,
        longitude: 79.0870,
      },
      {
        full_name: 'Mohan Das',
        email: 'mohan@demo.com',
        phone: '+91 9876543218',
        skill_category: 'mason',
        experience_years: 18,
        bio: 'Experienced mason for construction, repair, and renovation. Expert in brickwork and plastering.',
        hourly_rate: 650,
        is_available: true,
        is_verified: true,
        rating: 4.4,
        rating_count: 33,
        total_jobs: 33,
        latitude: 21.1490,
        longitude: 79.0860,
      },
      {
        full_name: 'Ravi Sharma',
        email: 'ravi@demo.com',
        phone: '+91 9876543219',
        skill_category: 'welder',
        experience_years: 9,
        bio: 'Professional welder for metal fabrication, gate construction, and industrial welding projects.',
        hourly_rate: 550,
        is_available: true,
        is_verified: false,
        rating: 4.6,
        rating_count: 25,
        total_jobs: 25,
        latitude: 21.1470,
        longitude: 79.0910,
      },
    ];

    const workers = [];
    for (const data of workerData) {
      const profile = await db.profile.create({
        data: {
          id: uuidv4(),
          email: data.email,
          password: hashedPassword,
          full_name: data.full_name,
          phone: data.phone,
          role: 'worker',
          city: 'Nagpur',
          latitude: data.latitude,
          longitude: data.longitude,
        },
      });

      const workerProfile = await db.workerProfile.create({
        data: {
          id: uuidv4(),
          user_id: profile.id,
          skill_category: data.skill_category,
          experience_years: data.experience_years,
          bio: data.bio,
          hourly_rate: data.hourly_rate,
          is_available: data.is_available,
          is_verified: data.is_verified,
          rating: data.rating,
          rating_count: data.rating_count,
          total_jobs: data.total_jobs,
          latitude: data.latitude,
          longitude: data.longitude,
          radius_km: 15,
        },
      });

      workers.push({ profile, workerProfile });
    }

    // Create some demo bookings
    const demoBookings = [
      {
        service_type: 'plumber',
        description: 'Leaking pipe in bathroom needs repair',
        status: 'completed',
        price_quoted: 800,
        price_agreed: 800,
        customer_confirmed: true,
      },
      {
        service_type: 'electrician',
        description: 'Install new ceiling fan in bedroom',
        status: 'completed',
        price_quoted: 600,
        price_agreed: 600,
        customer_confirmed: true,
      },
      {
        service_type: 'carpenter',
        description: 'Repair broken kitchen cabinet door',
        status: 'in_progress',
        price_quoted: 450,
        price_agreed: 450,
        customer_confirmed: true,
      },
    ];

    for (let i = 0; i < demoBookings.length; i++) {
      const bookingData = demoBookings[i];
      const workerIndex = i % workers.length;
      
      await db.booking.create({
        data: {
          id: uuidv4(),
          customer_id: customer.id,
          worker_id: workers[workerIndex].workerProfile.id,
          service_type: bookingData.service_type,
          description: bookingData.description,
          scheduled_date: new Date(Date.now() - (i * 86400000)),
          scheduled_time: '10:00',
          address: customer.address,
          latitude: customer.latitude,
          longitude: customer.longitude,
          status: bookingData.status,
          price_quoted: bookingData.price_quoted,
          price_agreed: bookingData.price_agreed,
          customer_confirmed: bookingData.customer_confirmed,
        },
      });
    }

    return NextResponse.json({
      message: 'Database seeded successfully!',
      data: {
        admin: admin.email,
        customer: customer.email,
        workers: workers.length,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to seed the database with demo data.',
    demo_accounts: {
      admin: 'admin@kaarigar.com',
      customer: 'customer@demo.com',
      worker: 'worker@demo.com',
      password: 'demo123',
    },
  });
}
