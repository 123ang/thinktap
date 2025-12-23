'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <Link href="/register">
              <Button variant="ghost" size="sm">← Back</Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-red-600 to-orange-500 text-transparent bg-clip-text">
            {t('terms.title')}
          </h1>
          <p className="text-sm text-gray-600 mb-8">
            {t('terms.lastUpdated')}: {t('terms.lastUpdatedDate')}
          </p>

          <div className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('terms.section1.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('terms.section1.content')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('terms.section2.title')}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('terms.section2.content')}
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>{t('terms.section2.point1')}</li>
                <li>{t('terms.section2.point2')}</li>
                <li>{t('terms.section2.point3')}</li>
                <li>{t('terms.section2.point4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('terms.section3.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('terms.section3.content')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('terms.section4.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('terms.section4.content')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('terms.section5.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('terms.section5.content')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('terms.section6.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('terms.section6.content')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('terms.section7.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('terms.section7.content')}
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-gray-600">
              {t('terms.questions')}{' '}
              <Link href="/contact" className="text-red-600 hover:underline">
                {t('terms.contactUs')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

