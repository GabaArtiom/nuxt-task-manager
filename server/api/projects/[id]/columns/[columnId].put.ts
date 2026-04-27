import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const projectId = getRouterParam(event, 'id')!
  const columnId = getRouterParam(event, 'columnId')!
  const body = await readBody(event)

  const member = await prisma.projectMember.findUnique({
    where: { project_id_user_id: { project_id: projectId, user_id: user.id } },
  })

  if (!member) {
    throw createError({ statusCode: 403, statusMessage: 'Not a project member' })
  }

  const column = await prisma.column.update({
    where: { id: columnId },
    data: {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.order !== undefined && { order: body.order }),
    },
  })

  return column
})
