import { ref, onMounted, onUnmounted, type Directive } from 'vue'
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'

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
 * Lazily load the Pragmatic DnD modules. These are client-only and must never
 * be pulled into the SSR bundle (CJS interop breaks when Nitro inlines them),
 * so they are imported dynamically from within client-only lifecycle hooks.
 */
let dndPromise: ReturnType<typeof loadDnd> | null = null
async function loadDnd() {
  const [combineM, adapterM, hitboxM, autoScrollM, previewM, offsetM] = await Promise.all([
    import('@atlaskit/pragmatic-drag-and-drop/combine'),
    import('@atlaskit/pragmatic-drag-and-drop/element/adapter'),
    import('@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'),
    import('@atlaskit/pragmatic-drag-and-drop-auto-scroll/element'),
    import('@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'),
    import('@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source'),
  ])
  return {
    combine: combineM.combine,
    draggable: adapterM.draggable,
    dropTargetForElements: adapterM.dropTargetForElements,
    monitorForElements: adapterM.monitorForElements,
    attachClosestEdge: hitboxM.attachClosestEdge,
    extractClosestEdge: hitboxM.extractClosestEdge,
    autoScrollForElements: autoScrollM.autoScrollForElements,
    setCustomNativeDragPreview: previewM.setCustomNativeDragPreview,
    preserveOffsetOnSource: offsetM.preserveOffsetOnSource,
  }
}
function dnd() {
  if (!dndPromise) dndPromise = loadDnd()
  return dndPromise
}

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
  const draggingHeight = ref(0)
  const dropEdge = ref<{ taskId: string; edge: Edge | null } | null>(null)
  const dropColumnId = ref<string | null>(null)

  const cardData = new WeakMap<HTMLElement, CardBinding>()
  const columnData = new WeakMap<HTMLElement, ColumnBinding>()
  const cleanups = new WeakMap<HTMLElement, Cleanup>()

  function clearVisuals() {
    draggingTaskId.value = null
    draggingHeight.value = 0
    dropEdge.value = null
    dropColumnId.value = null
  }

  /**
   * Register a draggable/drop-target once the DnD modules resolve. Returns a
   * cleanup that is safe to call before the async registration completes.
   */
  function register(el: HTMLElement, setup: (m: Awaited<ReturnType<typeof loadDnd>>) => Cleanup) {
    let cleanup: Cleanup | null = null
    let destroyed = false
    dnd().then((m) => {
      if (!destroyed) cleanup = setup(m)
    })
    cleanups.set(el, () => {
      destroyed = true
      cleanup?.()
    })
  }

  const vCard: Directive<HTMLElement, CardBinding> = {
    mounted(el, binding) {
      cardData.set(el, binding.value)
      register(el, (m) =>
        m.combine(
          m.draggable({
            element: el,
            getInitialData: () => ({ kind: 'card', ...cardData.get(el)! }),
            onGenerateDragPreview: ({ nativeSetDragImage, location, source }) => {
              const rect = source.element.getBoundingClientRect()
              m.setCustomNativeDragPreview({
                nativeSetDragImage,
                getOffset: m.preserveOffsetOnSource({
                  element: source.element,
                  input: location.current.input,
                }),
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
              draggingHeight.value = el.offsetHeight
            },
            onDrop: () => {
              draggingTaskId.value = null
              draggingHeight.value = 0
            },
          }),
          m.dropTargetForElements({
            element: el,
            canDrop: ({ source }) => source.data.kind === 'card',
            getIsSticky: () => true,
            getData: ({ input, element }) =>
              m.attachClosestEdge(
                { kind: 'card', ...cardData.get(el)! },
                { input, element, allowedEdges: ['top', 'bottom'] },
              ),
            onDrag: ({ self, source }) => {
              const { taskId } = cardData.get(el)!
              if (source.data.taskId === taskId) {
                dropEdge.value = null
                return
              }
              dropEdge.value = { taskId, edge: m.extractClosestEdge(self.data) }
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
      register(el, (m) =>
        m.dropTargetForElements({
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
      register(el, (m) =>
        m.autoScrollForElements({
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
    let cleanup: Cleanup | null = null
    let stopped = false
    dnd().then((m) => {
      if (stopped) return
      cleanup = m.monitorForElements({
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
              edge: m.extractClosestEdge(data),
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
    })
    onUnmounted(() => {
      stopped = true
      cleanup?.()
    })
  })

  return { draggingTaskId, draggingHeight, dropEdge, dropColumnId, vCard, vColumn, vBoard }
}
