import { prisma } from '~~/server/utils/db'
import { requireAdmin, generateResetToken, hashPassword } from '~~/server/utils/auth'
import { sendWelcomeEmail } from '~~/server/utils/email'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)

  if (!body.name?.trim() || !body.family_name?.trim() || !body.email?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Name, family name, and email are required' })
  }

  if (!['admin', 'technician'].includes(body.role)) {
    throw createError({ statusCode: 400, statusMessage: 'Role must be admin or technician' })
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email } })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Email already exists' })
  }

  const token = generateResetToken()
  const tempPassword = await hashPassword(token) // temp password, user will set via magic link

  const user = await prisma.user.create({
    data: {
      name: body.name.trim(),
      family_name: body.family_name.trim(),
      email: body.email.trim().toLowerCase(),
      password: tempPassword,
      role: body.role,
      reset_token: token,
      reset_token_expires_at: new Date(Date.now() + 60 * 60 * 1000),
    },
    select: {
      id: true,
      name: true,
      family_name: true,
      email: true,
      role: true,
      is_locked: true,
      created_at: true,
    },
  })

  await sendWelcomeEmail(user.email, token)

  return user
})
