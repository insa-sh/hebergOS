import { SignInFormSchema } from "@/lib/definitions";
import { z } from "zod";
import bcrypt from 'bcryptjs';
import { createSession, deleteSession } from "@/lib/session";
import { useRouter } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";

export async function signIn(formData: z.infer<typeof SignInFormSchema>) {
	const router = useRouter()
	const parsedCredentials = SignInFormSchema.safeParse(formData);

	if (!parsedCredentials.success) {
		return false;
	}
	const { nickname, password } = parsedCredentials.data
	const user = await prisma.user.findUnique({ where: { nickname }, include: { userRoles: true }, omit: { password: false } });

	if (!user) {
		return { success: false, error: 'credentials' };
	}

	const passwordsMatch = await bcrypt.compare(password, user.password);

	if (!passwordsMatch) {
		return { success: false, error: 'credentials' };
	}
	await createSession(user.id);

	router.push('/app')
	return { success: true, error: "" }

}

export async function signOut() {
	await deleteSession()
}
