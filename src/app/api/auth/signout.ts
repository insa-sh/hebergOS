/*  POST Handle disconnect
    args: 
    - csrf-token
    Set session to ""
*/

import type { NextApiRequest, NextApiResponse } from 'next'
import { deleteSessionCookie } from '@/lib/session'
import { SignoutRequest } from '@/lib/authDefinitions'
import { parseCookie } from 'cookie'
import { checkCSRFToken } from '@/lib/csrf'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method != 'POST') {
        res.status(405).json({ error: 'unknown' })
        return
    }
    const { csrfToken } = <SignoutRequest>req.body
    if (!checkCSRFToken(csrfToken)) {
        res.status(403).json({ error: 'wrong-csrf-token' })
        return
    }
    const cookies = parseCookie(req.headers.cookie || '')
    if (!cookies.session) {
        res.status(401).json({ error: 'unknown' })
        return
    }
    const emptySessionCookie = await deleteSessionCookie(cookies.session)
    if (!emptySessionCookie) {
        res.status(401).json({ error: 'authentication-error' })
        return
    }
    res.setHeader('Set-Cookies', emptySessionCookie)
    res.status(200)

}