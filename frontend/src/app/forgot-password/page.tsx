'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error(t('forgotPassword.fillEmail'));
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement forgot password API call
      // await api.auth.forgotPassword({ email });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success(t('forgotPassword.success'));
      setSent(true);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || t('forgotPassword.failed');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t('forgotPassword.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {sent ? t('forgotPassword.checkEmail') : t('forgotPassword.subtitle')}
          </CardDescription>
        </CardHeader>
        {!sent ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('login.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
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
                    {t('forgotPassword.sending')}
                  </>
                ) : (
                  t('forgotPassword.sendResetLink')
                )}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                <Link 
                  href="/login" 
                  className="text-red-600 hover:underline font-medium"
                >
                  {t('forgotPassword.backToLogin')}
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <CardContent>
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">
                {t('forgotPassword.emailSent')}
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">
                  {t('forgotPassword.backToLogin')}
                </Link>
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

