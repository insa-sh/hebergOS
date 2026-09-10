import { SessionUser } from "./definitions"

export type SigninRequest = {
    nickname: string
    password: string
    csrfToken: string
}

export type SignoutRequest = {
    csrfToken: string
}

export type ErrorResponse = {
    error: string
}

export type CSRFResponse = {
    csrfToken: string
}

export type SessionResponse = SessionUser | {}

export type Session = {
    sessionCookie : string,
    user? : SessionUser
}

export interface AuthInterface {
    csrf: () => Promise<string>
    login: (req: SigninRequest) => Promise<void>
    logout: (req: SignoutRequest) => Promise<void>
    getUser: () => Promise<SessionUser|undefined>
    reconnect: () => Promise<void>
}