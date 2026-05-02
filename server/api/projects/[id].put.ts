import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'
import { broadcastToProject, broadcastToUsers } from '~~/server/utils/broadcast'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  if (user.role !== 'super_admin') {
    const member = await prisma.projectMember.findUnique({
      where: { project_id_user_id: { project_id: id, user_id: user.id } },
    })

    if (!member || member.role !== 'owner') {
      throw createError({ statusCode: 403, statusMessage: 'Only project owner can edit' })
    }
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      name: body.name?.trim(),
      description: body.description?.trim() ?? null,
    },
  })

  broadcastToProject(id, 'project:updated', { project, triggered_by: user.id })

  const projectCard = await prisma.project.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, family_name: true } },
      members: {
        include: { user: { select: { id: true, name: true, family_name: true, email: true } } },
      },
      _count: { select: { tasks: true, columns: true } },
    },
  })

  if (projectCard) {
    broadcastToUsers(projectCard.members.map((member) => member.user_id), 'project:list:upsert', {
      project: projectCard,
      triggered_by: user.id,
    })
  }

  return project
})
