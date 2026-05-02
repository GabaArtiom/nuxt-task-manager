import { createReadStream } from 'node:fs'
import { access } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { sendStream } from 'h3'

function downloadName(filename: string) {
  const match = filename.match(/^[0-9a-f-]{36}-(.+)$/i)
  return match?.[1] || filename
}

export default defineEventHandler(async (event) => {
  const taskId = basename(getRouterParam(event, 'taskId') || '')
  const filename = basename(getRouterParam(event, 'filename') || '')

  if (!taskId || !filename) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid file path' })
  }

  const filePath = join(process.cwd(), 'public', 'uploads', 'tasks', taskId, filename)

  try {
    await access(filePath)
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'File not found' })
  }

  const name = downloadName(filename)
  setHeader(event, 'Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(name)}`)

  return sendStream(event, createReadStream(filePath))
})
