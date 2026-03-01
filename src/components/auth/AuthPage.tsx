'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wrench, User, Check, ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';

export function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'auth' | 'role'>('auth');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'worker'>('customer');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');

  // Verification state
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  const { login, register, isLoading, error, setError, resendVerificationEmail } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email: loginEmail, password: loginPassword });
      toast.success('Welcome back!');
    } catch (err: any) {
      toast.error(error || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await register({
        email: registerEmail,
        password: registerPassword,
        full_name: registerName,
        phone: registerPhone,
        role: selectedRole,
      });
      
      // In simple mode, user is auto-logged in after registration
      toast.success('Account created successfully! Welcome to KaarigarConnect!');
    } catch (err) {
      toast.error(error || 'Registration failed');
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail) return;
    
    setIsResending(true);
    try {
      await resendVerificationEmail(verificationEmail);
      toast.success('Verification email sent!');
    } catch (err) {
      toast.error('Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  // Verification message component
  if (showVerificationMessage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-subtle-lg border-border/50">
          <CardHeader className="text-center pb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
              <Mail className="h-8 w-8 text-foreground" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription className="mt-2">
              We sent a verification link to
            </CardDescription>
            <p className="text-sm font-medium text-foreground">{verificationEmail}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Click the link in the email to verify your account and start using KaarigarConnect.
            </p>
            
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs text-muted-foreground text-center mb-3">
                Didn't receive the email?
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleResendVerification}
                disabled={isResending}
              >
                {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Resend verification email
              </Button>
            </div>

            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => {
                setShowVerificationMessage(false);
                setActiveTab('login');
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'role') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-subtle-lg border-border/50">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Choose your role</CardTitle>
            <CardDescription>
              How would you like to use KaarigarConnect?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <button
              onClick={() => {
                setSelectedRole('customer');
                setStep('auth');
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all duration-200 ease-out ${
                selectedRole === 'customer'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-border/80 hover:bg-muted/30'
              }`}
            >
              <div className="p-3 rounded-lg bg-muted shrink-0">
                <User className="h-6 w-6 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">I need services</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Find and book skilled workers
                </p>
              </div>
              {selectedRole === 'customer' && (
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </button>

            <button
              onClick={() => {
                setSelectedRole('worker');
                setStep('auth');
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all duration-200 ease-out ${
                selectedRole === 'worker'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-border/80 hover:bg-muted/30'
              }`}
            >
              <div className="p-3 rounded-lg bg-muted shrink-0">
                <Wrench className="h-6 w-6 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">I offer services</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Get bookings and grow your business
                </p>
              </div>
              {selectedRole === 'worker' && (
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </button>

            <Button
              variant="outline"
              className="w-full mt-4 h-11"
              onClick={() => setStep('auth')}
            >
              Continue as {selectedRole === 'customer' ? 'Customer' : 'Worker'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-muted/30 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
              K
            </div>
            <span className="font-semibold text-xl text-foreground">KaarigarConnect</span>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground leading-tight">
            Connecting skilled workers with customers
          </h1>
          <p className="text-muted-foreground text-lg">
            Find trusted plumbers, electricians, carpenters, and more in your area. Book instantly, pay fairly.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-6">
            {['Verified Workers', 'Instant Booking', 'Fair Pricing', 'Real-time Chat'].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-foreground" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          © 2024 KaarigarConnect. All rights reserved.
        </p>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-subtle border-border/50">
          <CardHeader className="text-center pb-4">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                K
              </div>
              <span className="font-semibold text-lg text-foreground">KaarigarConnect</span>
            </div>
            <CardTitle className="text-2xl">
              {activeTab === 'login' ? 'Welcome back' : 'Create account'}
            </CardTitle>
            <CardDescription className="mt-1">
              {activeTab === 'login'
                ? 'Sign in to your account'
                : `Register as a ${selectedRole}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')}>
              <TabsList className="grid w-full grid-cols-2 mb-6 h-10">
                <TabsTrigger value="login" className="text-sm">Login</TabsTrigger>
                <TabsTrigger value="register" className="text-sm">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive" className="py-3">
                      <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full h-11" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign in
                  </Button>
                </form>

                <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground text-center mb-2">Demo accounts</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="text-center">
                      <span className="font-medium">Customer:</span><br />
                      customer@demo.com
                    </div>
                    <div className="text-center">
                      <span className="font-medium">Worker:</span><br />
                      worker@demo.com
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">Password: demo123</p>
                </div>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="John Doe"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="you@example.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-phone">Phone</Label>
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                    {selectedRole === 'worker' ? (
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm text-muted-foreground flex-1">
                      Registering as <span className="font-medium text-foreground capitalize">{selectedRole}</span>
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setStep('role')}
                    >
                      Change
                    </Button>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="py-3">
                      <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create account
                  </Button>
                </form>

                <Button
                  variant="ghost"
                  className="w-full mt-3 h-10 text-sm"
                  onClick={() => setStep('role')}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Choose different role
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
