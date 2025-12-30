import { isTokenValid } from '@/actions/user';
import Header from '@/components/Header';
import ResetForm from '@/components/ResetForm';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function ResetErrorPage() {

  const t = await getTranslations("pages.reset");
  const locale = await getLocale();

  return (
    <>
      <Header locale={locale} user={null} />
      <main className="min-h-screen mx-auto grid grid-cols-1 grid-rows-[1fr_auto_1fr] md:grid-cols-[1fr_auto_1fr] md:grid-rows-1 md:gap-8">
        <div className="relative mx-auto mb-24 md:mb-32 max-w-[80rem] text-center md:px-8">
          <h1 className="text-2xl md:text-4xl font-semibold tracking-wide leading-relaxed z-40"
            dangerouslySetInnerHTML={{ __html: t('title') }}
          />

          <p className="text-md md:text-xl"
            dangerouslySetInnerHTML={{ __html: t('description') }}
          />
          <Button variant={ "secondary"} asChild>
            <Link href={"/contact-us"} className="text-xl"><Home className="w-8 h-8" /> {t('homepage')}</Link>
          </Button>
        </div >

      </main>
    </>
  );
}