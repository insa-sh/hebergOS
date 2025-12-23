'use server'

import useMail from "@/hooks/use-mail";
import { UserLight } from "@/lib/definitions";

export function sendMail(user: UserLight) {
    const transporter = useMail()
    transporter.sendMail({
        to: `${user.name} <${user.email}>`,
        subject: 'Email de test',
        text: 'Ceci est un test'
    }, (error, info) => {
        if (error) {
            console.log(error.message)
        } else {
            console.log(info.response)
        }
    })
}