/*  GET
    - Set CSRF if not set
    Case 1: Unauthenticate
    - Return nothing
    Case 2: Authenticate
    - Return user + roles
*/ 


import { parseCookie } from 'cookie'
import type { NextApiRequest, NextApiResponse } from 'next'
import { checkCSRFToken, generateCSRFToken } from '@/lib/csrf';
import { updateSession } from '@/lib/session';


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method != 'GET') {
        res.status(405).json({ error: 'unknown' })
        return
    }
    const cookies = parseCookie(req.headers.cookie || '')
    var needCSRFCookies = false;
    if (!cookies.csrfToken) {
        needCSRFCookies = true;
    } else if (!checkCSRFToken(cookies.csrfToken)) {
        needCSRFCookies = true
    }
    if (needCSRFCookies) {
        const CSRFCookie = generateCSRFToken()
        res.setHeader('Set-Cookie', CSRFCookie)
    }

    res.json({})
    if (cookies.session) {
        const {sessionCookie,user} = await updateSession(cookies.session)
        res.setHeader('Set-Cookies',sessionCookie);
        if (user) {
            res.json(user);
        }
    }

    res.status(200)

}