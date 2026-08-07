import { SignInFormSchema } from "@/lib/definitions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from 'bcryptjs';
import { createSession, deleteSession } from "@/lib/session";

export async function signIn(formData: z.infer<typeof SignInFormSchema>) {

	const parsedCredentials = SignInFormSchema.safeParse(formData);

	if (!parsedCredentials.success) {
		return false;
	}


	const { nickname, password } = parsedCredentials.data;

	const user = await prisma.user.findUnique({ where: { nickname }, include: { userRoles: true }, omit: { password: false } });

	if (!user) {
		return false;
	}

	const passwordsMatch = await bcrypt.compare(password, user.password);

	if (!passwordsMatch) {
		return false;
	}

	console.log("User logged in");
	await createSession(user.id);
	return true;
}

export async function signOut() {
	deleteSession()
}
