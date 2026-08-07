import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/dal";

export async function POST(request: NextRequest) {
    if (!request.nextUrl.searchParams.get("containerId")) {
        return new Response(null, { status: 400 });
    }

    const sessionUser = await getUser();

    if (!sessionUser) {
        return new Response(null, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        include: { containers: true }
    });
        

    if (sessionUser.roles.includes(Role.ADMIN) || user?.containers.some(c => c.id === request.nextUrl.searchParams.get("containerId"))) {
        return new Response(JSON.stringify({ status: true }), { status: 200 });
    }

    return new Response(null, { status: 401 });
}