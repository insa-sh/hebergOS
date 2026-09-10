"use server"

import { SignInFormSchema } from "@/lib/definitions";
import { z } from "zod";
import bcrypt from 'bcryptjs';
import { prisma } from "@/lib/prisma";

export async function signIn(formData: z.infer<typeof SignInFormSchema>) {
	const parsedCredentials = SignInFormSchema.safeParse(formData);

	if (!parsedCredentials.success) {
		return { userId: null, error: 'unknown' };
	}
	const { nickname, password } = parsedCredentials.data
	const user = await prisma.user.findUnique({ where: { nickname }, include: { userRoles: true }, omit: { password: false } });

	if (!user) {
		return { userId: null, error: 'credentials' };
	}

	const passwordsMatch = await bcrypt.compare(password, user.password);

	if (!passwordsMatch) {
		return { userId: null, error: 'credentials' };
	}

	return { userId: user.id, error: null }

}

