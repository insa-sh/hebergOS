'use client'

import React, { createContext, PropsWithChildren, useContext, useState } from "react";

import { AuthInterface, CSRFResponse, ErrorResponse, SessionResponse, SigninRequest, SignoutRequest } from "@/lib/authDefinitions";

import { SessionUser } from "@/lib/definitions";



const AuthContext = createContext<AuthInterface>({
    csrf: async () => "",
    login: async () => { },
    logout: async () => { },
    getUser: async () => { },
    reconnect: async () => { }
});

export function AuthProvider({ children }: PropsWithChildren) {

    const [user, setUser] = useState<SessionUser | undefined>(undefined);

    const csrf = async (): Promise<string> => {
        const csrfRes = await fetch('/api/auth/csrf', {
            method: 'GET'
        })
        if (!csrfRes.ok) {
            const { error }: ErrorResponse = await csrfRes.json()
            throw new Error(error)
        }
        const { csrfToken }: CSRFResponse = await csrfRes.json()
        return csrfToken
    }


    const login = async (req: SigninRequest): Promise<void> => {
        const res = await fetch('/api/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req),
        })
        if (!res.ok) {
            const { error }: ErrorResponse = await res.json()
            throw new Error(error)
        }

        await updateUser()
    }

    const logout = async (req: SignoutRequest): Promise<void> => {

        const res = await fetch('/api/auth/signout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req),
        })
        if (!res.ok) {
            const { error }: ErrorResponse = await res.json()
            throw new Error(error)
        }

        await updateUser()
    }

    const updateUser = async (): Promise<void> => {
        const res = await fetch('/api/auth/session', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        if (!res.ok) {
            const { error }: ErrorResponse = await res.json()
            throw new Error(error)
        }
        const resUser: SessionResponse = await res.json()
        if ('name' in resUser) {
            setUser(resUser);
        } else {
            setUser(undefined);
        }
    }

    const getUser = async (): Promise<SessionUser | undefined> => {
        return user;
    }

    const recover = async () => {
        const res = await fetch('/api/auth/session', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        if (!res.ok) {
            const { error }: ErrorResponse = await res.json()
            throw new Error(error)
        }
        const resUser: SessionResponse = await res.json()
        if ('name' in resUser) {
            setUser(resUser);
        } else {
            setUser(undefined);
        }
    }

    return (
        <AuthContext.Provider>
    )

    //     return (<AuthContext.Provider value= {{ user, userToken, isSigned, login, logout, register, signout, reconnect, recover, request, token, disconnect }
    // }>
    //     { children }
    //     < InfoModal isVisible = { isVisible } hide = { hide }
    // headerText = "Info"
    // text = "En cas de besoin, vous pouvez secouer votre téléphone pour pouvoir appeler les responsables HVSS"
    // buttonText = "J'ai compris" />
    //     </AuthContext.Provider>);

}

export const useSession = () => useContext(AuthContext)
