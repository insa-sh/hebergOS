import { DotPattern } from '@/components/dot-pattern';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Home } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function ResetErrorPage() {

  const t = await getTranslations("pages.app.reset");
  const locale = await getLocale();

  return (
    <>
      <Header locale={locale} user={null} />
      <main className="max-w-[80rem] min-h-screen row-start-2 px-6 mx-auto sm:items-start overflow-hidden">
        <DotPattern
          className={cn(
            "top-0 bottom-0 opacity-70 -z-10 [mask-image:linear-gradient(to_right,transparent,white,white,white,white,white,white,white,white,white,transparent)]",
          )}
        />
        <div className="mt-32 md:mt-64 max-w-lg mx-auto px-3 md:px-0 z-40 text-center">
          <h1 className="text-2xl md:text-4xl font-semibold tracking-wide leading-relaxed z-40"
            dangerouslySetInnerHTML={{ __html: t('title') }}
          />

          <p className="text-md md:text-xl"
            dangerouslySetInnerHTML={{ __html: t('description') }}
          />
          <Button variant={"secondary"} asChild>
            <Link href={"/"} className="text-xl"><Home className="w-8 h-8" /> {t('homepage')}</Link>
          </Button>
        </div >

      </main>
    </>
  );
}