import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!

  const member = await prisma.projectMember.findUnique({
    where: { project_id_user_id: { project_id: id, user_id: user.id } },
  })

  if (!member || member.role !== 'owner') {
    throw createError({ statusCode: 403, statusMessage: 'Only project owner can delete' })
  }

  await prisma.project.delete({ where: { id } })

  return { success: true }
})
