'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWorkers } from '@/hooks/useWorkers';
import { useBookings } from '@/hooks/useBookings';
import { WorkerCard } from '@/components/shared/WorkerCard';
import { SkillIcon } from '@/components/shared/SkillIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  Loader2,
  Users,
} from 'lucide-react';
import { SKILL_CATEGORIES } from '@/types';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function CustomerHome() {
  const { user } = useAuthStore();
  const { workers, isLoading, searchWorkers } = useWorkers();
  const { createBooking } = useBookings();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState(50);
  const [minRating, setMinRating] = useState(0);
  const [maxRate, setMaxRate] = useState(5000);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Booking modal state
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    description: '',
    scheduled_date: '',
    scheduled_time: '',
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to Nagpur coordinates
          setUserLocation({ lat: 21.1458, lng: 79.0882 });
        }
      );
    } else {
      setUserLocation({ lat: 21.1458, lng: 79.0882 });
    }
  }, []);

  // Search workers
  const handleSearch = useCallback(async () => {
    await searchWorkers({
      skill: selectedSkill || undefined,
      maxDistance,
      minRating,
      maxRate,
      availableOnly,
      lat: userLocation?.lat,
      lng: userLocation?.lng,
    });
  }, [selectedSkill, maxDistance, minRating, maxRate, availableOnly, userLocation, searchWorkers]);

  // Initial search when location is available
  useEffect(() => {
    if (userLocation) {
      handleSearch();
    }
  }, [userLocation, handleSearch]);

  // Handle booking
  const handleBook = async () => {
    if (!selectedWorker || !user) return;

    if (!bookingForm.description || !bookingForm.scheduled_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createBooking({
        worker_id: selectedWorker.id,
        service_type: selectedWorker.skill_category,
        description: bookingForm.description,
        scheduled_date: new Date(bookingForm.scheduled_date),
        scheduled_time: bookingForm.scheduled_time,
        address: bookingForm.address || user.address,
        latitude: userLocation?.lat,
        longitude: userLocation?.lng,
      });

      if (result) {
        toast.success('Booking request sent!');
        setIsBookingOpen(false);
        setSelectedWorker(null);
        setBookingForm({
          description: '',
          scheduled_date: '',
          scheduled_time: '',
          address: '',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSelectedSkill('');
    setMaxDistance(50);
    setMinRating(0);
    setMaxRate(5000);
    setAvailableOnly(false);
    setSearchQuery('');
    handleSearch();
  };

  const filteredWorkers = workers.filter((worker) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = worker.user?.full_name?.toLowerCase().includes(query);
      const matchesSkill = worker.skill_category.toLowerCase().includes(query);
      if (!matchesName && !matchesSkill) return false;
    }
    return true;
  });

  const hasActiveFilters = selectedSkill || minRating > 0 || availableOnly || maxRate < 5000 || maxDistance < 50;

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-border/50 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold text-foreground">
              Find skilled workers
            </h1>
            <p className="text-muted-foreground mt-1">
              Search verified plumbers, electricians, and more near you
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3 mt-6 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-background border-border/50"
              />
            </div>
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-11 px-4 shrink-0">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      !
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filter Workers</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 py-6">
                  {/* Skill Category */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Skill Category</Label>
                    <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="All skills" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Skills</SelectItem>
                        {SKILL_CATEGORIES.map((skill) => (
                          <SelectItem key={skill.value} value={skill.value}>
                            <div className="flex items-center gap-2">
                              <SkillIcon iconName={skill.icon} className="h-4 w-4" />
                              <span>{skill.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Max Distance */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Distance</Label>
                      <span className="text-sm text-muted-foreground">{maxDistance} km</span>
                    </div>
                    <Slider
                      value={[maxDistance]}
                      onValueChange={(v) => setMaxDistance(v[0])}
                      max={100}
                      step={5}
                    />
                  </div>

                  {/* Min Rating */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Min Rating</Label>
                      <span className="text-sm text-muted-foreground">{minRating}+ stars</span>
                    </div>
                    <Slider
                      value={[minRating]}
                      onValueChange={(v) => setMinRating(v[0])}
                      max={5}
                      step={0.5}
                    />
                  </div>

                  {/* Max Hourly Rate */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Max Rate</Label>
                      <span className="text-sm text-muted-foreground">₹{maxRate}/hr</span>
                    </div>
                    <Slider
                      value={[maxRate]}
                      onValueChange={(v) => setMaxRate(v[0])}
                      max={10000}
                      step={100}
                    />
                  </div>

                  {/* Available Only */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label className="text-sm font-medium">Available Only</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Show workers currently online</p>
                    </div>
                    <Switch
                      checked={availableOnly}
                      onCheckedChange={setAvailableOnly}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={clearFilters} className="flex-1 h-10">
                      Clear all
                    </Button>
                    <Button onClick={() => { handleSearch(); setIsFilterOpen(false); }} className="flex-1 h-10">
                      Apply
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Quick Skill Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {SKILL_CATEGORIES.slice(0, 6).map((skill) => (
              <button
                key={skill.value}
                onClick={() => {
                  setSelectedSkill(selectedSkill === skill.value ? '' : skill.value);
                  handleSearch();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ease-out ${
                  selectedSkill === skill.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
              >
                <SkillIcon iconName={skill.icon} className="h-4 w-4" />
                {skill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {filteredWorkers.length} {filteredWorkers.length === 1 ? 'worker' : 'workers'} found
            </h2>
            {userLocation && (
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                Near your location
              </p>
            )}
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm h-8">
              <X className="h-3.5 w-3.5 mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        {/* Workers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredWorkers.length === 0 ? (
          <Card className="border-border/50 text-center py-16">
            <CardContent>
              <Users className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="font-semibold text-foreground mb-1">
                No workers found
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Try adjusting your filters or search
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredWorkers.map((worker) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                userLat={userLocation?.lat}
                userLng={userLocation?.lng}
                onBook={() => {
                  setSelectedWorker(worker);
                  setIsBookingOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isBookingOpen && selectedWorker && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-subtle-lg border-border/50 max-h-[90vh] overflow-y-auto">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Book {selectedWorker.user?.full_name || 'Worker'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="p-2 rounded-lg bg-neutral-100">
                  <SkillIcon 
                    iconName={SKILL_CATEGORIES.find((s) => s.value === selectedWorker.skill_category)?.icon || 'Wrench'} 
                    className="h-5 w-5" 
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm capitalize">{selectedWorker.skill_category}</p>
                  <p className="text-sm text-muted-foreground">₹{selectedWorker.hourly_rate}/hour</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Service Description <span className="text-destructive">*</span>
                </Label>
                <textarea
                  id="description"
                  className="w-full min-h-[100px] rounded-lg border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Describe the work you need done..."
                  value={bookingForm.description}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium">
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={bookingForm.scheduled_date}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, scheduled_date: e.target.value })
                    }
                    min={new Date().toISOString().split('T')[0]}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm font-medium">Preferred Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={bookingForm.scheduled_time}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, scheduled_time: e.target.value })
                    }
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">Service Address</Label>
                <Input
                  id="address"
                  placeholder="Enter your address"
                  value={bookingForm.address}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, address: e.target.value })
                  }
                  className="h-10"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 h-10"
                  onClick={() => {
                    setIsBookingOpen(false);
                    setSelectedWorker(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-10 bg-black hover:bg-black/80 text-white"
                  onClick={handleBook}
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Send Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
