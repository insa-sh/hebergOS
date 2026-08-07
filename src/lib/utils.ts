import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { SignInFormSchema, UserWithContainers, SessionUser } from '@/lib/definitions';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { prisma } from "@/lib/prisma";
import { ContainerState } from "@prisma/client";
import { getUser, verifySession } from '@/lib/dal';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function isAdmin() {
  const sessionUser = await getUser();

  if (!sessionUser) {
    return false;
  }

  return sessionUser.roles.includes(Role.ADMIN);
}

export async function isUser(id: string) {
  const sessionUser = await getUser();

  if (!sessionUser) {
    return false;
  }

  return sessionUser.id === id;
}

export async function canAccessContainer(containerId: string) {
  const sessionUser = await getUser();

  if (!sessionUser) {
    return false;
  }

  let user: UserWithContainers | null = null;
  try {
    user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: { containers: true, userRoles: true }
    });
  } catch {
    return false;
  }

  if (!user) {
    return false;
  }

  if (user.userRoles.map(r => r.role).includes(Role.ADMIN) || user?.containers.some(c => c.id === containerId)) {
    return true;
  }

  return false;
}

export async function syncContainers() {
  const sessionAuth = await verifySession();

  if (!sessionAuth || sessionAuth.isAuth == false) {
    return false;
  }

  const r = await fetch(process.env.API_URL + "/container");

  if (!r.ok) {
    return false;
  }

  const containers = (await r.json())["success"];

  if (!containers) {
    return false;
  }

  for (const [id, value] of Object.entries(containers) as [string, { dockerlink: string, host_port_root: string, name: string, ports: { [key: string]: string }[], state: string, started_at?: number, exit_code?: number }][]) {
    let state;

    switch (value.state) {
      case "running":
        state = ContainerState.RUNNING;
        break;

      case "created":
        state = ContainerState.CREATED;
        break;

      case "paused":
        state = ContainerState.PAUSED;
        break;

      case "restarting":
        state = ContainerState.RESTARTING;
        break;

      case "exited":
        state = ContainerState.STOPPED;
        break;

      default:
        state = ContainerState.CREATED;
        break;
    }

    await prisma.container.upsert({
      where: { id: id },
      update: {
        name: value.name,
        hostPort: parseInt(value.host_port_root) || 0,
        startedAt: state == "RUNNING" ? new Date(value.started_at! * 1000) : undefined,
        state: state,
      },
      create: {
        id: id,
        name: value.name,
        hostPort: parseInt(value.host_port_root) || 0,
        startedAt: state == "RUNNING" ? new Date(value.started_at!) : undefined,
        state: state,
      }
    })
  }

}
