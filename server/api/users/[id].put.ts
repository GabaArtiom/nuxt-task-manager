import { prisma } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const data: any = {}
  if (body.name !== undefined) data.name = body.name.trim()
  if (body.family_name !== undefined) data.family_name = body.family_name.trim()
  if (body.email !== undefined) {
    const email = body.email.trim().toLowerCase()
    if (email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        throw createError({ statusCode: 409, statusMessage: 'Email already exists' })
      }
      data.email = email
    }
  }
  if (body.role !== undefined) {
    if (!['super_admin', 'admin', 'member'].includes(body.role)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid role' })
    }
    data.role = body.role
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
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

  return updated
})
