import { prisma } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      family_name: true,
      email: true,
      role: true,
      is_locked: true,
      created_at: true,
    },
    orderBy: { created_at: 'asc' },
  })

  return users
})
