'use client'

import { SessionUser } from '@/lib/definitions'
import { createContext, PropsWithChildren, SetStateAction, useContext, useState } from 'react'

interface SessionProviderInterface {
    getSession: () => SessionUser | null
    setSession: (value: SetStateAction<SessionUser | null>) => void
}

const SessionContext = createContext<SessionProviderInterface>({
    getSession: () => null,
    setSession: () => { }
})


export function SessionProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useState<SessionUser | null>(null)

    const getSession = () => {
        return session;
    }
    return (
        <SessionContext.Provider value={{ getSession, setSession }}>
            {children}
        </SessionContext.Provider>
    )
}

export function useSession() {
    return useContext(SessionContext)
}