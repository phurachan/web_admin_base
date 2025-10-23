<template>
  <div class="form-control w-full">
    <label v-if="label" class="label">
      <span class="label-text">
        {{ label }}
        <span v-if="required" class="text-error ml-1">*</span>
      </span>
    </label>

    <div class="flex items-center gap-3">
      <div class="relative">
        <input
          type="color"
          :value="modelValue"
          @input="handleColorChange"
          :disabled="disabled"
          class="w-16 h-10 rounded-lg cursor-pointer border-2 border-base-300 disabled:cursor-not-allowed disabled:opacity-50"
          :class="inputClass"
        />
      </div>

      <input
        type="text"
        :value="modelValue"
        @input="handleTextInput"
        :placeholder="placeholder || '#000000'"
        :disabled="disabled"
        :maxlength="7"
        class="input input-bordered flex-1"
        :class="[
          sizeClass,
          variantClass,
          { 'input-error': error }
        ]"
      />

      <button
        v-if="showPreview"
        type="button"
        class="btn btn-square"
        :class="sizeClass"
        :style="{ backgroundColor: modelValue || '#000000' }"
        disabled
      />
    </div>

    <label v-if="error" class="label">
      <span class="label-text-alt text-error">{{ error }}</span>
    </label>

    <label v-else-if="hint" class="label">
      <span class="label-text-alt">{{ hint }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import type { BaseColorPickerProps } from '~/composables/component_models/form'

const props = withDefaults(defineProps<BaseColorPickerProps>(), {
  modelValue: '#000000',
  variant: 'primary',
  size: 'md',
  showPreview: true,
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const sizeClass = computed(() => {
  const sizes = {
    xs: 'input-xs',
    sm: 'input-sm',
    md: 'input-md',
    lg: 'input-lg'
  }
  return sizes[props.size]
})

const variantClass = computed(() => {
  if (props.variant === 'ghost') return ''
  const variants = {
    primary: 'input-primary',
    secondary: 'input-secondary',
    accent: 'input-accent',
    success: 'input-success',
    warning: 'input-warning',
    error: 'input-error',
    info: 'input-info'
  }
  return variants[props.variant] || ''
})

const inputClass = computed(() => {
  return props.disabled ? 'opacity-50 cursor-not-allowed' : ''
})

const isValidHex = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color)
}

const handleColorChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  if (isValidHex(value)) {
    emit('update:modelValue', value)
    emit('change', value)
  }
}

const handleTextInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.trim()

  if (!value.startsWith('#')) {
    value = '#' + value
  }

  value = value.toUpperCase()

  if (value.length <= 7) {
    emit('update:modelValue', value)

    if (isValidHex(value)) {
      emit('change', value)
    }
  }
}
</script>
