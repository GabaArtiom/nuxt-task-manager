import { prisma } from '~~/server/utils/db'
import { hashPassword } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.token || !body.password) {
    throw createError({ statusCode: 400, statusMessage: 'Token and password are required' })
  }

  if (body.password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
  }

  const user = await prisma.user.findFirst({
    where: {
      reset_token: body.token,
      reset_token_expires_at: { gt: new Date() },
    },
  })

  if (!user) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or expired token' })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(body.password),
      reset_token: null,
      reset_token_expires_at: null,
    },
  })

  return { message: 'Password updated successfully' }
})
