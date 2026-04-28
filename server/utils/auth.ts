import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { H3Event } from 'h3'
import { prisma } from './db'

interface TokenPayload {
  userId: string
  email: string
  role: string
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function createToken(user: { id: string; email: string; role: string }): string {
  const config = useRuntimeConfig()
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role } as TokenPayload,
    config.jwtSecret,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): TokenPayload {
  const config = useRuntimeConfig()
  return jwt.verify(token, config.jwtSecret) as TokenPayload
}

export async function requireAuth(event: H3Event) {
  const token = getCookie(event, 'auth_token')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  try {
    const payload = verifyToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
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

    if (!user || user.is_locked) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    return user
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
}

export async function requireAdmin(event: H3Event) {
  const user = await requireAuth(event)
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  return user
}

export function generateResetToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}
