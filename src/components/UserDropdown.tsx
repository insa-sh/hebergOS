'use client'

import { Bell, Lock, LogOut, Mail, MessagesSquare, Shield, User } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import ContactMessages from "./dialogs/contact/ContactMessages";
import React from "react";
import { Role } from "@prisma/client";
import ChangePassword from "./dialogs/users/ChangePassword";
import ChangeNickname from "./dialogs/users/ChangeNickname";
import ChangeMail from "./dialogs/users/ChangeMail";
import { UserLight } from "@/lib/definitions";

export default async function UserDropdown({user}: {user : UserLight}) {

    const t = useTranslations("components.users.userDropdown");
    const userRoles = user.userRoles.map((r) => r.role)


    const handleLogout = async () => {
        signOut();
    }

    const [openMessages, setOpenMessages] = React.useState(false);
    const [openChangeNickname, setOpenChangeNickname] = React.useState(false);
    const [openChangeMail, setOpenChangeMail] = React.useState(false);
    const [openChangePassword, setOpenChangePassword] = React.useState(false);

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant={"link"} className="text-inherit text-base">
                        <span className="max-w-32 md:max-w-96 truncate">
                            {user?.name}
                        </span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-40">
                    <DropdownMenuLabel>{t('label')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <Bell /> {t('notifications')}
                        </DropdownMenuItem>
                        {userRoles.includes(Role.ADMIN)
                            ? <DropdownMenuItem asChild>
                                <Link href={"/app/administration"}>
                                    <Shield /> {t('administration')}
                                </Link>
                            </DropdownMenuItem>
                            : null
                        }
                        {userRoles.includes(Role.ADMIN)
                            ? <DropdownMenuItem onClick={() => setOpenMessages(true)}>
                                <MessagesSquare /> {t('messages')}
                            </DropdownMenuItem>
                            : null
                        }
                        <DropdownMenuItem onClick={() => setOpenChangeNickname(true)}>
                            <User /> {t('nickname')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setOpenChangeMail(true)}>
                            <Mail /> {t('email')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setOpenChangePassword(true)}>
                            <Lock /> {t('password')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut /> {t('logout')}
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu >
            <ContactMessages open={openMessages} setOpen={setOpenMessages} />
            <ChangePassword user={user!} open={openChangePassword} setOpen={setOpenChangePassword} />
            <ChangeNickname user={user!} open={openChangeNickname} setOpen={setOpenChangeNickname} />
            <ChangeMail user={user!} open={openChangeMail} setOpen={setOpenChangeMail} />
        </>
    )
}