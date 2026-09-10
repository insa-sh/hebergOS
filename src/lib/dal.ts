import { decrypt, updateSession } from '@/lib/session'
import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { SessionAuth, SessionUser, SessionUserContainer } from '@/lib/definitions'
import { getCookie } from 'cookies-next';


export async function getUser(sessionId: string) {
    const data = await prisma.session.findUnique({
        where: { id: sessionId },
        select: {
            user: {
                select: {
                    id: true,
                    name: true,
                    nickname: true,
                    email: true,
                    userRoles: {
                        select: {
                            role: true
                        }
                    },
                }
            }
        }
    });

    if (!data) {
        console.log('User not in the database')
        return undefined;
    }
    const user = data.user;
    return <SessionUser>{ id: user.id, email: user.email, name: user.name, nickname: user.nickname, roles: user.userRoles.map((r) => r.role) };
}

export async function getUserContainer(sessionId: string) {
    const data = await prisma.session.findUnique({
        where: { id: sessionId },
        select: {
            user: {
                select: {
                    id: true,
                    name: true,
                    nickname: true,
                    email: true,
                    userRoles: {
                        select: {
                            role: true
                        }
                    },
                    containers: {
                        select: {
                            id: true,
                            name: true,
                            state: true
                        }
                    }
                }
            }
        }
    });

    if (!data) {
        console.log('User not in the database')
        return null;
    }
    const user = data.user;
    return <SessionUserContainer>{ id: user.id, email: user.email, name: user.name, nickname: user.nickname, roles: user.userRoles.map((r) => r.role), containers: user.containers };
}