import { addSSEClient } from '~~/server/utils/sse'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  // Require authentication
  const user = await requireAuth(event)

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  const send = (data: string) => {
    event.node.res.write(`data: ${data}\n\n`)
  }

  // Send initial ping so client knows it's connected
  send(JSON.stringify({ type: 'connected' }))

  const remove = addSSEClient({ send, userId: user.id, role: user.role })

  // Keep connection alive with periodic pings
  const pingInterval = setInterval(() => {
    try {
      event.node.res.write(': ping\n\n')
    } catch {
      clearInterval(pingInterval)
    }
  }, 30000)

  // Clean up on close
  event.node.req.on('close', () => {
    clearInterval(pingInterval)
    remove()
  })

  // Keep the response open
  await new Promise<void>((resolve) => {
    event.node.req.on('close', resolve)
  })
})
