'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Zap, 
  Users, 
  BarChart3, 
  Smartphone, 
  Shield, 
  Rocket,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-red-600 pb-1">ThinkTap</div>
          <div className="hidden md:flex gap-6 items-center">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">
              {t('nav.features')}
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900">
              {t('nav.howItWorks')}
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
              {t('nav.pricing')}
            </Link>
            <Link href="/faq" className="text-gray-600 hover:text-gray-900">
              {t('nav.faq')}
            </Link>
          </div>
          <div className="flex gap-3 items-center">
            <LanguageSwitcher />
            <Button variant="ghost" asChild>
              <Link href="/login">{t('nav.login')}</Link>
            </Button>
            <Button asChild>
              <Link href="/register">{t('nav.register')}</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            🎓 {t('hero.badge')}
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-600 to-orange-500 text-transparent bg-clip-text leading-tight pb-2">
            {t('hero.title').split('\n').map((line, idx) => (
              <span key={idx}>
                {line}
                {idx === 0 && <br />}
              </span>
            ))}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild>
              <Link href="/register">
                {t('hero.ctaPrimary')} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#demo">{t('hero.ctaSecondary')}</Link>
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            ✓ {t('hero.note')}
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.features.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 text-red-600">
                  <Zap className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('landing.features.realTime.title')}</h3>
                <p className="text-gray-600">
                  {t('landing.features.realTime.desc')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 text-orange-600">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('landing.features.questionFormats.title')}</h3>
                <p className="text-gray-600">
                  {t('landing.features.questionFormats.desc')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 text-green-600">
                  <BarChart3 className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('landing.features.insights.title')}</h3>
                <p className="text-gray-600">
                  {t('landing.features.insights.desc')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 text-orange-600">
                  <Smartphone className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('landing.features.everywhere.title')}</h3>
                <p className="text-gray-600">
                  {t('landing.features.everywhere.desc')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 text-pink-600">
                  <Shield className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('landing.features.privacy.title')}</h3>
                <p className="text-gray-600">
                  {t('landing.features.privacy.desc')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 text-cyan-600">
                  <Rocket className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('landing.features.easy.title')}</h3>
                <p className="text-gray-600">
                  {t('landing.features.easy.desc')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.howItWorks.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('landing.howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('landing.howItWorks.step1.title')}</h3>
              <p className="text-gray-600">
                {t('landing.howItWorks.step1.desc')}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('landing.howItWorks.step2.title')}</h3>
              <p className="text-gray-600">
                {t('landing.howItWorks.step2.desc')}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('landing.howItWorks.step3.title')}</h3>
              <p className="text-gray-600">
                {t('landing.howItWorks.step3.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.pricing.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('landing.pricing.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Freemium Plan */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">{t('landing.pricing.freemium.title')}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{t('landing.pricing.freemium.price')}</span>
                  <span className="text-gray-600">{t('landing.pricing.freemium.period')}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('landing.pricing.freemium.unlimited')}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('landing.pricing.freemium.allTypes')}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('landing.pricing.freemium.allModes')}</span>
                  </li>
                  <li className="flex items-start text-gray-400">
                    <span className="mr-2">✗</span>
                    <span>{t('landing.pricing.freemium.noHistory')}</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/register">{t('landing.pricing.freemium.cta')}</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-red-600 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-red-600">{t('landing.pricing.pro.badge')}</Badge>
              </div>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">{t('landing.pricing.pro.title')}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{t('landing.pricing.pro.price')}</span>
                  <span className="text-gray-600">{t('landing.pricing.pro.period')}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('landing.pricing.pro.everythingFree')}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('landing.pricing.pro.fullHistory')}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('landing.pricing.pro.advanced')}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('landing.pricing.pro.export')}</span>
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/register">{t('landing.pricing.pro.cta')}</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Faculty Plan */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">{t('landing.pricing.faculty.title')}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{t('landing.pricing.faculty.price')}</span>
                  <span className="text-gray-600">{t('landing.pricing.faculty.period')}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('landing.pricing.faculty.everythingPro')}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('landing.pricing.faculty.multipleUsers')}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('landing.pricing.faculty.shared')}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('landing.pricing.faculty.branding')}</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/contact">{t('landing.pricing.faculty.cta')}</Link>
                </Button>
              </CardContent>
            </Card>

            {/* University License */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">{t('landing.pricing.university.title')}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{t('landing.pricing.university.price')}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('landing.pricing.university.everythingFaculty')}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('landing.pricing.university.unlimitedUsers')}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('landing.pricing.university.lms')}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('landing.pricing.university.onPremise')}</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/contact">{t('landing.pricing.university.cta')}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-red-600 to-orange-500 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t('landing.cta.subtitle')}
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">
              {t('landing.cta.button')} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm mt-4 opacity-75">
            {t('landing.cta.note')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-300">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">ThinkTap</h3>
              <p className="text-sm">
                {t('landing.footer.description')}
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('landing.footer.product')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white">{t('landing.footer.features')}</Link></li>
                <li><Link href="#pricing" className="hover:text-white">{t('landing.footer.pricing')}</Link></li>
                <li><Link href="/docs" className="hover:text-white">{t('landing.footer.docs')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('landing.footer.company')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">{t('landing.footer.about')}</Link></li>
                <li><Link href="/contact" className="hover:text-white">{t('landing.footer.contact')}</Link></li>
                <li><Link href="/privacy" className="hover:text-white">{t('landing.footer.privacy')}</Link></li>
                <li><Link href="/terms" className="hover:text-white">{t('landing.footer.terms')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('landing.footer.connect')}</h4>
              <p className="text-sm">support@thinktap.com</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>{t('landing.footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
