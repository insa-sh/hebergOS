import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

import { NextRequest, NextResponse } from 'next/server'
import { getUser  } from '@/lib/dal';
import { Role } from '@prisma/client';
import { checkSession } from './lib/session';


export default async function proxy(req: NextRequest) {
    const handleI18nRouting = createMiddleware(routing);
    const path = req.nextUrl.pathname
    const locale = getLocaleFromUrl(req.nextUrl);
    const sessionCookie = req.cookies.get('session')?.value || ''
    const isOnApp = new RegExp(`(${routing.locales.join('|')})/app`).test(req.nextUrl.pathname);
    const isOnAdminPage = new RegExp(`(${routing.locales.join('|')})/app/administration`).test(req.nextUrl.pathname);
    const isOnLoginPage = new RegExp(`(${routing.locales.join('|')})/login`).test(req.nextUrl.pathname);
    const isLoggedIn = await checkSession(sessionCookie)
    const user = await getUser(sessionCookie)

    if (isLoggedIn && isOnLoginPage) {
        return NextResponse.redirect(new URL(`/${locale}/app`,req.nextUrl));
    }

    if (!isLoggedIn && isOnApp) {
        return NextResponse.redirect(new URL(`/${locale}/login`,req.nextUrl))
    }

    if (isLoggedIn && isOnAdminPage && !(user?.roles.includes(Role.ADMIN))) {
        return NextResponse.redirect(new URL(`/${locale}/app`,req.nextUrl))
    }

    const defaultResponse = handleI18nRouting(req);
    defaultResponse.headers.set('X-Current-Path', path);

    return defaultResponse
}

async function needLogin(req : NextRequest, sessionId: string){
    const sessionUser = await getUser(sessionId);
    const isLoggedIn = (sessionUser != undefined);
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

