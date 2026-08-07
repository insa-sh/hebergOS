'use server'

import { ChangeMailFormSchema, ChangeNicknameFormSchema, ChangePasswordFormSchema, EditRolesFormSchema, LinkContainersFormSchema, RegisterFormSchema, ResetFormSchema, UserWithContainers } from "@/lib/definitions";
import { prisma } from "@/lib/prisma";
import {  isAdmin, isUser } from "@/lib/utils";
import bcrypt from 'bcryptjs';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid"
import { sendPasswordReset } from "./mail";
import { z } from "zod";
import { deleteAllSessionUser } from "@/lib/session";

export async function getUsers(): Promise<UserWithContainers[]> {
    if (!(await isAdmin())) {
        return [];
    }

    const users = await prisma.user.findMany({
        include: {
            containers: true,
            userRoles: true
        }
    })

    return users;
}

export async function createUser(data: z.infer<typeof RegisterFormSchema>): Promise<{ error?: string }> {
    if (!(await isAdmin())) {
        return { error: 'not-authorized' };
    }

    const parsedData = RegisterFormSchema.safeParse(data);

    if (!parsedData.success) {
        return { error: 'invalid-data' };
    }

    const { name, email, nickname, roles } = parsedData.data;

    try {
        const resetToken = uuidv4();
        const expireDate = new Date(new Date().getTime() + 3 * 60 * 60 * 1000); // Valid 3 hours

        await prisma.user.create({
            data: {
                name: name,
                email: email,
                nickname: nickname,
                password: "",
                userRoles: {
                    create: roles.map(r => ({ role: r }))
                },
                passwordResetRequest: {
                    create: {
                        token: resetToken,
                        expires: expireDate
                    }
                }
            }
        });

        if (!(await sendPasswordReset(resetToken, {name : name, email : email}))) {
            return {error: 'mail-error'}
        }

        revalidatePath("/app/administration");
        return { error: undefined };
    } catch (error) {

        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { error: 'nickname-already-exists' };
            }
        }

        return { error: 'unknown-error' };
    }
}

export async function linkContainers(userId: string, containers: z.infer<typeof LinkContainersFormSchema>): Promise<boolean> {
    if (!(await isAdmin())) {
        return false;
    }

    const parsedContainersIds = LinkContainersFormSchema.safeParse(containers);

    if (!parsedContainersIds.success) {
        return false;
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                containers: {
                    set: parsedContainersIds.data.containers.map(c => ({ id: c }))
                }
            }
        });

        revalidatePath("/app/administration");
        return true;
    } catch (e) {
        console.log(`Error linking containers to user: ${e}`);
        return false;
    }
}

export async function changeNickname(userId: string, data: z.infer<typeof ChangeNicknameFormSchema>): Promise<boolean> {
    if (!(await isAdmin()) && !(await isUser(userId))) {
        return false;
    }

    const parsedData = ChangeNicknameFormSchema.safeParse(data);

    if (!parsedData.success) {
        return false;
    }

    try {
        await prisma.user.update({
            data: {
                nickname: parsedData.data.nickname
            },
            where: { id: userId }
        });

        revalidatePath("/app/administration");
        return true;
    } catch {
        return false;
    }
}

export async function changeMail(userId: string, data: z.infer<typeof ChangeMailFormSchema>): Promise<boolean> {
    if (!(await isAdmin()) && !(await isUser(userId))) {
        return false;
    }

    const parsedData = ChangeMailFormSchema.safeParse(data);

    if (!parsedData.success) {
        return false;
    }

    try {
        await prisma.user.update({
            data: {
                email: parsedData.data.email
            },
            where: { id: userId }
        });

        revalidatePath("/app/administration");
        return true;
    } catch {
        return false;
    }
}

