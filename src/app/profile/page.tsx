'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Save,
  Loader2,
  Camera,
  Briefcase,
  Upload,
  X,
  Check,
  Star,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { SKILL_CATEGORIES } from '@/types';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile', {
        headers: { 'x-user-id': user.id },
      });
      const data = await response.json();
      if (response.ok) {
        setProfile(data.profile);
        setWorkerProfile(data.profile.worker_profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please use JPEG, PNG, GIF, or WebP.');
      return;
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB.');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'avatar');

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-user-id': user.id },
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.url) {
        // Update profile with new avatar URL
        const updateResponse = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
          },
          body: JSON.stringify({ avatar_url: data.url }),
        });

        const updateData = await updateResponse.json();
        if (updateResponse.ok) {
          setProfile({ ...profile, avatar_url: data.url });
          setUser({ ...user, avatar_url: data.url });
          toast.success('Profile picture updated!');
        }
      } else {
        toast.error(data.error || 'Failed to upload image');
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.id || !profile) return;

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ avatar_url: null }),
      });

      if (response.ok) {
        setProfile({ ...profile, avatar_url: null });
        setUser({ ...user, avatar_url: null });
        setPreviewUrl(null);
        toast.success('Profile picture removed');
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove profile picture');
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id || !profile) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          full_name: profile.full_name,
          phone: profile.phone,
          city: profile.city,
          address: profile.address,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setUser({ ...user, ...data.profile });
        toast.success('Profile updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveWorkerProfile = async () => {
    if (!user?.id || !workerProfile) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/workers/${workerProfile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          skill_category: workerProfile.skill_category,
          experience_years: workerProfile.experience_years,
          bio: workerProfile.bio,
          hourly_rate: workerProfile.hourly_rate,
          is_available: workerProfile.is_available,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setWorkerProfile(data.worker);
        toast.success('Worker profile updated!');
      } else {
        toast.error(data.error || 'Failed to update worker profile');
      }
    } catch (error) {
      console.error('Error saving worker profile:', error);
      toast.error('Failed to update worker profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const displayAvatarUrl = previewUrl || profile.avatar_url;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">My Profile</h1>

        {/* Personal Info Card */}
        <Card className="mb-6 border-border/40 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal details and profile picture
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Profile Picture Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-6 border-b border-border/40">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-border/50 shadow-md">
                  <AvatarImage src={displayAvatarUrl || ''} />
                  <AvatarFallback className="bg-neutral-100 text-neutral-800 text-2xl font-semibold">
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Overlay on hover */}
                <div 
                  className={cn(
                    "absolute inset-0 rounded-full bg-black/50 flex items-center justify-center cursor-pointer transition-opacity",
                    isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </div>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg text-foreground">
                    {profile.full_name || 'Your Name'}
                  </h3>
                  {profile.role === 'worker' && workerProfile?.is_verified && (
                    <span className="flex items-center justify-center h-5 w-5 bg-black rounded-full">
                      <Check className="h-3 w-3 text-white stroke-[3]" />
                    </span>
                  )}
                </div>
                <Badge variant="secondary" className="capitalize font-medium">
                  {profile.role}
                </Badge>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Change Photo
                  </Button>
                  {displayAvatarUrl && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleRemoveAvatar}
                      disabled={isUploading}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  JPEG, PNG, GIF or WebP. Max 5MB.
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Your full name"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="h-10 bg-muted/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">City</Label>
                <Input
                  id="city"
                  value={profile.city || ''}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  placeholder="Your city"
                  className="h-10"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                <Input
                  id="address"
                  value={profile.address || ''}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="Your full address"
                  className="h-10"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={handleSaveProfile} 
                disabled={isSaving}
                className="bg-black hover:bg-black/90 text-white"
              >
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Worker Profile Card */}
        {profile.role === 'worker' && workerProfile && (
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Worker Profile
              </CardTitle>
              <CardDescription>
                Manage your professional details and availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Availability Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg mb-6 border border-border/40">
                <div>
                  <p className="font-medium text-foreground">Availability Status</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Toggle to show if you're available for new bookings
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-sm font-medium",
                    workerProfile.is_available ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {workerProfile.is_available ? 'Available' : 'Unavailable'}
                  </span>
                  <Switch
                    checked={workerProfile.is_available}
                    onCheckedChange={(checked) =>
                      setWorkerProfile({ ...workerProfile, is_available: checked })
                    }
                  />
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/20 rounded-lg border border-border/30">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{workerProfile.total_jobs}</p>
                  <p className="text-sm text-muted-foreground">Total Jobs</p>
                </div>
                <div className="text-center border-x border-border/30">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-5 w-5 text-black fill-black" />
                    <p className="text-2xl font-bold text-foreground">{workerProfile.rating.toFixed(1)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{workerProfile.rating_count}</p>
                  <p className="text-sm text-muted-foreground">Reviews</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="skill" className="text-sm font-medium">Skill Category</Label>
                  <Select
                    value={workerProfile.skill_category}
                    onValueChange={(value) =>
                      setWorkerProfile({ ...workerProfile, skill_category: value })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {SKILL_CATEGORIES.map((skill) => (
                        <SelectItem key={skill.value} value={skill.value}>
                          {skill.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-sm font-medium">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={workerProfile.experience_years}
                    onChange={(e) =>
                      setWorkerProfile({
                        ...workerProfile,
                        experience_years: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourly_rate" className="text-sm font-medium">Hourly Rate (₹)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    value={workerProfile.hourly_rate}
                    onChange={(e) =>
                      setWorkerProfile({
                        ...workerProfile,
                        hourly_rate: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Verification Status</Label>
                  <div className="flex items-center gap-2 h-10">
                    {workerProfile.is_verified ? (
                      <Badge className="bg-black text-white font-medium">
                        <Check className="h-3.5 w-3.5 mr-1.5" />
                        Verified Professional
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground border-border">
                        Pending Verification
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio" className="text-sm font-medium">Bio / Description</Label>
                  <textarea
                    id="bio"
                    className="w-full min-h-[120px] rounded-lg border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                    placeholder="Tell customers about yourself and your expertise..."
                    value={workerProfile.bio || ''}
                    onChange={(e) =>
                      setWorkerProfile({ ...workerProfile, bio: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleSaveWorkerProfile} 
                  disabled={isSaving}
                  className="bg-black hover:bg-black/90 text-white"
                >
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Save Worker Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
