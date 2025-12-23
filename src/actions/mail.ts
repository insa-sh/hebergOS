'use server'

import { createTransport } from "nodemailer";
import { UserLight } from "@/lib/definitions";


const SMTP_HOST = process.env.SMTP_HOST
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SMTP_FROM = process.env.SMTP_FROM
const transporter = createTransport({
    host: SMTP_HOST,
    port: 587,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    },
    secure: true
}, {
    from: `HebergOS <${SMTP_FROM}>`
})

export async function sendMail(user: UserLight) {

    const info = await transporter.sendMail({
        to: `${user.name} <${user.email}>`,
        subject: 'Email de test',
        text: 'Ceci est un test'
    })
    console.log('Message Sent', info.accepted);
}