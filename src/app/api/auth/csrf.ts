// GET Return CSRF token

import { parseCookie } from 'cookie'
import type { NextApiRequest, NextApiResponse } from 'next'
import { checkCSRFToken } from '@/lib/csrf';


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method != 'GET') {
        res.status(405).json({ error: 'unknown' })
        return
    }
    const cookies = parseCookie(req.headers.cookie || '')
    if (!cookies.csrfToken) {
        res.status(401).json({ error: 'missing-cookie' })
        return
    }
    if (!checkCSRFToken(cookies.csrfToken)) {
        res.status(401).json({ error: 'wrong-csrf-token' })
        return
    }

    res.status(200).json({ csrfToken: cookies.csrfToken })

}