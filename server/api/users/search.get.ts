import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const users = await prisma.user.findMany({
    where: { is_locked: false },
    select: { id: true, name: true, family_name: true, email: true },
    orderBy: [{ name: 'asc' }, { family_name: 'asc' }],
  })

  return users
})
