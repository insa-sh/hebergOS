import { JWTPayload, SignJWT, jwtVerify } from 'jose'
import { SessionPayload } from '@/lib/definitions'
import { serialize } from 'cookie'
import { prisma } from "@/lib/prisma";
import { NextRequest } from 'next/server';
import { getCookie, getCookies, setCookie, deleteCookie, hasCookie } from 'cookies-next';


const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: SessionPayload) {
	return new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('7d')
		.sign(encodedKey);
}

export async function decrypt(session: string | undefined = ''): Promise<SessionPayload & JWTPayload | undefined> {
	try {
		const { payload } = await jwtVerify<SessionPayload>(session, encodedKey, {
			algorithms: ['HS256'],
		});
		return payload;
	} catch (error) {
		console.log('Failed to verify session')
	}
	return undefined;
}


export async function createSession(userId: string) {
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
	const data = await prisma.session.create({
		data: {
			userId: userId,
			expires: expiresAt,
		},
		select: {
			id: true
		}
	});
	const sessionId = data.id;

	const session = await encrypt({ sessionId, expiresAt })
	await setCookie('session', session, {
		httpOnly: true,
		secure: true,
		expires: expiresAt,
		sameSite: 'lax',
		path: '/',
	})
}

export async function updateSession() {
	const cookie = await getCookie('session')
	const session = await decrypt(cookie)
	if (!session) {
		return
	}
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
	const data = await prisma.session.update({
		where: { id: session.sessionId },
		data: { expires: expiresAt }
	});
	const sessionId = data.id;

	const newSession = await encrypt({ sessionId, expiresAt })
	await setCookie('session', newSession, {
		httpOnly: true,
		secure: true,
		expires: expiresAt,
		sameSite: 'lax',
		path: '/',
	})
}

export async function deleteSession() {
	const cookie = await getCookie('session')
	const session = await decrypt(cookie);
	if (!session) {
		return
	}
	await prisma.session.delete({
		where: { id: session.sessionId },
	});
	await deleteCookie('session')
}

// Return true if the current user cookie should be removed
export async function deleteAllSessionUser(userId: string) {
	const cookie = await getCookie('session')
	const session = await decrypt(cookie);
	if (!session) {
		return
	}
	
	await prisma.session.deleteMany({
		where: { userId: userId },
	});
	
	const data = await prisma.session.findUnique({
		where: { id: session.sessionId }
	});
	if (data?.userId == userId) { // Admin action / User Action
		await deleteCookie('session')
	}
}