# KaarigarConnect - Local Skilled Workers Marketplace

A production-ready, Uber-like marketplace web application connecting local skilled workers (plumbers, electricians, carpenters, painters, etc.) with customers who need their services.

## 🌟 Features

### Authentication & Role Selection
- Email/password signup and login
- Role selection after registration (Customer, Worker, Admin)
- Role-based routing and access control

### Worker Features
- Profile management with skill categories
- Availability toggle
- Booking request management (accept/reject with price quoting)
- Earnings tracking
- Rating and reviews display

### Customer Features
- Search workers by skill, location, rating, and price
- Filter workers by distance, availability
- Book workers with date/time selection
- Real-time chat with workers
- Leave reviews after job completion

### Admin Features
- Dashboard with KPIs
- Worker verification management
- Booking management
- User management

### Real-time Features
- Instant notifications
- Real-time chat per booking
- Booking status updates

## 🔧 Tech Stack

- **Frontend**: Next.js 16 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Database**: Prisma ORM with SQLite
- **State Management**: Zustand
- **Icons**: Lucide React
- **Notifications**: Sonner (Toast)
- **Charts**: Recharts
- **Date Handling**: date-fns

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kaarigarconnect
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
DATABASE_URL="file:./db/custom.db"
```

4. Push database schema:
```bash
bun run db:push
```

5. Seed the database with demo data:
```bash
curl -X POST http://localhost:3000/api/seed
```

6. Start the development server:
```bash
bun run dev
```

## 🔑 Demo Accounts

After seeding the database, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kaarigar.com | demo123 |
| Customer | customer@demo.com | demo123 |
| Worker | worker@demo.com | demo123 |

Additional demo workers are also created with various skills.

## 📁 Project Structure

```
/src
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── bookings/      # Booking CRUD
│   │   ├── messages/      # Chat messages
│   │   ├── notifications/ # User notifications
│   │   ├── profile/       # User profile
│   │   ├── reviews/       # Worker reviews
│   │   ├── seed/          # Database seeding
│   │   └── workers/       # Worker search/profile
│   ├── booking/[id]/      # Booking detail page
│   ├── bookings/          # Bookings list page
│   ├── profile/           # User profile page
│   ├── worker/[id]/       # Worker profile page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── admin/             # Admin components
│   ├── auth/              # Authentication components
│   ├── customer/          # Customer components
│   ├── shared/            # Shared UI components
│   ├── ui/                # shadcn/ui components
│   └── worker/            # Worker components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── store/                 # Zustand stores
└── types/                 # TypeScript types
```

## 🗄️ Database Schema

### profiles
User accounts with role-based access (customer, worker, admin)

### worker_profiles
Extended profile for workers with skills, rates, availability

### bookings
Service bookings with status tracking

### messages
Chat messages between customers and workers

### reviews
Worker reviews and ratings

### notifications
User notifications for booking events

## 🎨 UI/UX Design

- **Color Scheme**:
  - Primary: Deep Blue (#1e40af)
  - Accent: Orange (#f97316)
  - Background: Light gray (#f8fafc)

- **Status Colors**:
  - Pending: Yellow
  - Accepted: Blue
  - In Progress: Purple
  - Completed: Green
  - Rejected/Cancelled: Red

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Collapsible navigation
- Touch-friendly interfaces
- Adaptive layouts for all screen sizes

## 🚀 Production Deployment

1. Build the application:
```bash
bun run build
```

2. Start the production server:
```bash
bun run start
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Workers
- `GET /api/workers` - Search workers
- `GET /api/workers/[id]` - Get worker details
- `PUT /api/workers/[id]` - Update worker profile

### Bookings
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/[id]` - Get booking details
- `PUT /api/bookings/[id]` - Update booking

### Messages
- `POST /api/messages` - Send message
- `PUT /api/messages` - Mark messages as read

### Reviews
- `POST /api/reviews` - Create review

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications` - Mark as read

### Admin
- `GET /api/admin/users` - Get all users

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

Built with ❤️ using Next.js, React, and Prisma
