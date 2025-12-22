'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import api from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function JoinSessionPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCodeChange = (value: string) => {
    // Only allow digits and max 6 characters
    const sanitized = value.replace(/\D/g, '').slice(0, 6);
    setCode(sanitized);
  };

  const handleJoin = async () => {
    if (code.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    setLoading(true);

    try {
      const session = await api.sessions.getByCode(code);
      toast.success('Session found! Enter your nickname to join.');
      // After validating the PIN, send the user to the nickname page
      router.push(`/session/${session.id}/join`);
    } catch (error: any) {
      console.error('Error joining session:', error);
      const errorMessage = error.response?.data?.message || 'Invalid session code';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleJoin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">Join Session</CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit code provided by your lecturer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="text-center text-3xl font-mono tracking-widest h-16 max-w-xs"
                maxLength={6}
                autoFocus
              />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              {code.length}/6 digits entered
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleJoin} 
              className="w-full h-12" 
              disabled={loading || code.length !== 6}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Joining...
                </>
              ) : (
                'Join Session'
              )}
            </Button>

            {/* Quick code input buttons */}
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].slice(0, 10).map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  onClick={() => handleCodeChange(code + num)}
                  disabled={loading || code.length >= 6}
                  className="h-12 text-lg"
                >
                  {num}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setCode('')}
              disabled={loading || code.length === 0}
              className="w-full"
            >
              Clear
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Don't have a code? Ask your lecturer or{' '}
              <Link href="/login" className="text-red-600 hover:underline">
                sign in as a lecturer
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

