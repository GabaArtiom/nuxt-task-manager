import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const projectId = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const member = await prisma.projectMember.findUnique({
    where: { project_id_user_id: { project_id: projectId, user_id: user.id } },
  })

  if (!member) {
    throw createError({ statusCode: 403, statusMessage: 'Not a project member' })
  }

  if (!body.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Column name is required' })
  }

  const lastColumn = await prisma.column.findFirst({
    where: { project_id: projectId },
    orderBy: { order: 'desc' },
  })

  const column = await prisma.column.create({
    data: {
      project_id: projectId,
      name: body.name.trim(),
      order: (lastColumn?.order ?? -1) + 1,
    },
  })

  return column
})
