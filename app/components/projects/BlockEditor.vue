<template>
  <div class="block-editor-root relative" @click.self="handleRootClick">
    <div v-for="(block, index) in blocks" :key="block.id" class="flex items-start py-0.5">
      <!-- Bullet dot -->
      <span
        v-if="block.type === 'bullet'"
        class="flex-shrink-0 mt-[9px] mr-2 w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"
      />

      <!-- Code block -->
      <textarea
        v-if="block.type === 'code'"
        :ref="(el) => setBlockRef(el as HTMLElement | null, index)"
        class="flex-1 font-mono text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-3 resize-none outline-none border border-gray-200 dark:border-gray-700 min-h-[72px]"
        rows="3"
        @input="onCodeInput(index, $event)"
        @keydown="onKeydown(index, $event)"
      />

      <!-- All other blocks -->
      <div
        v-else
        :ref="(el) => setBlockRef(el as HTMLElement | null, index)"
        contenteditable="true"
        :data-ph="getPlaceholder(block, index)"
        :class="[
          'flex-1 outline-none min-h-[1.5em] break-words',
          block.type === 'h1' && 'text-2xl font-bold text-gray-900 dark:text-gray-100 py-1',
          block.type === 'h2' && 'text-xl font-semibold text-gray-900 dark:text-gray-100 py-0.5',
          block.type === 'h3' && 'text-base font-semibold text-gray-800 dark:text-gray-200',
          (block.type === 'text' || block.type === 'bullet' || block.type === 'todo') &&
            'text-sm text-gray-700 dark:text-gray-300 leading-relaxed',
        ]"
        spellcheck="false"
        @input="onInput(index, $event)"
        @keydown="onKeydown(index, $event)"
        @paste.prevent="onPaste(index, $event)"
      />
    </div>

    <!-- Click area to focus last block -->
    <div class="min-h-[40px] cursor-text" @click="handleRootClick" />

    <!-- Slash command menu -->
    <Teleport to="body">
      <div
        v-if="slashMenu.visible"
        class="fixed z-[300] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl py-1.5 w-56"
        :style="{ top: slashMenu.y + 'px', left: slashMenu.x + 'px' }"
      >
        <div class="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Тип блока</div>
        <button
          v-for="(cmd, ci) in COMMANDS"
          :key="cmd.type"
          :class="[
            'flex items-center gap-3 w-full px-3 py-2 text-left transition-colors',
            ci === slashMenu.sel
              ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-200'
              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50',
          ]"
          @mousedown.prevent="applyCmd(cmd.type)"
        >
          <span class="text-sm leading-none w-5 text-center font-mono font-bold">{{ cmd.icon }}</span>
          <div>
            <div class="text-sm font-medium leading-tight">{{ cmd.label }}</div>
            <div class="text-xs text-gray-400 leading-tight">{{ cmd.hint }}</div>
          </div>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
type BlockType = 'text' | 'h1' | 'h2' | 'h3' | 'bullet' | 'todo' | 'code'

interface Block {
  id: string
  type: BlockType
  content: string
  checked?: boolean
}

const COMMANDS: { type: BlockType; icon: string; label: string; hint: string }[] = [
  { type: 'text', icon: '¶', label: 'Текст', hint: 'Обычный абзац' },
  { type: 'h1', icon: 'H1', label: 'Заголовок 1', hint: 'Крупный заголовок' },
  { type: 'h2', icon: 'H2', label: 'Заголовок 2', hint: 'Средний заголовок' },
  { type: 'h3', icon: 'H3', label: 'Заголовок 3', hint: 'Маленький заголовок' },
  { type: 'bullet', icon: '•', label: 'Список', hint: 'Маркированный список' },
  { type: 'code', icon: '</>', label: 'Код', hint: 'Блок кода' },
]

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function parseBlocks(value: string): Block[] {
  if (!value?.trim()) return [{ id: uid(), type: 'text', content: '' }]
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.type) return parsed
  } catch {}
  return [{ id: uid(), type: 'text', content: value }]
}

function serializeBlocks(b: Block[]): string {
  if (b.length === 1 && b[0]?.type === 'text' && !b[0]?.content.trim()) return ''
  return JSON.stringify(b)
}

const blocks = ref<Block[]>(parseBlocks(props.modelValue))
const blockRefs = ref<(HTMLElement | null)[]>([])
const slashMenu = ref({ visible: false, x: 0, y: 0, sel: 0, blockIndex: -1 })

// WeakMap ensures each DOM element's content is set only once on initial mount
const initialized = new WeakMap<HTMLElement, true>()

function setBlockRef(el: HTMLElement | null, index: number) {
  blockRefs.value[index] = el
  if (!el) return

  if (initialized.has(el)) return
  initialized.set(el, true)

  const content = blocks.value[index]?.content ?? ''
  if (el.tagName === 'TEXTAREA') {
    (el as HTMLTextAreaElement).value = content
  } else if (el.contentEditable === 'true') {
    el.textContent = content
  }
}

function emitUpdate() {
  emit('update:modelValue', serializeBlocks(blocks.value))
}

function onInput(index: number, event: Event) {
  const el = event.target as HTMLElement
  const text = el.textContent ?? ''

  if (text === '/') {
    const rect = el.getBoundingClientRect()
    const menuWidth = 224  // w-56
    const menuHeight = COMMANDS.length * 44 + 28
    const x = rect.left + menuWidth > window.innerWidth - 8
      ? window.innerWidth - menuWidth - 8
      : rect.left
    const y = rect.bottom + 4 + menuHeight > window.innerHeight - 8
      ? rect.top - menuHeight - 4
      : rect.bottom + 4
    slashMenu.value = { visible: true, x, y, sel: 0, blockIndex: index }
  } else {
    slashMenu.value.visible = false
  }

  const block = blocks.value[index]
  if (block) block.content = text
  emitUpdate()
}

