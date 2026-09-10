
import { serialize } from "cookie";
import csrf from "csrf"

const tokens = new csrf();
const CSRFSecret = process.env.CSRF_SECRET || tokens.secretSync()

export function checkCSRFToken(token: string) {
    return tokens.verify(CSRFSecret, token)
}

export function generateCSRFToken() {
    const csrfToken = tokens.create(CSRFSecret)
    const csrfCookie = serialize('csrfToken', csrfToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
    })
    return csrfCookie
}