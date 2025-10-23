<template>
  <div>
    <div class="container mx-auto px-4 py-2 min-h-screen">
      <!-- Page Header -->
      <BasePageHeader
        title="จัดการระบบย่อย1"
        code="FEATURE-001"
        description="จัดการระบบย่อย1 ทั้งหมดของระบบ รวมถึงประกาศ โปรโมชั่น กิจกรรม และข่าวสาร"
        :breadcrumbs="[
          { label: 'จัดการข้อมูล', to: '/manages' },
          { label: 'จัดการระบบย่อย1' }
        ]"
      >
        <template #actions>
          <BaseButton @click="openCreateModal" variant="primary" icon-left="plus">
            เพิ่ม Feature
          </BaseButton>
        </template>
      </BasePageHeader>

      <!-- Search and Filter -->
      <div class="card bg-base-100 shadow-sm mb-6">
        <div class="card-body p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BaseInput
              v-model="search"
              type="text"
              placeholder="ค้นหา Feature..."
              @input="handleSearch"
            />
            <BaseSelect
              v-model="typeFilter"
              :options="typeOptions"
              @update:model-value="handleSearch"
            />
            <BaseSelect
              v-model="statusFilter"
              :options="statusOptions"
              @update:model-value="handleSearch"
            />
          </div>
        </div>
      </div>

      <!-- Features Table -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <BaseDataTable
            :fields="tableFields"
            :data="features"
            :loading="loading"
            row-key="_id"
            striped
            hover
          >
            <template #cell(code)="{ row }">
              <div class="font-mono font-semibold text-primary">
                {{ row.code }}
              </div>
            </template>

            <template #cell(title)="{ row }">
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 rounded flex items-center justify-center"
                  :style="{ backgroundColor: row.color + '20' }"
                >
                  <BaseIcon :name="row.icon" size="sm" :style="{ color: row.color }" />
                </div>
                <div>
                  <div class="font-medium">{{ row.title }}</div>
                  <div class="text-xs text-base-content opacity-60 line-clamp-1">
                    {{ row.description }}
                  </div>
                </div>
              </div>
            </template>

            <template #cell(type)="{ row }">
              <div class="badge badge-outline whitespace-nowrap">
                {{ getTypeLabel(row.type) }}
              </div>
            </template>

            <template #cell(displayMode)="{ row }">
              <div class="text-sm">
                {{ getDisplayModeLabel(row.displayMode) }}
              </div>
            </template>

            <template #cell(period)="{ row }">
              <div class="text-sm">
                <div>{{ formatDate(row.startDate) }}</div>
                <div class="text-xs opacity-60">ถึง {{ formatDate(row.endDate) }}</div>
              </div>
            </template>

            <template #cell(images)="{ row }">
              <button
                v-if="row.images && row.images.length > 0"
                @click="showImagePreview(row.images)"
                class="badge badge-ghost whitespace-nowrap hover:badge-primary cursor-pointer transition-colors"
              >
                {{ row.images.length }} รูป
              </button>
              <div v-else class="badge badge-ghost whitespace-nowrap">
                0 รูป
              </div>
            </template>

            <template #cell(isActive)="{ row }">
              <div class="badge whitespace-nowrap" :class="row.isActive ? 'badge-success' : 'badge-error'">
                {{ row.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
              </div>
            </template>

            <template #cell(actions)="{ row }">
              <div class="flex gap-1">
                <BaseButton
                  @click="openEditModal(row)"
                  variant="ghost"
                  size="sm"
                  icon-left="pencil"
                  title="แก้ไข"
                />
                <BaseButton
                  @click="confirmDelete(row)"
                  variant="ghost"
                  size="sm"
                  icon-left="trash"
                  title="ลบ"
                  class="text-error hover:text-error"
                />
              </div>
            </template>
          </BaseDataTable>

          <BasePagination
            v-if="pagination"
            :current-page="pagination.page"
            :total-items="pagination.total"
            :per-page="pagination.limit"
            @update:current-page="handlePageChange"
          />
        </div>
      </div>

      <!-- Image Preview Modal -->
      <BaseModal v-model:visible="showImageModal" title="ดูรูปภาพ" size="5xl">
        <div v-if="previewImages.length > 0" class="space-y-4">
          <!-- Main Image -->
          <div class="relative bg-base-200 rounded-lg overflow-hidden flex items-center justify-center" style="width: 100%; height: 75vh;">
            <img
              :src="previewImages[currentImageIndex]"
              :alt="`รูปภาพที่ ${currentImageIndex + 1}`"
              class="max-w-full max-h-full object-contain"
            />

            <!-- Navigation Arrows -->
            <button
              v-if="previewImages.length > 1 && currentImageIndex > 0"
              @click="prevImage"
              class="btn btn-circle btn-sm absolute left-2 top-1/2 -translate-y-1/2"
            >
              <BaseIcon name="chevron-left" size="sm" />
            </button>
            <button
              v-if="previewImages.length > 1 && currentImageIndex < previewImages.length - 1"
              @click="nextImage"
              class="btn btn-circle btn-sm absolute right-2 top-1/2 -translate-y-1/2"
            >
              <BaseIcon name="chevron-right" size="sm" />
            </button>

            <!-- Image Counter -->
            <div class="absolute bottom-2 left-1/2 -translate-x-1/2 badge badge-neutral">
              {{ currentImageIndex + 1 }} / {{ previewImages.length }}
            </div>
          </div>

          <!-- Thumbnail Gallery -->
          <div v-if="previewImages.length > 1" class="grid grid-cols-6 gap-2">
            <button
              v-for="(image, index) in previewImages"
              :key="index"
              @click="goToImage(index)"
              class="relative aspect-square rounded-lg overflow-hidden border-2 transition-all"
              :class="currentImageIndex === index ? 'border-primary ring-2 ring-primary' : 'border-base-300 hover:border-primary'"
            >
              <img
                :src="image"
                :alt="`ภาพย่อที่ ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        <template #actions>
          <div class="flex justify-end">
            <BaseButton @click="closeImagePreview" variant="ghost">
              ปิด
            </BaseButton>
          </div>
        </template>
      </BaseModal>

      <!-- Create/Edit Modal -->
      <BaseModal v-model:visible="showModal" :title="isEditing ? 'แก้ไข Feature' : 'เพิ่ม Feature'" size="xl">
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseInput
              v-model="form.title"
              label="ชื่อ Feature"
              placeholder="กรอกชื่อ Feature"
              required
              :error="formErrors.title"
            />

            <BaseSelect
              v-model="form.type"
              label="ประเภท"
              :options="typeOptions.filter(o => o.value)"
              required
              :error="formErrors.type"
            />
          </div>

          <BaseTextarea
            v-model="form.description"
            label="รายละเอียด"
            placeholder="กรอกรายละเอียด Feature"
            :rows="3"
            required
            :error="formErrors.description"
          />

          <div>
            <label class="label">
              <span class="label-text">โหมดการแสดงผล <span class="text-error">*</span></span>
            </label>
            <div class="space-y-2">
              <BaseRadio
                v-for="mode in displayModeOptions"
                :key="mode.value"
                v-model="form.displayMode"
                :name="'displayMode'"
                :value="mode.value"
                :label="mode.label"
              />
            </div>
            <label v-if="formErrors.displayMode" class="label">
              <span class="label-text-alt text-error">{{ formErrors.displayMode }}</span>
            </label>
          </div>

          <BaseIconPicker
            v-model="form.icon"
            label="ไอคอน"
            required
            :error="formErrors.icon"
          />

          <BaseColorPicker
            v-model="form.color"
            label="สี"
            required
            :show-preview="false"
            :error="formErrors.color"
          />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseDatePicker
              v-model="form.startDate"
              label="วันที่เริ่มต้น"
              type="date"
              required
              :error="formErrors.startDate"
            />

            <BaseDatePicker
              v-model="form.endDate"
              label="วันที่สิ้นสุด"
              type="date"
              required
              :error="formErrors.endDate"
            />
          </div>

          <BaseFileUpload
            v-model="form.images"
            label="รูปภาพ"
            :max-files="5"
            hint="อัปโหลดได้สูงสุด 5 ไฟล์ ขนาดไม่เกิน 5MB ต่อไฟล์"
          />

          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-3">
              <BaseCheckbox v-model="form.isActive" />
              <span class="label-text">เปิดใช้งาน</span>
            </label>
          </div>
        </div>

        <template #actions>
          <div class="flex justify-end">
            <BaseButton @click="closeModal" variant="ghost">
              ยกเลิก
            </BaseButton>
            <BaseButton @click="handleSubmit" variant="primary" :loading="saving">
              {{ isEditing ? 'บันทึก' : 'เพิ่ม' }}
            </BaseButton>
          </div>
        </template>
      </BaseModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFeature1Store } from '~/stores/feature1'
import { FEATURE1_TYPES, FEATURE1_DISPLAY_MODES } from '~/composables/data_models/feature1'
import type { Feature1, Feature1CreateRequest, Feature1UpdateRequest } from '~/composables/data_models/feature1'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

useHead({
  title: 'จัดการ Feature 1 - Admin Panel'
})

const feature1Store = useFeature1Store()
const { dateToThai } = useFormatDate()

const search = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const showImageModal = ref(false)
const previewImages = ref<string[]>([])
const currentImageIndex = ref(0)

const form = reactive<Feature1CreateRequest & { id?: string }>({
  title: '',
  description: '',
  displayMode: 'show_title_desc',
  icon: 'star',
  color: '#3B82F6',
  type: 'announcement',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  images: [],
  isActive: true
})

const formErrors = reactive({
  title: '',
  description: '',
  displayMode: '',
  icon: '',
  color: '',
  type: '',
  startDate: '',
  endDate: ''
})

const loading = computed(() => feature1Store.isLoading)
const features = computed(() => feature1Store.items || [])
const pagination = computed(() => feature1Store.pagination)

const typeOptions = computed(() => [
  { label: 'ประเภททั้งหมด', value: '' },
  ...FEATURE1_TYPES.map(t => ({ label: t.label, value: t.value }))
])

const statusOptions = ref([
  { label: 'สถานะทั้งหมด', value: '' },
  { label: 'เปิดใช้งาน', value: 'true' },
  { label: 'ปิดใช้งาน', value: 'false' }
])

const displayModeOptions = FEATURE1_DISPLAY_MODES

const tableFields = [
  { key: 'code', label: 'รหัส', sortable: true, width: '100px' },
  { key: 'title', label: 'ชื่อ & รายละเอียด', sortable: true },
  { key: 'type', label: 'ประเภท', width: '120px' },
  { key: 'displayMode', label: 'โหมดแสดงผล', width: '150px' },
  { key: 'period', label: 'ระยะเวลา', width: '150px' },
  { key: 'images', label: 'รูปภาพ', width: '80px' },
  { key: 'isActive', label: 'สถานะ', width: '100px' },
  { key: 'actions', label: 'จัดการ', width: '120px' }
]

const getTypeLabel = (type: string) => {
  return FEATURE1_TYPES.find(t => t.value === type)?.label || type
}

const getDisplayModeLabel = (mode: string) => {
  return FEATURE1_DISPLAY_MODES.find(m => m.value === mode)?.label || mode
}

const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return dateToThai(date, { format: 'short' })
}

