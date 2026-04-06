import { prisma } from '~~/server/utils/db'
import { comparePassword, createToken } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.email || !body.password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email },
  })

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  if (user.is_locked) {
    throw createError({ statusCode: 403, statusMessage: 'Account is locked. Contact an administrator.' })
  }

  const valid = await comparePassword(body.password, user.password)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const token = createToken(user)

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return {
    user: {
      id: user.id,
      name: user.name,
      family_name: user.family_name,
      email: user.email,
      role: user.role,
      is_locked: user.is_locked,
      created_at: user.created_at,
    },
  }
})
