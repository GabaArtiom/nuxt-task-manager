import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'
import { broadcastToUsers } from '~~/server/utils/broadcast'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!

  if (user.role !== 'super_admin') {
    const member = await prisma.projectMember.findUnique({
      where: { project_id_user_id: { project_id: id, user_id: user.id } },
    })

    if (!member || member.role !== 'owner') {
      throw createError({ statusCode: 403, statusMessage: 'Only project owner can delete' })
    }
  }

  const members = await prisma.projectMember.findMany({
    where: { project_id: id },
    select: { user_id: true },
  })

  await prisma.project.delete({ where: { id } })

  broadcastToUsers(members.map((member) => member.user_id), 'project:list:remove', {
    project_id: id,
    triggered_by: user.id,
  })

  return { success: true }
})
