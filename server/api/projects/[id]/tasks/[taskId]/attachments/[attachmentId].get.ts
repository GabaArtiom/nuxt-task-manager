import { createReadStream } from 'node:fs'
import { access } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { sendStream } from 'h3'
import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

interface Attachment {
  id: string
  name: string
  url: string
}

function normalizeAttachments(value: unknown): Attachment[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item: any) => ({
      id: String(item.id || ''),
      name: String(item.name || ''),
      url: String(item.url || ''),
    }))
    .filter((item) => item.id && item.name && item.url)
}

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const projectId = getRouterParam(event, 'id')!
  const taskId = getRouterParam(event, 'taskId')!
  const attachmentId = getRouterParam(event, 'attachmentId')!

  const member = await prisma.projectMember.findUnique({
    where: { project_id_user_id: { project_id: projectId, user_id: user.id } },
  })

  if (!member) {
    throw createError({ statusCode: 403, statusMessage: 'Not a project member' })
  }

  const task = await prisma.task.findFirst({
    where: { id: taskId, project_id: projectId },
    select: { attachments: true },
  })

  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  const attachment = normalizeAttachments(task.attachments).find((item) => item.id === attachmentId)
  if (!attachment) {
    throw createError({ statusCode: 404, statusMessage: 'Attachment not found' })
  }

  const filename = basename(attachment.url)
  const filePath = join(process.cwd(), 'public', 'uploads', 'tasks', taskId, filename)

  try {
    await access(filePath)
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'File not found' })
  }

  setHeader(event, 'Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(attachment.name)}`)

  return sendStream(event, createReadStream(filePath))
})
