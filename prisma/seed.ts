import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const workers = [
  {
    email: 'rahul.sharma@example.com',
    full_name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    role: 'worker',
    city: 'Mumbai',
    address: 'Andheri West, Mumbai',
    skill_category: 'plumber',
    experience_years: 8,
    bio: 'Experienced plumber specializing in residential and commercial plumbing. Expert in leak detection, pipe installation, and bathroom renovations.',
    hourly_rate: 500,
    is_verified: true,
    rating: 4.8,
    rating_count: 156,
    total_jobs: 203,
  },
  {
    email: 'amit.patel@example.com',
    full_name: 'Amit Patel',
    phone: '+91 98765 43211',
    role: 'worker',
    city: 'Mumbai',
    address: 'Dadar, Mumbai',
    skill_category: 'electrician',
    experience_years: 12,
    bio: 'Licensed electrician with expertise in residential wiring, appliance repair, and electrical safety inspections.',
    hourly_rate: 600,
    is_verified: true,
    rating: 4.9,
    rating_count: 234,
    total_jobs: 312,
  },
  {
    email: 'suresh.kumar@example.com',
    full_name: 'Suresh Kumar',
    phone: '+91 98765 43212',
    role: 'worker',
    city: 'Mumbai',
    address: 'Powai, Mumbai',
    skill_category: 'carpenter',
    experience_years: 15,
    bio: 'Master carpenter specializing in custom furniture, modular kitchens, and home renovation projects.',
    hourly_rate: 700,
    is_verified: true,
    rating: 4.7,
    rating_count: 89,
    total_jobs: 145,
  },
  {
    email: 'vikram.singh@example.com',
    full_name: 'Vikram Singh',
    phone: '+91 98765 43213',
    role: 'worker',
    city: 'Mumbai',
    address: 'Bandra, Mumbai',
    skill_category: 'painter',
    experience_years: 10,
    bio: 'Professional painter offering interior and exterior painting services with attention to detail and quality finishes.',
    hourly_rate: 450,
    is_verified: true,
    rating: 4.6,
    rating_count: 78,
    total_jobs: 98,
  },
  {
    email: 'deepak.yadav@example.com',
    full_name: 'Deepak Yadav',
    phone: '+91 98765 43214',
    role: 'worker',
    city: 'Mumbai',
    address: 'Thane, Mumbai',
    skill_category: 'mechanic',
    experience_years: 6,
    bio: 'Automotive mechanic skilled in car and bike repairs, engine diagnostics, and regular maintenance services.',
    hourly_rate: 400,
    is_verified: false,
    rating: 4.5,
    rating_count: 45,
    total_jobs: 67,
  },
  {
    email: 'priya.verma@example.com',
    full_name: 'Priya Verma',
    phone: '+91 98765 43215',
    role: 'worker',
    city: 'Mumbai',
    address: 'Juhu, Mumbai',
    skill_category: 'cleaner',
    experience_years: 5,
    bio: 'Professional cleaner offering deep cleaning, regular housekeeping, and specialized cleaning services.',
    hourly_rate: 300,
    is_verified: true,
    rating: 4.9,
    rating_count: 201,
    total_jobs: 287,
  },
  {
    email: 'ravi.gupta@example.com',
    full_name: 'Ravi Gupta',
    phone: '+91 98765 43216',
    role: 'worker',
    city: 'Mumbai',
    address: 'Malad, Mumbai',
    skill_category: 'mason',
    experience_years: 18,
    bio: 'Expert mason with experience in brickwork, concrete construction, and renovation projects.',
    hourly_rate: 550,
    is_verified: true,
    rating: 4.4,
    rating_count: 56,
    total_jobs: 89,
  },
  {
    email: 'manoj.tiwari@example.com',
    full_name: 'Manoj Tiwari',
    phone: '+91 98765 43217',
    role: 'worker',
    city: 'Mumbai',
    address: 'Goregaon, Mumbai',
    skill_category: 'welder',
    experience_years: 9,
    bio: 'Certified welder specializing in metal fabrication, gate construction, and industrial welding projects.',
    hourly_rate: 500,
    is_verified: true,
    rating: 4.7,
    rating_count: 67,
    total_jobs: 112,
  },
];

async function main() {
  console.log('Seeding database...');

  // Create a test customer
  const hashedPassword = await bcrypt.hash('password123', 10);

  const existingCustomer = await prisma.profile.findUnique({
    where: { email: 'customer@test.com' },
  });

  if (!existingCustomer) {
    await prisma.profile.create({
      data: {
        id: 'customer-test-001',
        email: 'customer@test.com',
        full_name: 'Test Customer',
        phone: '+91 99999 99999',
        password: hashedPassword,
        role: 'customer',
        city: 'Mumbai',
        address: 'Test Address, Mumbai',
      },
    });
    console.log('Created test customer');
  } else {
    console.log('Test customer already exists');
  }

  // Create workers
  for (const worker of workers) {
    const { skill_category, experience_years, bio, hourly_rate, is_verified, rating, rating_count, total_jobs, ...profileData } = worker;

    const existingWorker = await prisma.profile.findUnique({
      where: { email: worker.email },
    });

    if (!existingWorker) {
      const profile = await prisma.profile.create({
        data: {
          ...profileData,
          password: hashedPassword,
        },
      });

      await prisma.workerProfile.create({
        data: {
          user_id: profile.id,
          skill_category,
          experience_years,
          bio,
          hourly_rate,
          is_verified,
          rating,
          rating_count,
          total_jobs,
        },
      });
      console.log(`Created worker: ${worker.full_name}`);
    } else {
      console.log(`Worker already exists: ${worker.full_name}`);
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
