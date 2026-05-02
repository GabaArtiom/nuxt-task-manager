import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'
import { broadcastToProject } from '~~/server/utils/broadcast'

interface Attachment {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploaded_at: string
}

function normalizeAttachments(value: unknown): Attachment[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item: any) => ({
      id: String(item.id || randomUUID()),
      name: String(item.name || '').trim(),
      url: String(item.url || ''),
      size: Number(item.size || 0),
      type: String(item.type || ''),
      uploaded_at: String(item.uploaded_at || new Date().toISOString()),
    }))
    .filter((item) => item.name && item.url)
}

function safeFilename(name: string) {
  const base = name.trim().replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')
  return base || 'file'
}

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const projectId = getRouterParam(event, 'id')!
  const taskId = getRouterParam(event, 'taskId')!

  const member = await prisma.projectMember.findUnique({
    where: { project_id_user_id: { project_id: projectId, user_id: user.id } },
  })

  if (!member) {
    throw createError({ statusCode: 403, statusMessage: 'Not a project member' })
  }

  const task = await prisma.task.findFirst({
    where: { id: taskId, project_id: projectId },
    select: { id: true, attachments: true },
  })

  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  const parts = await readMultipartFormData(event)
  const files = parts?.filter((part) => part.name === 'files' && part.filename && part.data.length) ?? []

  if (!files.length) {
    throw createError({ statusCode: 400, statusMessage: 'No files uploaded' })
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads', 'tasks', taskId)
  await mkdir(uploadDir, { recursive: true })

  const uploaded: Attachment[] = []

  for (const file of files) {
    const original = file.filename || 'file'
    const id = randomUUID()
    const filename = `${id}${extname(original)}`
    await writeFile(join(uploadDir, filename), file.data)

    uploaded.push({
      id,
      name: safeFilename(original),
      url: `/uploads/tasks/${taskId}/${filename}`,
      size: file.data.length,
      type: file.type || 'application/octet-stream',
      uploaded_at: new Date().toISOString(),
    })
  }

  const attachments = [...normalizeAttachments(task.attachments), ...uploaded]
  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { attachments },
    include: {
      assignee: { select: { id: true, name: true, family_name: true } },
      creator: { select: { id: true, name: true, family_name: true } },
    },
  })

  broadcastToProject(projectId, 'task:updated', { task: updated, triggered_by: user.id })

  return updated
})
