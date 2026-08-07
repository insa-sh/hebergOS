import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

import { NextRequest, NextResponse } from 'next/server'
import { getUser, verifySession,  } from '@/lib/dal';
import { Role } from '@prisma/client';


export default async function proxy(req: NextRequest) {
    const handleI18nRouting = createMiddleware(routing);
    const path = req.nextUrl.pathname
    const locale = getLocaleFromUrl(req.nextUrl);

    
    if (await needLogin(req)) {
        return NextResponse.redirect(new URL(`/${locale}/login`,req.nextUrl));
    }
    
    if (await verifySession() && RegExp(`^/(${routing.locales.join('|')})/login$`).test(path)) {
        return NextResponse.redirect(new URL(`/${locale}/app`,req.nextUrl));
    }

    const response = handleI18nRouting(req);

    response.headers.set('X-Current-Path', path);

    return response;
}

async function needLogin(req : NextRequest){
    const sessionUser = await getUser();
    const isLoggedIn = (sessionUser != null);
    const isOnApp = new RegExp(`(${routing.locales.join('|')})/app`).test(req.nextUrl.pathname);
    const isOnAdminPage = new RegExp(`(${routing.locales.join('|')})/app/administration`).test(req.nextUrl.pathname);

    if (isOnAdminPage) {
        if (isLoggedIn && sessionUser.roles.includes(Role.ADMIN)) { // On admin and good rights
            return false;
        }else {
            return true; 
        }
    }

    if (isOnApp) {
        if (isLoggedIn) { // On app and connected
            return false;
        }else {
            return true;
        }
    }
    return false; // On a standard page

}

function getLocaleFromUrl(url: URL) {
    const locale = url.pathname.split('/')[1];
    return routing.locales.includes(locale as "en" | "fr") ? locale : routing.defaultLocale;
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|.*\\.png$).*)',
    ]
}

