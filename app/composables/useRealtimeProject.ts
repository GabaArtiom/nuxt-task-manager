import { useAuthStore } from '~/stores/auth'

export function useRealtimeProject(projectId: string, project: Ref<any>) {
  const auth = useAuthStore()
  let es: EventSource | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  function connect() {
    if (import.meta.server) return
    es = new EventSource('/sse')

    es.onmessage = (e) => {
      if (e.data === '') return
      try {
        const { type, data } = JSON.parse(e.data)
        if (type === 'connected') return
        if (data.project_id !== projectId) return
        applyEvent(type, data)
      } catch {}
    }

    es.onerror = () => {
      es?.close()
      es = null
      reconnectTimer = setTimeout(connect, 3000)
    }
  }

  function applyEvent(type: string, data: any) {
    const p = project.value
    if (!p) return

    switch (type) {
      case 'task:created': {
        const col = p.columns.find((c: any) => c.id === data.task.column_id)
        if (col && !col.tasks.find((t: any) => t.id === data.task.id)) {
          col.tasks.push(data.task)
        }
        break
      }

      case 'task:updated': {
        let existingTask: any = null

        for (const col of p.columns) {
          const idx = col.tasks.findIndex((t: any) => t.id === data.task.id)
          if (idx !== -1) {
            existingTask = col.tasks[idx]
            col.tasks.splice(idx, 1)
            break
          }
        }

        const task = existingTask ? { ...existingTask, ...data.task } : data.task
        const targetCol = p.columns.find((c: any) => c.id === data.task.column_id)
        if (targetCol) {
          const existingIdx = targetCol.tasks.findIndex((t: any) => t.id === task.id)
          if (existingIdx !== -1) targetCol.tasks.splice(existingIdx, 1)

          const insertAt = targetCol.tasks.findIndex((t: any) => t.order > task.order)
          if (insertAt === -1) targetCol.tasks.push(task)
          else targetCol.tasks.splice(insertAt, 0, task)
        }
        break
      }

      case 'project:updated': {
        Object.assign(p, data.project)
        break
      }

      case 'task:deleted': {
        for (const col of p.columns) {
          const idx = col.tasks.findIndex((t: any) => t.id === data.task_id)
          if (idx !== -1) { col.tasks.splice(idx, 1); break }
        }
        break
      }

      case 'column:created': {
        if (!p.columns.find((c: any) => c.id === data.column.id)) {
          p.columns.push({ ...data.column, tasks: [] })
        }
        break
      }

      case 'column:updated': {
        const col = p.columns.find((c: any) => c.id === data.column.id)
        if (col) Object.assign(col, data.column)
        break
      }

      case 'column:deleted': {
        const idx = p.columns.findIndex((c: any) => c.id === data.column_id)
        if (idx !== -1) p.columns.splice(idx, 1)
        break
      }

      case 'member:added': {
        const idx = p.members.findIndex((m: any) => m.user_id === data.member.user_id)
        if (idx === -1) {
          p.members.push(data.member)
        } else {
          p.members[idx] = { ...p.members[idx], ...data.member }
        }
        break
      }

      case 'member:removed': {
        const idx = p.members.findIndex((m: any) => m.user_id === data.user_id)
        if (idx !== -1) p.members.splice(idx, 1)
        break
      }
    }
  }

  onMounted(connect)

  onUnmounted(() => {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    es?.close()
    es = null
  })
}
