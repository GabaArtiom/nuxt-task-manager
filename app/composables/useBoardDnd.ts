import { ref, onMounted, onUnmounted, type Directive } from 'vue'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview'

export interface DropPlan {
  sourceTaskId: string
  destColumnId: string
  targetTaskId: string | null
  edge: Edge | null
}

interface CardBinding {
  taskId: string
  columnId: string
}

interface ColumnBinding {
  columnId: string
}

type Cleanup = () => void

/**
 * Wires up board drag-and-drop using @atlaskit/pragmatic-drag-and-drop.
 *
 * Exposes Vue directives (`v-card`, `v-column`, `v-board`) that register the
 * relevant elements, plus reactive state used to render the drag visuals.
 * Drop logic is centralised in a single `monitorForElements`, which calls the
 * provided `onDrop` with a normalised {@link DropPlan} – the page owns the
 * actual data mutation + persistence.
 */
export function useBoardDnd(onDrop: (plan: DropPlan) => void) {
  const draggingTaskId = ref<string | null>(null)
  const dropEdge = ref<{ taskId: string; edge: Edge | null } | null>(null)
  const dropColumnId = ref<string | null>(null)

  const cardData = new WeakMap<HTMLElement, CardBinding>()
  const columnData = new WeakMap<HTMLElement, ColumnBinding>()
  const cleanups = new WeakMap<HTMLElement, Cleanup>()

  function clearVisuals() {
    draggingTaskId.value = null
    dropEdge.value = null
    dropColumnId.value = null
  }

  const vCard: Directive<HTMLElement, CardBinding> = {
    mounted(el, binding) {
      cardData.set(el, binding.value)
      cleanups.set(
        el,
        combine(
          draggable({
            element: el,
            getInitialData: () => ({ kind: 'card', ...cardData.get(el)! }),
            onGenerateDragPreview: ({ nativeSetDragImage, source }) => {
              const rect = source.element.getBoundingClientRect()
              setCustomNativeDragPreview({
                nativeSetDragImage,
                getOffset: pointerOutsideOfPreview({ x: '12px', y: '8px' }),
                render: ({ container }) => {
                  const clone = source.element.cloneNode(true) as HTMLElement
                  clone.style.width = `${rect.width}px`
                  clone.style.transform = 'rotate(3deg)'
                  clone.style.cursor = 'grabbing'
                  clone.classList.remove('opacity-40')
                  container.appendChild(clone)
                },
              })
            },
            onDragStart: () => {
              draggingTaskId.value = cardData.get(el)!.taskId
            },
            onDrop: () => {
              draggingTaskId.value = null
            },
          }),
          dropTargetForElements({
            element: el,
            canDrop: ({ source }) => source.data.kind === 'card',
            getIsSticky: () => true,
            getData: ({ input, element }) =>
              attachClosestEdge(
                { kind: 'card', ...cardData.get(el)! },
                { input, element, allowedEdges: ['top', 'bottom'] },
              ),
            onDrag: ({ self, source }) => {
              const { taskId } = cardData.get(el)!
              if (source.data.taskId === taskId) {
                dropEdge.value = null
                return
              }
              dropEdge.value = { taskId, edge: extractClosestEdge(self.data) }
            },
            onDragLeave: () => {
              if (dropEdge.value?.taskId === cardData.get(el)!.taskId) dropEdge.value = null
            },
            onDrop: () => {
              dropEdge.value = null
            },
          }),
        ),
      )
    },
    updated(el, binding) {
      cardData.set(el, binding.value)
    },
    unmounted(el) {
      cleanups.get(el)?.()
    },
  }

  const vColumn: Directive<HTMLElement, ColumnBinding> = {
    mounted(el, binding) {
      columnData.set(el, binding.value)
      cleanups.set(
        el,
        dropTargetForElements({
          element: el,
          canDrop: ({ source }) => source.data.kind === 'card',
          getData: () => ({ kind: 'column', ...columnData.get(el)! }),
          onDragEnter: () => {
            dropColumnId.value = columnData.get(el)!.columnId
          },
          onDrag: () => {
            dropColumnId.value = columnData.get(el)!.columnId
          },
          onDragLeave: () => {
            if (dropColumnId.value === columnData.get(el)!.columnId) dropColumnId.value = null
          },
          onDrop: () => {
            dropColumnId.value = null
          },
        }),
      )
    },
    updated(el, binding) {
      columnData.set(el, binding.value)
    },
    unmounted(el) {
      cleanups.get(el)?.()
    },
  }

  const vBoard: Directive<HTMLElement> = {
    mounted(el) {
      cleanups.set(
        el,
        autoScrollForElements({
          element: el,
          canScroll: ({ source }) => source.data.kind === 'card',
        }),
      )
    },
    unmounted(el) {
      cleanups.get(el)?.()
    },
  }

  onMounted(() => {
    const cleanup = monitorForElements({
      canMonitor: ({ source }) => source.data.kind === 'card',
      onDrop: ({ source, location }) => {
        clearVisuals()
        const target = location.current.dropTargets[0]
        if (!target) return

        const sourceTaskId = source.data.taskId as string
        const data = target.data

        if (data.kind === 'card') {
          onDrop({
            sourceTaskId,
            destColumnId: data.columnId as string,
            targetTaskId: data.taskId as string,
            edge: extractClosestEdge(data),
          })
        } else {
          onDrop({
            sourceTaskId,
            destColumnId: data.columnId as string,
            targetTaskId: null,
            edge: null,
          })
        }
      },
    })
    onUnmounted(cleanup)
  })

  return { draggingTaskId, dropEdge, dropColumnId, vCard, vColumn, vBoard }
}