function onCodeInput(index: number, event: Event) {
  const block = blocks.value[index]
  if (block) block.content = (event.target as HTMLTextAreaElement).value
  emitUpdate()
}

function onKeydown(index: number, event: KeyboardEvent) {
  const block = blocks.value[index]
  if (!block) return

  if (slashMenu.value.visible) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      slashMenu.value.sel = (slashMenu.value.sel + 1) % COMMANDS.length
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      slashMenu.value.sel = (slashMenu.value.sel - 1 + COMMANDS.length) % COMMANDS.length
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      applyCmd(COMMANDS[slashMenu.value.sel]!.type)
      return
    }
    if (event.key === 'Escape') {
      slashMenu.value.visible = false
      return
    }
  }

  if (event.key === 'Enter' && block.type !== 'code') {
    event.preventDefault()
    const el = blockRefs.value[index]
    const isEmpty = !el?.textContent?.trim()
    // Empty bullet -> break out of list, create plain text block and remove this empty one
    if (isEmpty && block.type === 'bullet') {
      blocks.value.splice(index, 1, { id: uid(), type: 'text', content: '' })
      emitUpdate()
      nextTick(() => focusBlock(index, 'start'))
      return
    }
    const next: BlockType = block.type === 'bullet' ? 'bullet' : 'text'
    addBlockAfter(index, next)
    return
  }

  if (event.key === 'Backspace') {
    const el = blockRefs.value[index]
    const isEmpty =
      block.type === 'code'
        ? !(el as HTMLTextAreaElement)?.value?.trim()
        : !el?.textContent?.trim()

    if (isEmpty && blocks.value.length > 1) {
      event.preventDefault()
      const prevIndex = Math.max(0, index - 1)
      blocks.value.splice(index, 1)
      emitUpdate()
      nextTick(() => focusBlock(prevIndex, 'end'))
      return
    }
  }

  if (!slashMenu.value.visible) {
    if (event.key === 'ArrowUp' && index > 0) {
      event.preventDefault()
      focusBlock(index - 1, 'end')
    }
    if (event.key === 'ArrowDown' && index < blocks.value.length - 1) {
      event.preventDefault()
      focusBlock(index + 1, 'start')
    }
  }
}

function onPaste(index: number, event: ClipboardEvent) {
  const text = event.clipboardData?.getData('text/plain') ?? ''
  const sel = window.getSelection()
  if (!sel?.rangeCount) return
  sel.deleteFromDocument()
  sel.getRangeAt(0).insertNode(document.createTextNode(text))
  sel.collapseToEnd()
  const el = blockRefs.value[index]
  const block = blocks.value[index]
  if (block) block.content = el?.textContent ?? ''
  emitUpdate()
}

async function addBlockAfter(index: number, type: BlockType = 'text') {
  blocks.value.splice(index + 1, 0, { id: uid(), type, content: '' })
  emitUpdate()
  await nextTick()
  focusBlock(index + 1, 'start')
}

function focusBlock(index: number, position: 'start' | 'end' = 'end') {
  const el = blockRefs.value[index]
  if (!el) return
  el.focus()
  if (el.contentEditable === 'true') {
    position === 'end' ? moveCursorToEnd(el) : moveCursorToStart(el)
  }
}

function moveCursorToEnd(el: HTMLElement) {
  const range = document.createRange()
  const sel = window.getSelection()
  range.selectNodeContents(el)
  range.collapse(false)
  sel?.removeAllRanges()
  sel?.addRange(range)
}

function moveCursorToStart(el: HTMLElement) {
  const range = document.createRange()
  const sel = window.getSelection()
  range.setStart(el, 0)
  range.collapse(true)
  sel?.removeAllRanges()
  sel?.addRange(range)
}

function applyCmd(type: BlockType) {
  const index = slashMenu.value.blockIndex
  slashMenu.value.visible = false
  if (index < 0) return

  const block = blocks.value[index]
  if (!block) return
  block.type = type
  block.content = ''

  const el = blockRefs.value[index]
  if (el && el.contentEditable === 'true') {
    el.textContent = ''
    nextTick(() => el.focus())
  }
  emitUpdate()
}

function handleRootClick() {
  const last = blocks.value.length - 1
  if (last < 0) {
    blocks.value.push({ id: uid(), type: 'text', content: '' })
    nextTick(() => focusBlock(0, 'end'))
  } else {
    focusBlock(last, 'end')
  }
}

function getPlaceholder(block: Block, index: number): string {
  if (block.type === 'h1') return 'Заголовок 1'
  if (block.type === 'h2') return 'Заголовок 2'
  if (block.type === 'h3') return 'Заголовок 3'
  if (block.type === 'bullet') return 'Пункт списка'
  if (index === 0) return "Напишите что-нибудь или введите '/' для выбора типа блока…"
  return ''
}

function onDocumentClick() {
  if (slashMenu.value.visible) slashMenu.value.visible = false
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))

defineExpose({
  focusLastBlock: handleRootClick,
})
</script>

<style scoped>
[contenteditable]:empty::before {
  content: attr(data-ph);
  color: #9ca3af;
  pointer-events: none;
}

.dark [contenteditable]:empty::before {
  color: #4b5563;
}
</style>
