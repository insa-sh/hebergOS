import { getMe } from "@/actions/user";
import Header from "@/components/Header";
import { syncContainers } from "@/lib/utils";
import { getLocale } from "next-intl/server";

export default async function AppLayout(
    { children }: Readonly<{
        children: React.ReactNode;
    }>
) {
    await syncContainers();

    const locale = await getLocale();
    const user = await getMe();

    return (
        <>
            <Header locale={locale} user={user}/>
            <main className="min-h-screen pt-14 bg-primary/4">
                <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-24">
                    {children}
                </div>
            </main>
        </>
    );
}
