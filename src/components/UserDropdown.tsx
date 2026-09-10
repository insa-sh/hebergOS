'use client'

import { Bell, Lock, LogOut, Mail, MessagesSquare, Shield, Trash, User } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import Link from "next/link";
import { useTranslations } from "next-intl";
import ContactMessages from "./dialogs/contact/ContactMessages";
import React from "react";
import { Role } from "@prisma/client";
import ChangePassword from "./dialogs/users/ChangePassword";
import ChangeNickname from "./dialogs/users/ChangeNickname";
import ChangeMail from "./dialogs/users/ChangeMail";
import { SessionUser } from "@/lib/definitions";
import DeleteUser from "./dialogs/users/DeleteUser";
import { getUser } from "@/lib/dal";
import { signOut } from "@/actions/auth";

export default async function UserDropdown() {

    const t = useTranslations("components.users.userDropdown");
    const user = await getUser();
    if (!user){
        return null;
    }


    const handleLogout = async () => {
        signOut();
    }



    const [openMessages, setOpenMessages] = React.useState(false);
    const [openChangeNickname, setOpenChangeNickname] = React.useState(false);
    const [openChangeMail, setOpenChangeMail] = React.useState(false);
    const [openChangePassword, setOpenChangePassword] = React.useState(false);
    const [openDeleteUser, setOpenDeleteUser] = React.useState(false);

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
                        {user?.roles.includes(Role.ADMIN)
                            ? <DropdownMenuItem asChild>
                                <Link href={"/app/administration"}>
                                    <Shield /> {t('administration')}
                                </Link>
                            </DropdownMenuItem>
                            : null
                        }
                        {user?.roles.includes(Role.ADMIN)
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
                        <DropdownMenuItem onClick={() => setOpenDeleteUser(true)}>
                            <Trash /> {t('delete')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut /> {t('logout')}
                        </DropdownMenuItem>

                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu >
            <ContactMessages open={openMessages} setOpen={setOpenMessages} />
            <ChangePassword user={user} open={openChangePassword} setOpen={setOpenChangePassword} />
            <ChangeNickname user={user} open={openChangeNickname} setOpen={setOpenChangeNickname} />
            <ChangeMail user={user} open={openChangeMail} setOpen={setOpenChangeMail} />
            <DeleteUser user={user} open={openDeleteUser} setOpen={setOpenDeleteUser} />
        </>
    )
}
