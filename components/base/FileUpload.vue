<template>
  <div class="form-control w-full">
    <label v-if="label" class="label">
      <span class="label-text">
        {{ label }}
        <span v-if="required" class="text-error ml-1">*</span>
      </span>
    </label>

    <div v-if="fileList.length > 0" class="mb-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          v-for="(file, index) in fileList"
          :key="index"
          class="relative group"
        >
          <div class="card bg-base-200 shadow-sm">
            <figure class="h-32 bg-base-300">
              <img
                v-if="isImageFile(file)"
                :src="file"
                :alt="`File ${index + 1}`"
                class="w-full h-full object-cover"
              />
              <div v-else class="flex items-center justify-center h-full">
                <BaseIcon :name="getFileIcon(file)" size="2xl" class="text-base-content opacity-50" />
              </div>
            </figure>
            <div class="card-body p-2">
              <p class="text-xs truncate" :title="getFileName(file)">
                {{ getFileName(file) }}
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="removeFile(index)"
            class="btn btn-circle btn-error btn-xs absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            :disabled="uploading"
          >
            <BaseIcon name="x-mark" size="xs" />
          </button>
        </div>
      </div>
    </div>

    <button
      type="button"
      @click="triggerFileInput"
      :disabled="disabled || uploading || (maxFiles && fileList.length >= maxFiles)"
      class="btn btn-outline w-full"
      :class="[
        sizeClass,
        variantClass,
        { 'btn-disabled': disabled || uploading || (maxFiles && fileList.length >= maxFiles) }
      ]"
    >
      <BaseIcon v-if="!uploading" name="arrow-up-tray" :size="iconSize" />
      <span v-if="uploading" class="loading loading-spinner" :class="iconSize"></span>
      <span v-if="uploading">กำลังอัปโหลด... {{ uploadProgress }}%</span>
      <span v-else>{{ buttonText || 'เลือกไฟล์' }}</span>
    </button>

    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      @change="handleFileChange"
      class="hidden"
      :disabled="disabled"
    />

    <label v-if="error" class="label">
      <span class="label-text-alt text-error">{{ error }}</span>
    </label>

    <label v-else-if="hint" class="label">
      <span class="label-text-alt">{{ hint }}</span>
    </label>

    <label v-if="maxFiles" class="label">
      <span class="label-text-alt">
        ไฟล์ที่เลือก: {{ fileList.length }} / {{ maxFiles }}
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
import type { BaseFileUploadProps } from '~/composables/component_models/form'

const props = withDefaults(defineProps<BaseFileUploadProps>(), {
  modelValue: () => [],
  variant: 'primary',
  size: 'md',
  accept: 'image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  maxSize: 5 * 1024 * 1024,
  multiple: true,
  disabled: false,
  required: false,
  uploadEndpoint: '/upload'
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'upload-success': [files: string[]]
  'upload-error': [error: any]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const fileList = ref<string[]>([...props.modelValue])
const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')

watch(() => props.modelValue, (newValue) => {
  if (JSON.stringify(newValue) !== JSON.stringify(fileList.value)) {
    fileList.value = [...newValue]
  }
}, { deep: true })

const sizeClass = computed(() => {
  const sizes = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg'
  }
  return sizes[props.size]
})

const iconSize = computed(() => {
  const sizes = {
    xs: 'xs',
    sm: 'sm',
    md: 'md',
    lg: 'lg'
  }
  return sizes[props.size]
})

const variantClass = computed(() => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    success: 'btn-success',
    warning: 'btn-warning',
    error: 'btn-error',
    info: 'btn-info',
    ghost: 'btn-ghost'
  }
  return variants[props.variant] || ''
})

const triggerFileInput = () => {
  if (!uploading.value && fileInput.value) {
    fileInput.value.click()
  }
}

const isImageFile = (path: string): boolean => {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(path)
}

const getFileIcon = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase()
  const iconMap: Record<string, string> = {
    pdf: 'document-text',
    csv: 'table-cells',
    xls: 'table-cells',
    xlsx: 'table-cells',
    doc: 'document',
    docx: 'document'
  }
  return iconMap[ext || ''] || 'document'
}

const getFileName = (path: string): string => {
  return path.split('/').pop() || path
}

const validateFile = (file: File): boolean => {
  error.value = ''

  if (file.size > props.maxSize) {
    error.value = `ขนาดไฟล์ต้องไม่เกิน ${props.maxSize / (1024 * 1024)}MB`
    return false
  }

  if (props.accept) {
    const allowedTypes = props.accept.split(',').map(t => t.trim())
    if (!allowedTypes.includes(file.type)) {
      error.value = 'ประเภทไฟล์ไม่รองรับ'
      return false
    }
  }

  if (props.maxFiles && fileList.value.length >= props.maxFiles) {
    error.value = `สามารถอัปโหลดได้สูงสุด ${props.maxFiles} ไฟล์`
    return false
  }

  return true
}

const uploadFiles = async (files: File[]) => {
  const validFiles = files.filter(validateFile)

  if (validFiles.length === 0) return

  uploading.value = true
  uploadProgress.value = 0
  error.value = ''

  try {
    const formData = new FormData()
    validFiles.forEach(file => {
      formData.append('files', file)
    })

    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 200)

    const { post } = useApi()
    const response = await post(props.uploadEndpoint, formData)

    clearInterval(progressInterval)
    uploadProgress.value = 100

    if (response?.data?.files && Array.isArray(response.data.files)) {
      const newFiles = [...fileList.value, ...response.data.files]
      fileList.value = newFiles
      emit('update:modelValue', newFiles)
      emit('upload-success', newFiles)
    } else {
      throw new Error('Invalid response from server')
    }
  } catch (err: any) {
    console.error('Upload error:', err)
    error.value = err?.message || 'ไม่สามารถอัปโหลดไฟล์ได้'
    emit('upload-error', err)
  } finally {
    uploading.value = false
    uploadProgress.value = 0
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])

  if (files.length > 0) {
    uploadFiles(files)
  }
}

const removeFile = (index: number) => {
  const newFiles = fileList.value.filter((_, i) => i !== index)
  fileList.value = newFiles
  emit('update:modelValue', newFiles)
}
</script>
