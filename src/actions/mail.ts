'use server'

import { createTransport } from "nodemailer";

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

export async function sendPasswordReset(resetToken: string, user: { name: string, email: string }): Promise<boolean> {
    try {
        await transporter.sendMail({
            to: `${user.name} <${user.email}>`,
            subject: 'Réinitialiser votre mot de passe - Reset your password',
            text:
                `Veuillez utiliser le lien suivant pour réinitialiser votre mot de passe : \n
            ${process.env.NEXTAUTH_URL}/reset/${resetToken}\n
            Ce lien est valable trois heures.\n
            \n
            Use the link below to reset your password : \n
            ${process.env.NEXTAUTH_URL}/reset/${resetToken}\n
            This link will expire after three hours.
            `,
            html: `
            <div>
                <h1>Réinitialiser votre mot de passe</h1>
                <p>
                    Veuillez utiliser le lien suivant pour réinitialiser votre mot de passe : <br>
                    <a href="${process.env.NEXTAUTH_URL}/reset/${resetToken}">${process.env.NEXTAUTH_URL}/reset/${resetToken}</a><br>
                    Ce lien est valable trois heures.
                </p>
                <h1>Reset your password</h1>
                <p>

                    Use the link below to reset your password : <br>
                    <a href="${process.env.NEXTAUTH_URL}/reset/${resetToken}">${process.env.NEXTAUTH_URL}/reset/${resetToken}</a><br>
                    This link will expire after three hours.
                </p>
            </div>
            `
        })
        return true
    } catch {
        return false
    }
}

export async function sendPasswordSet(resetToken: string, user: { name: string, email: string }): Promise<boolean> {
    try {
        await transporter.sendMail({
            to: `${user.name} <${user.email}>`,
            subject: 'Choisissez votre mot de passe - Set your password',
            text:
                `Veuillez utiliser le lien suivant pour choisir votre mot de passe : \n
            ${process.env.NEXTAUTH_URL}/reset/${resetToken}\n
            Ce lien est valable trois heures.\n
            \n
            Use the link below to set your password : \n
            ${process.env.NEXTAUTH_URL}/reset/${resetToken}\n
            This link will expire after three hours.
            `,
            html: `
            <div>
                <h1>Choisissez votre mot de passe</h1>
                <p>
                    Veuillez utiliser le lien suivant pour choisir votre mot de passe : <br>
                    <a href="${process.env.NEXTAUTH_URL}/reset/${resetToken}">${process.env.NEXTAUTH_URL}/reset/${resetToken}</a><br>
                    Ce lien est valable trois heures.
                </p>
                <h1>Set your password</h1>
                <p>

                    Use the link below to set your password : <br>
                    <a href="${process.env.NEXTAUTH_URL}/reset/${resetToken}">${process.env.NEXTAUTH_URL}/reset/${resetToken}</a><br>
                    This link will expire after three hours.
                </p>
            </div>
            `
        })
        return true
    } catch {
        return false
    }
}