/*  POST
    args:
    - csrf-token
    - username
    - password
*/

import type { NextApiRequest, NextApiResponse } from 'next'
import { signIn } from '@/lib/auth'
import { generateSessionCookie } from '@/lib/session'
import { SigninRequest } from '@/lib/authDefinitions'
import { checkCSRFToken } from '@/lib/csrf'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method != 'POST') {
        res.status(405).json({ error: 'unknown' })
        return
    }
    const { nickname, password, csrfToken } = <SigninRequest>req.body
    if (!checkCSRFToken(csrfToken)) {
        res.status(403).json({ error: 'wrong-csrf-token' })
        return
    }
    const { userId, error } = await signIn({ nickname, password })
    if (error) {
        res.status(401).json({ error: error })
        return
    }
    if (!userId) {
        res.status(400).json({ error: 'unknown' })
        return
    }
    const sessionCookie = await generateSessionCookie(userId)
    res.setHeader('Set-Cookie', sessionCookie)
    res.status(200)


}