import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST || 'localhost'
  const port = Number(process.env.SMTP_PORT || '587')
  const user = process.env.SMTP_USER || ''
  const pass = process.env.SMTP_PASS || ''

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user ? { user, pass } : undefined,
  })

  return transporter
}

export async function sendResetPasswordEmail(email: string, token: string) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000'
  const from = process.env.FROM_EMAIL || 'noreply@tickets.local'
  const resetUrl = `${appUrl}/set-password?token=${token}`

  try {
    await getTransporter().sendMail({
      from,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    })
    console.log(`[SMTP] Reset email sent to ${email}`)
  } catch (error: any) {
    console.error('[SMTP Error]', error?.message || error)
    console.log(`\n[Password Reset] Fallback URL for ${email}: ${resetUrl}\n`)
  }
}

export async function sendWelcomeEmail(email: string, token: string) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000'
  const from = process.env.FROM_EMAIL || 'noreply@tickets.local'
  const setPasswordUrl = `${appUrl}/set-password?token=${token}`

  try {
    await getTransporter().sendMail({
      from,
      to: email,
      subject: 'Welcome — Set Your Password',
      html: `
        <h2>Welcome to Ticket Management System</h2>
        <p>Your account has been created. Click the link below to set your password.</p>
        <p><a href="${setPasswordUrl}">${setPasswordUrl}</a></p>
        <p>This link expires in 1 hour.</p>
      `,
    })
    console.log(`[SMTP] Welcome email sent to ${email}`)
  } catch (error: any) {
    console.error('[SMTP Error]', error?.message || error)
    console.log(`\n[Welcome] Fallback URL for ${email}: ${setPasswordUrl}\n`)
  }
}
