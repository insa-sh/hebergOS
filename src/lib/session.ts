import { JWTPayload, SignJWT, jwtVerify } from 'jose'
import { SessionPayload } from '@/lib/definitions'
import { serialize } from 'cookie'
import { prisma } from "@/lib/prisma";
import { Session } from './authDefinitions';
import { getUser } from './dal';


const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

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


export async function generateSessionCookie(userId: string) {
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

	const encryptedSession = await encrypt({ sessionId, expiresAt })
	const cookie = serialize('session', encryptedSession, {
		httpOnly: true,
		secure: true,
		expires: expiresAt,
		sameSite: 'lax',
		path: '/',
	})
	return cookie
}

export async function updateSession(sessionCookie: string) {
	const session = await decrypt(sessionCookie)
	if (!session) {
		return <Session>{
			sessionCookie: serialize('session', '', {
				httpOnly: true,
				secure: true,
				maxAge: 0,
				sameSite: 'lax',
				path: '/',
			})
		};
	}
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
	const data = await prisma.session.update({
		where: { id: session.sessionId },
		data: { expires: expiresAt }
	});
	const sessionId = data.id;

	const newSessionCookie = await encrypt({ sessionId, expiresAt })
	return <Session>{
		sessionCookie: serialize('session', newSessionCookie, {
			httpOnly: true,
			secure: true,
			expires: expiresAt,
			sameSite: 'lax',
			path: '/',
		}),
		user: await getUser(sessionId)
	}
}

export async function deleteSessionCookie(sessionCookie: string) {
	const session = await decrypt(sessionCookie);
	if (!session) {
		return serialize('session', '', {
			httpOnly: true,
			secure: true,
			maxAge: 0,
			sameSite: 'lax',
			path: '/',
		})
	}
	await prisma.session.delete({
		where: { id: session.sessionId },
	});
	return serialize('session', '', {
		httpOnly: true,
		secure: true,
		maxAge: 0,
		sameSite: 'lax',
		path: '/',
	})
}

// Return true if the current user cookie should be removed
export async function deleteAllSessionUser(sessionCookie: string, userId: string) {
	const session = await decrypt(sessionCookie);
	if (!session) {
		return false
	}

	await prisma.session.deleteMany({
		where: { userId: userId },
	});

	const currentSession = await prisma.session.findUnique({
		where: { id: session.sessionId }
	});
	if (currentSession?.userId == userId) { // Admin action / User Action
		return true
	}

	return false
}

/**
 * 
 * @param sessionCookie value of the session cookie
 * @returns false if the session is not valid
 */
export async function checkSession(sessionCookie: string) {
	const session = await decrypt(sessionCookie);
	if (!session) {
		return false
	}

	const prismaSession = await prisma.session.findUnique({
		where: { id: session.sessionId },
		select: {expires: true}
	})

	if (prismaSession && (prismaSession.expires.getDate() - Date.now()) > 0) {
		return true
	}

	return false
}