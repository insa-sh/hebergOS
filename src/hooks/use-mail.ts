import * as nodemailer from "nodemailer";

export default function useMail() {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        secure: false
    },{
        from: `HebergOS <${process.env.SMTP_FROM}>`
    })
    return transporter
}