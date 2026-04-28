import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'
import { broadcastToProject } from '~~/server/utils/broadcast'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const projectId = getRouterParam(event, 'id')!
  const taskId = getRouterParam(event, 'taskId')!
  const body = await readBody(event)

  const member = await prisma.projectMember.findUnique({
    where: { project_id_user_id: { project_id: projectId, user_id: user.id } },
  })

  if (!member) {
    throw createError({ statusCode: 403, statusMessage: 'Not a project member' })
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.description !== undefined && { description: body.description?.trim() || null }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.column_id !== undefined && { column_id: body.column_id }),
      ...(body.assigned_to !== undefined && { assigned_to: body.assigned_to || null }),
      ...(body.due_date !== undefined && { due_date: body.due_date ? new Date(body.due_date) : null }),
      ...(body.order !== undefined && { order: body.order }),
    },
    include: {
      assignee: { select: { id: true, name: true, family_name: true } },
      creator: { select: { id: true, name: true, family_name: true } },
    },
  })

  broadcastToProject(projectId, 'task:updated', { task, triggered_by: user.id })

  return task
})
