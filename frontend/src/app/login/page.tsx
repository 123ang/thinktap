'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await login({ email, password });
      toast.success('Logged in successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid email or password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to ThinkTap
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="lecturer@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Link 
                href="/forgot-password" 
                className="text-sm text-red-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link 
                href="/register" 
                className="text-red-600 hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
