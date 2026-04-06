import { prisma } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const currentUser = await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  if (id === currentUser.id) {
    throw createError({ statusCode: 400, statusMessage: 'You cannot lock yourself' })
  }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { is_locked: !user.is_locked },
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
