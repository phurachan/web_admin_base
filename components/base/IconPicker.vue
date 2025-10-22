<template>
  <div class="form-control">
    <label v-if="label" class="label">
      <span class="label-text">{{ label }}</span>
    </label>

    <!-- Selected Icon Display -->
    <div class="relative">
      <button
        type="button"
        class="btn btn-outline w-full justify-start gap-2"
        @click="showModal = true"
      >
        <BaseIcon v-if="modelValue" :name="modelValue" size="md" />
        <span v-if="!modelValue" class="text-base-content/50">{{ placeholder }}</span>
        <span v-else>{{ modelValue }}</span>
        <BaseIcon name="chevron-down" size="sm" class="ml-auto" />
      </button>
    </div>

    <!-- Icon Picker Modal -->
    <div v-if="showModal" class="modal modal-open">
      <div class="modal-box max-w-4xl bg-base-200">
        <h3 class="font-bold text-lg mb-4">Select Icon</h3>

        <!-- Search -->
        <BaseInput
          v-model="searchQuery"
          type="text"
          placeholder="Search icons..."
          class="mb-4"
        />

        <!-- Icon Grid -->
        <div class="max-h-96 overflow-y-auto">
          <div class="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            <button
              v-for="iconName in filteredIcons"
              :key="iconName"
              type="button"
              class="btn btn-square btn-sm hover:btn-primary"
              :class="{ 'btn-primary': modelValue === iconName }"
              @click="selectIcon(iconName)"
              :title="iconName"
            >
              <BaseIcon :name="iconName" size="sm" />
            </button>
          </div>

          <div v-if="filteredIcons.length === 0" class="text-center py-8 text-base-content/50">
            No icons found
          </div>
        </div>

        <div class="modal-action">
          <BaseButton @click="clearIcon" variant="ghost">Clear</BaseButton>
          <BaseButton @click="showModal = false" variant="primary">Done</BaseButton>
        </div>
      </div>
      <div class="modal-backdrop" @click="showModal = false"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Common HeroIcons list - most frequently used icons
const commonIcons = [
  'home', 'user', 'users', 'cog', 'cog-6-tooth', 'bell', 'envelope',
  'phone', 'map-pin', 'calendar', 'clock', 'chart-bar', 'chart-pie',
  'document', 'document-text', 'folder', 'folder-open', 'archive-box',
  'clipboard', 'clipboard-document', 'clipboard-document-list',
  'pencil', 'pencil-square', 'trash', 'plus', 'minus', 'x-mark',
  'check', 'check-circle', 'x-circle', 'exclamation-triangle',
  'exclamation-circle', 'information-circle', 'question-mark-circle',
  'arrow-right', 'arrow-left', 'arrow-up', 'arrow-down',
  'chevron-right', 'chevron-left', 'chevron-up', 'chevron-down',
  'magnifying-glass', 'funnel', 'adjustments-horizontal',
  'squares-2x2', 'squares-plus', 'view-columns', 'list-bullet',
  'table-cells', 'chart-bar-square', 'presentation-chart-bar',
  'currency-dollar', 'banknotes', 'credit-card', 'shopping-cart',
  'shopping-bag', 'gift', 'ticket', 'tag', 'bookmark',
  'heart', 'star', 'flag', 'fire', 'light-bulb', 'sun', 'moon',
  'cloud', 'bolt', 'shield-check', 'shield-exclamation', 'lock-closed',
  'lock-open', 'key', 'finger-print', 'eye', 'eye-slash',
  'camera', 'photo', 'video-camera', 'microphone', 'speaker-wave',
  'musical-note', 'play', 'pause', 'stop', 'backward', 'forward',
  'arrow-path', 'arrow-up-tray', 'arrow-down-tray', 'share',
  'link', 'paper-clip', 'at-symbol', 'hashtag', 'globe-alt',
  'wifi', 'signal', 'device-phone-mobile', 'computer-desktop',
  'server', 'cube', 'cube-transparent', 'command-line',
  'code-bracket', 'bug-ant', 'wrench', 'wrench-screwdriver',
  'beaker', 'academic-cap', 'book-open', 'newspaper',
  'building-office', 'building-storefront', 'home-modern',
  'map', 'globe-asia-australia', 'truck', 'rocket-launch'
]

interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: 'Select an icon'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showModal = ref(false)
const searchQuery = ref('')

const filteredIcons = computed(() => {
  if (!searchQuery.value) {
    return commonIcons
  }

  const query = searchQuery.value.toLowerCase()
  return commonIcons.filter(icon => icon.toLowerCase().includes(query))
})

const selectIcon = (iconName: string) => {
  emit('update:modelValue', iconName)
  showModal.value = false
}

const clearIcon = () => {
  emit('update:modelValue', '')
  showModal.value = false
}
</script>