const showImagePreview = (images: string[]) => {
  previewImages.value = images
  currentImageIndex.value = 0
  showImageModal.value = true
}

const closeImagePreview = () => {
  showImageModal.value = false
  previewImages.value = []
  currentImageIndex.value = 0
}

const nextImage = () => {
  if (currentImageIndex.value < previewImages.value.length - 1) {
    currentImageIndex.value++
  }
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

const goToImage = (index: number) => {
  currentImageIndex.value = index
}

const fetchFeatures = async () => {
  const query: any = {
    pagination: {
      page: pagination.value?.page || 1,
      limit: pagination.value?.limit || 10
    }
  }

  if (search.value) {
    query.search = search.value
  }

  if (typeFilter.value) {
    query.filter = { ...query.filter, type: typeFilter.value }
  }

  if (statusFilter.value !== '') {
    query.filter = { ...query.filter, isActive: statusFilter.value }
  }

  await feature1Store.fetchFeature1({ query })
}

const handleSearch = debounce(() => {
  fetchFeatures()
}, 500)

const handlePageChange = (page: number) => {
  if (pagination.value) {
    pagination.value.page = page
    fetchFeatures()
  }
}

const openCreateModal = () => {
  resetForm()
  isEditing.value = false
  editingId.value = null
  showModal.value = true
}

const openEditModal = (feature: Feature1) => {
  resetForm()
  isEditing.value = true
  editingId.value = feature._id

  form.title = feature.title
  form.description = feature.description
  form.displayMode = feature.displayMode
  form.icon = feature.icon
  form.color = feature.color
  form.type = feature.type
  form.startDate = feature.startDate
  form.endDate = feature.endDate
  form.images = [...(feature.images || [])]
  form.isActive = feature.isActive

  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  form.title = ''
  form.description = ''
  form.displayMode = 'show_title_desc'
  form.icon = 'star'
  form.color = '#3B82F6'
  form.type = 'announcement'
  form.startDate = new Date().toISOString().split('T')[0]
  form.endDate = new Date().toISOString().split('T')[0]
  form.images = []
  form.isActive = true

  Object.keys(formErrors).forEach(key => {
    formErrors[key as keyof typeof formErrors] = ''
  })
}

const validateForm = (): boolean => {
  let isValid = true

  Object.keys(formErrors).forEach(key => {
    formErrors[key as keyof typeof formErrors] = ''
  })

  if (!form.title.trim()) {
    formErrors.title = 'กรุณากรอกชื่อ Feature'
    isValid = false
  }

  if (!form.description.trim()) {
    formErrors.description = 'กรุณากรอกรายละเอียด'
    isValid = false
  }

  if (!form.displayMode) {
    formErrors.displayMode = 'กรุณาเลือกโหมดการแสดงผล'
    isValid = false
  }

  if (!form.icon) {
    formErrors.icon = 'กรุณาเลือกไอคอน'
    isValid = false
  }

  if (!form.color) {
    formErrors.color = 'กรุณาเลือกสี'
    isValid = false
  }

  if (!form.type) {
    formErrors.type = 'กรุณาเลือกประเภท'
    isValid = false
  }

  if (!form.startDate) {
    formErrors.startDate = 'กรุณาเลือกวันที่เริ่มต้น'
    isValid = false
  }

  if (!form.endDate) {
    formErrors.endDate = 'กรุณาเลือกวันที่สิ้นสุด'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  saving.value = true

  try {
    if (isEditing.value && editingId.value) {
      await feature1Store.updateFeature1({
        body: {
          id: editingId.value,
          ...form
        }
      })

      useToast().success('อัปเดต Feature สำเร็จ')
    } else {
      await feature1Store.createFeature1({ body: form })
      useToast().success('เพิ่ม Feature สำเร็จ')
    }

    closeModal()
    await fetchFeatures()
  } catch (error: any) {
    useToast().error(error?.message || 'เกิดข้อผิดพลาด')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (feature: Feature1) => {
  const confirmed = await useConfirm(
    'ยืนยันการลบ',
    `คุณต้องการลบ Feature "${feature.title}" ใช่หรือไม่?`,
    'error'
  )

  if (!confirmed) return

  try {
    await feature1Store.deleteFeature1({ body: { id: feature._id } })
    useToast().success('ลบ Feature สำเร็จ')
    await fetchFeatures()
  } catch (error: any) {
    useToast().error(error?.message || 'เกิดข้อผิดพลาด')
  }
}

function debounce(func: () => void, wait: number): () => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return function() {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(), wait)
  }
}

onMounted(() => {
  fetchFeatures()
})
</script>
