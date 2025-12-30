import { isTokenValid } from '@/actions/user';
import Header from '@/components/Header';
import ResetForm from '@/components/ResetForm';
import { getLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export default async function ResetPage({ params }: { params: Promise<{ locale: string, token: string }> }) {

  const locale = await getLocale();

  if (!(await isTokenValid((await params).token))) {
    return redirect("/reset");
  }

  const resetToken = (await params).token

  return (
    <>
      <Header locale={locale} user={null} />
      <main className="flex items-center justify-center h-screen">
        <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
          <Suspense>
            <ResetForm token={resetToken} />
          </Suspense>
        </div>
      </main>
    </>
  );
}