import { prisma } from '~~/server/utils/db'
import { generateResetToken } from '~~/server/utils/auth'
import { sendResetPasswordEmail } from '~~/server/utils/email'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.email) {
    throw createError({ statusCode: 400, statusMessage: 'Email is required' })
  }

  // Always return success to not leak if email exists
  const user = await prisma.user.findUnique({
    where: { email: body.email },
  })

  if (user) {
    const token = generateResetToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        reset_token: token,
        reset_token_expires_at: expiresAt,
      },
    })

    await sendResetPasswordEmail(user.email, token)
  }

  return { message: 'If the email exists, a reset link has been sent.' }
})