export async function createResetLink(userId: string): Promise<boolean> {
    if (!isAdmin()) {
        return false;
    }
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }, select: {
                email: true,
                name: true
            }
        });

        if (!user) {
            return false;
        }

        const resetToken = uuidv4();
        const expireDate = new Date(new Date().getTime() + 3 * 60 * 60 * 1000); // Valid 3 hours

        await prisma.user.update({
            data: {
                passwordResetRequest: {
                    create: {
                        token: resetToken,
                        expires: expireDate
                    }
                }
            },
            where: {
                id: userId
            }
        });

        if (!(await sendPasswordReset(resetToken, user))) {
            return false
        }
        await deleteAllSessionUser(userId);

        return true;
    } catch {
        return false;
    }
}

export async function isTokenValid(resetToken: string): Promise<boolean> {
    try {
        const request = await prisma.passwordResetRequest.findUnique({
            where: {
                token: resetToken
            }, select: {
                expires: true
            }
        });

        if (!request) {
            return false;
        }

        if (request.expires < new Date()) {
            await prisma.passwordResetRequest.delete({
                where: {
                    token: resetToken
                }
            });

            return false;
        }

        return true;
    } catch {
        return false
    }
}

export async function resetPassword(resetToken: string, data: z.infer<typeof ResetFormSchema>): Promise<boolean> {
    try {
        const request = await prisma.passwordResetRequest.findUnique({
            where: {
                token: resetToken
            }, select: {
                userId: true,
                expires: true
            }
        });

        if (!request) {
            return false;
        }

        if (request.expires < new Date()) {
            await prisma.passwordResetRequest.delete({
                where: {
                    token: resetToken
                }
            })

            return false;
        }

        const parsedData = ResetFormSchema.safeParse(data);

        if (!parsedData.success) {
            return false;
        }

        const hashedPassword = await bcrypt.hash(parsedData.data.password, 13);

        await prisma.user.update({
            data: {
                password: hashedPassword
            },
            where: {
                id: request.userId
            }
        });

        await prisma.passwordResetRequest.delete({
            where: {
                token: resetToken
            }
        })

        return true;
    } catch {
        return false
    }
}

export async function changePassword(userId: string, data: z.infer<typeof ChangePasswordFormSchema>): Promise<boolean> {
    if (!(await isUser(userId))) {
        return false;
    }

    const parsedData = ChangePasswordFormSchema.safeParse(data);

    if (!parsedData.success) {
        return false;
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }, select: {
                password: true
            }
        });

        if (!user) {
            return false
        }
        const isPasswordValid = await bcrypt.compare(parsedData.data.oldPassword, user.password);

        if (!isPasswordValid) {
            return false
        }

        const hashedPassword = await bcrypt.hash(parsedData.data.password, 13);

        await prisma.user.update({
            data: {
                password: hashedPassword
            },
            where: {
                id: userId
            }
        });

        return true;
    } catch {
        return false;
    }
}

export async function editRoles(userId: string, roles: z.infer<typeof EditRolesFormSchema>): Promise<boolean> {

    if (!(await isAdmin())) {
        return false;
    }

    try {
        await prisma.userRole.deleteMany({
            where: {
                userId: userId
            }
        });
        await prisma.user.update({
            where: { id: userId },
            data: {
                userRoles: {
                    create: roles.roles.map(r => ({ role: r }))
                }
            }
        });

        // Invalidate current user session
        await prisma.session.deleteMany({
            where: {
                userId: userId
            }
        });

        revalidatePath("/app/administration");
        return true;
    } catch (e) {
        console.log(`Error editing roles of user: ${e}`);
        return false;
    }
}

export async function deleteUser(userId: string): Promise<boolean> {
    if (!(await isAdmin()) && !(await isUser(userId))) {
        return false;
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                containers: { set: [] }
            }
        })
        await prisma.user.delete({
            where: { id: userId }
        });

        revalidatePath("/app/administration");
        return true;
    } catch (e) {
        console.log(`Error deleting user: ${e}`);
        return false;
    }
}