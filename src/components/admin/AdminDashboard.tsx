'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Wrench,
  Calendar,
  CheckCircle,
  Star,
} from 'lucide-react';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { VerifiedBadge } from '@/components/shared/VerifiedBadge';
import { SKILL_CATEGORIES } from '@/types';
import { toast } from 'sonner';

interface AdminStats {
  totalWorkers: number;
  totalCustomers: number;
  activeBookings: number;
  completedToday: number;
}

export function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AdminStats>({
    totalWorkers: 0,
    totalCustomers: 0,
    activeBookings: 0,
    completedToday: 0,
  });
  const [workers, setWorkers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      // Fetch workers
      const workersRes = await fetch('/api/workers', {
        headers: { 'x-user-id': user.id },
      });
      const workersData = await workersRes.json();
      
      // Fetch bookings
      const bookingsRes = await fetch('/api/bookings', {
        headers: { 'x-user-id': user.id },
      });
      const bookingsData = await bookingsRes.json();

      // Fetch all users (admin only)
      const usersRes = await fetch('/api/admin/users', {
        headers: { 'x-user-id': user.id },
      });
      const usersData = await usersRes.json();

      const allBookings = bookingsData.bookings || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      setStats({
        totalWorkers: workersData.workers?.length || 0,
        totalCustomers: usersData.users?.filter((u: any) => u.role === 'customer').length || 0,
        activeBookings: allBookings.filter(
          (b: any) => b.status === 'accepted' || b.status === 'in_progress'
        ).length,
        completedToday: allBookings.filter(
          (b: any) => b.status === 'completed' && new Date(b.updated_at) >= today
        ).length,
      });

      setWorkers(workersData.workers || []);
      setCustomers(usersData.users?.filter((u: any) => u.role === 'customer') || []);
      setBookings(allBookings);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyWorker = async (workerId: string, verified: boolean) => {
    if (!user?.id) return;
    try {
      await fetch(`/api/workers/${workerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ is_verified: verified }),
      });
      toast.success(`Worker ${verified ? 'verified' : 'unverified'}`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating worker:', error);
      toast.error('Failed to update worker');
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    if (!user?.id) return;
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ status }),
      });
      toast.success('Booking status updated');
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage workers, customers, and bookings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border/50 shadow-subtle">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-100">
                  <Wrench className="h-5 w-5 text-neutral-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalWorkers}</p>
                  <p className="text-sm text-muted-foreground">Total Workers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-subtle">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-100">
                  <Users className="h-5 w-5 text-neutral-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalCustomers}</p>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-subtle">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-200">
                  <Calendar className="h-5 w-5 text-neutral-800" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.activeBookings}</p>
                  <p className="text-sm text-muted-foreground">Active Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-subtle">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-black">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.completedToday}</p>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workers">Workers</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <Card className="border-border/50 shadow-subtle">
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 border border-border/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-foreground">{booking.service_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.customer?.full_name || 'Customer'} →{' '}
                            {booking.worker?.user?.full_name || 'Worker'}
                          </p>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Workers */}
              <Card className="border-border/50 shadow-subtle">
                <CardHeader>
                  <CardTitle>Top Rated Workers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workers
                      .sort((a, b) => b.rating - a.rating)
                      .slice(0, 5)
                      .map((worker) => (
                        <div
                          key={worker.id}
                          className="flex items-center justify-between p-3 border border-border/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              {worker.user?.full_name || 'Worker'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {SKILL_CATEGORIES.find((s) => s.value === worker.skill_category)?.label}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-black fill-black" />
                            <span className="font-medium text-foreground">{worker.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workers">
            <Card className="border-border/50 shadow-subtle">
              <CardHeader>
                <CardTitle>All Workers ({workers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Skill</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Total Jobs</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workers.map((worker) => (
                        <TableRow key={worker.id}>
                          <TableCell className="font-medium text-foreground">
                            <div className="flex items-center gap-1.5">
                              {worker.user?.full_name || 'N/A'}
                              {worker.is_verified && <VerifiedBadge size="sm" />}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {SKILL_CATEGORIES.find((s) => s.value === worker.skill_category)?.label}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-black fill-black" />
                              <span className="text-foreground">{worker.rating.toFixed(1)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{worker.total_jobs}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={
                                  worker.is_available
                                    ? 'bg-neutral-100 text-neutral-800 border-neutral-200'
                                    : 'bg-neutral-50 text-neutral-500 border-neutral-200'
                                }
                              >
                                {worker.is_available ? 'Available' : 'Unavailable'}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={
                                  worker.is_verified
                                    ? 'bg-black text-white border-black'
                                    : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                                }
                              >
                                {worker.is_verified ? 'Verified' : 'Unverified'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerifyWorker(worker.id, !worker.is_verified)}
                            >
                              {worker.is_verified ? 'Unverify' : 'Verify'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card className="border-border/50 shadow-subtle">
              <CardHeader>
                <CardTitle>All Customers ({customers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium text-foreground">
                            {customer.full_name || 'N/A'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                          <TableCell className="text-muted-foreground">{customer.phone || 'N/A'}</TableCell>
                          <TableCell className="text-muted-foreground">{customer.city || 'N/A'}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(customer.created_at), 'MMM d, yyyy')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card className="border-border/50 shadow-subtle">
              <CardHeader>
                <CardTitle>All Bookings ({bookings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Worker</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium text-foreground">
                            {booking.service_type}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{booking.customer?.full_name || 'N/A'}</TableCell>
                          <TableCell className="text-muted-foreground">{booking.worker?.user?.full_name || 'N/A'}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(booking.scheduled_date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={booking.status} />
                          </TableCell>
                          <TableCell className="text-foreground font-medium">
                            ₹{booking.price_agreed || booking.price_quoted || '-'}
                          </TableCell>
                          <TableCell>
                            <select
                              className="text-sm border border-border rounded px-2 py-1 bg-background text-foreground"
                              value={booking.status}
                              onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="accepted">Accepted</option>
                              <option value="rejected">Rejected</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
