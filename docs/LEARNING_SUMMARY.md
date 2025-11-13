# สรุปการเรียนรู้สถาปัตยกรรมโปรเจกต์

## 📚 โครงสร้างโปรเจกต์

### Frontend Layer

```
composables/
├── constants/api.ts          # API Endpoints definitions
├── data_models/              # Interface สำหรับข้อมูล (Feature Models)
│   └── feature1.ts          # ตัวอย่าง: Feature1, Feature1CreateRequest, Feature1UpdateRequest
├── store_models/             # Interface สำหรับ Store State
│   ├── base.ts              # BaseState, BaseRequestData, BaseResponseData
│   └── feature1.ts          # Feature1State extends BaseState
└── utilities/                # Utility functions
    ├── useHttpClient.ts      # HTTP Client (ใช้แทน $fetch)
    └── ...                   # utilities อื่นๆ

stores/
└── feature1.ts               # Pinia Store สำหรับจัดการ state

pages/
└── manages/
    └── feature_1/
        └── index.vue         # หน้า UI สำหรับแสดงและจัดการข้อมูล

components/
└── base/                     # Base Components ที่ใช้ร่วมกัน
    ├── BaseButton.vue
    ├── BaseInput.vue
    ├── BaseModal.vue
    └── ...
```

### Backend Layer

```
server/
├── api/                      # API Endpoints
│   └── feature1/
│       ├── index.get.ts     # GET /api/feature1 (List)
│       ├── [id].get.ts      # GET /api/feature1/:id (Detail)
│       ├── index.post.ts    # POST /api/feature1 (Create)
│       ├── [id].put.ts      # PUT /api/feature1/:id (Update)
│       └── [id].delete.ts   # DELETE /api/feature1/:id (Delete)
├── models/                   # MongoDB Models
│   └── Feature1.ts
└── utils/
    ├── mongodb.ts           # Database connection
    ├── jwt.ts               # JWT utilities
    ├── queryParser.ts       # Query parsing
    └── responseHandler.ts   # Response formatting
```

---

## 🔄 Data Flow

### การเรียก API (Frontend → Backend)

```
Page/Component
    ↓ เรียก action
Store (Pinia)
    ↓ ใช้ useApi()
useHttpClient
    ↓ HTTP Request
API Endpoint (server/api)
    ↓ query database
MongoDB Model
```

### ตัวอย่างการใช้งาน:

```vue
<!-- pages/manages/feature_1/index.vue -->
<script setup>
const feature1Store = useFeature1Store()

const fetchData = async () => {
  await feature1Store.fetchFeature1({
    query: {
      pagination: { page: 1, limit: 10 },
      search: 'keyword',
      filter: { isActive: true }
    }
  })
}
</script>
```

---

## 📦 Component Models

### 1. Data Models (`composables/data_models/`)

**จุดประสงค์**: กำหนด TypeScript interfaces สำหรับข้อมูลที่รับส่งระหว่าง Frontend-Backend

```typescript
// composables/data_models/feature1.ts
export interface Feature1 {
  _id: string
  code: number
  title: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy?: { _id: string; name: string; email: string }
  updatedBy?: { _id: string; name: string; email: string }
}

export interface Feature1CreateRequest {
  title: string
  description: string
  // ... ฟิลด์ที่จำเป็นสำหรับสร้าง
}

export interface Feature1UpdateRequest {
  title?: string
  description?: string
  // ... ฟิลด์ optional สำหรับอัปเดต
}

// Constants
export const FEATURE1_TYPES = [
  { label: 'ประกาศ', value: 'announcement' },
  { label: 'โปรโมชั่น', value: 'promotion' }
] as const
```

---

### 2. Store Models (`composables/store_models/`)

**จุดประสงค์**: กำหนด State interface สำหรับ Pinia Store

```typescript
// composables/store_models/base.ts
export interface BaseState<R1 = any, R2 = any> {
  list?: R2[]
  current?: R2
  pagination?: BasePagination | null
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  requestData?: BaseRequestData<R1>
  responseData?: BaseResponseData<R2>
}

export interface BaseRequestData<T = any> {
  body?: T
  query?: BaseRequestQuery
}

export interface BaseResponseData<T = any> {
  success?: boolean
  data?: T
  message?: string | null
  pagination?: BasePagination | null
  error?: boolean
  statusCode?: number | null
}
```

```typescript
// composables/store_models/feature1.ts
import type { Feature1 } from '~/composables/data_models/feature1'
import type { BaseState } from './base'

export interface Feature1State extends BaseState {
  items: Feature1[]
}
```

---

### 3. Store (`stores/`)

**จุดประสงค์**: จัดการ state และ actions ด้วย Pinia

```typescript
// stores/feature1.ts
import { defineStore } from 'pinia'
import type { BaseRequestData } from '~/composables/store_models/base'
import { initState, loadingState, successState, errorState } from '~/composables/store_models/base'
import type { Feature1State } from '~/composables/store_models/feature1'
import type { Feature1CreateRequest, Feature1UpdateRequest } from '~/composables/data_models/feature1'
import { BaseResponseError } from '~/composables/utility_models/http'

export const useFeature1Store = defineStore('feature1', {
  state: (): Feature1State => ({
    ...initState,
    items: []
  }),

  getters: {
    getFeature1ById: (state) => (id: string) =>
      state.list?.find((item: any) => item._id === id),
    totalFeature1: (state) => state.pagination?.total ?? 0,
    activeFeatures: (state) => state.items.filter(item => item.isActive)
  },

  actions: {
    async fetchFeature1(requestData: BaseRequestData = {}) {
      try {
        this.$patch(loadingState(requestData))

        const { get } = useApi()
        const response = await get('/feature1', requestData.query)

        this.$patch(successState(response))
        this.list = [...(response?.data || [])]
        this.items = [...(response?.data || [])]
        this.pagination = { ...(response?.pagination || {}) }

        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    async createFeature1(requestData: BaseRequestData<Feature1CreateRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const { post } = useApi()
        const response = await post('/feature1', requestData.body)

        this.$patch(successState(response))
        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    }
    // ... updateFeature1, deleteFeature1
  }
})
```

**สิ่งสำคัญ**:
- ใช้ `useApi()` แทน `$fetch` โดยตรง
- ใช้ `loadingState()`, `successState()`, `errorState()` เสมอ
- จัดการ error ด้วย try-catch
- อัปเดต state ด้วย `$patch()`

---

### 4. HTTP Client (`composables/utilities/useHttpClient.ts`)

**จุดประสงค์**: Wrapper สำหรับเรียก API

```typescript
// การใช้งาน
const { get, post, put, delete: del } = useApi()

// GET with query
const data = await get('/feature1', {
  pagination: { page: 1, limit: 10 },
  search: 'keyword',
  filter: { isActive: true }
})

// POST
const created = await post('/feature1', {
  title: 'New Feature',
  description: 'Description'
})

// PUT
const updated = await put('/feature1/123', {
  title: 'Updated Title'
})

// DELETE
await del('/feature1/123')
```

**Features**:
- ✅ Auto-inject Authorization header (Bearer token)
- ✅ แปลง query object เป็น query string อัตโนมัติ
- ✅ จัดการ FormData สำหรับ upload
- ✅ Error handling และ interceptors

---

## 🗄️ Backend Models

### MongoDB Model (`server/models/`)

```typescript
// server/models/Feature1.ts
import mongoose, { Schema, Document } from 'mongoose'

export interface IFeature1 extends Document {
  code: number
  title: string
  description: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy?: mongoose.Types.ObjectId
  updatedBy?: mongoose.Types.ObjectId
}

const Feature1Schema = new Schema<IFeature1>({
  code: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true // Auto create createdAt, updatedAt
})

// Indexes สำหรับการค้นหา
Feature1Schema.index({ isActive: 1 })
Feature1Schema.index({ type: 1 })

export const Feature1 = mongoose.models.Feature1 ||
  mongoose.model<IFeature1>('Feature1', Feature1Schema)

// Auto-increment helper
export async function getNextFeature1Code(): Promise<number> {
  const last = await Feature1.findOne().sort({ code: -1 }).select('code')
  if (!last) return 100001
  return last.code + 1
}
```

---

## 🔌 API Endpoints

### Pattern: CRUD Operations

#### 1. GET List (`server/api/feature1/index.get.ts`)

```typescript
export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const query = getQuery(event)

    // Parse query parameters
    const parsedQuery = parseQuery(query, {
      allowedParams: ['pagination', 'filter', 'search', 'sort'],
      allowedFilters: ['type', 'isActive']
    })

    const page = Number(parsedQuery.pagination?.page) || 1
    const limit = Number(parsedQuery.pagination?.limit) || 10
    const skip = (page - 1) * limit

    // Build filter
    const filter: any = {}
    if (parsedQuery.filter?.isActive !== undefined) {
      filter.isActive = parsedQuery.filter.isActive === 'true'
    }

    // Build search
    if (parsedQuery.search) {
      const searchRegex = new RegExp(parsedQuery.search as string, 'i')
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ]
    }

    // Build sort
    const sortOptions: any =
      parsedQuery.sort
        ? { [parsedQuery.sort.field]: parsedQuery.sort.order === 'asc' ? 1 : -1 }
        : { createdAt: -1 }

    // Execute query
    const [data, total] = await Promise.all([
      Feature1.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .lean(), // ⚠️ ใช้ lean() เสมอ
      Feature1.countDocuments(filter)
    ])

    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    console.error('Fetch error:', error)
    return {
      success: false,
      message: error.message || 'Failed to fetch'
    }
  }
})
```

#### 2. POST Create (`server/api/feature1/index.post.ts`)

```typescript
export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    // 1. Authentication
    const authHeader = getHeader(event, 'authorization')
    const token = extractTokenFromHeader(authHeader)
    if (!token) {
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    const decoded = verifyToken(token)
    const currentUser = await User.findById(decoded.userId)
    if (!currentUser || !currentUser.isActive) {
      throw createPredefinedError(API_RESPONSE_CODES.USER_NOT_FOUND)
    }

    // 2. Get body
    const body = await readBody(event)

    // 3. Validation
    if (!body.title || !body.description) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
    }

    // 4. Get next code
    const code = await getNextFeature1Code()

    // 5. Create
    const feature = await Feature1.create({
      code,
      title: body.title.trim(),
      description: body.description.trim(),
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdBy: currentUser._id,
      updatedBy: currentUser._id
    })

    // 6. Populate and return
    const populated = await Feature1.findById(feature._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean()

    return createSuccessResponse(populated)

  } catch (error: any) {
    console.error('Create error:', error)

    if (error.statusCode) throw error

    if (error.code === 11000) {
      throw createPredefinedError(API_RESPONSE_CODES.ALREADY_EXISTS)
    }

    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
```

#### 3. PUT Update (`server/api/feature1/[id].put.ts`)

```typescript
export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    // Authentication (same as POST)
    const authHeader = getHeader(event, 'authorization')
    const token = extractTokenFromHeader(authHeader)
    if (!token) throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)

    const decoded = verifyToken(token)
    const currentUser = await User.findById(decoded.userId)
    if (!currentUser || !currentUser.isActive) {
      throw createPredefinedError(API_RESPONSE_CODES.USER_NOT_FOUND)
    }

    // Get ID
    const id = event.context.params?.id
    if (!id) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
    }

    const body = await readBody(event)

    // Update
    const updated = await Feature1.findByIdAndUpdate(
      id,
      {
        ...body,
        updatedBy: currentUser._id
      },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean()

    if (!updated) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND)
    }

    return createSuccessResponse(updated)

  } catch (error: any) {
    console.error('Update error:', error)
    if (error.statusCode) throw error
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
```

#### 4. DELETE (`server/api/feature1/[id].delete.ts`)

```typescript
export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    // Authentication (same as POST)
    const authHeader = getHeader(event, 'authorization')
    const token = extractTokenFromHeader(authHeader)
    if (!token) throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)

    const decoded = verifyToken(token)
    const currentUser = await User.findById(decoded.userId)
    if (!currentUser) {
      throw createPredefinedError(API_RESPONSE_CODES.USER_NOT_FOUND)
    }

    const id = event.context.params?.id
    if (!id) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
    }

    // Hard delete
    const deleted = await Feature1.findByIdAndDelete(id)

    // หรือ Soft delete (แนะนำ)
    // const deleted = await Feature1.findByIdAndUpdate(
    //   id,
    //   { isActive: false, updatedBy: currentUser._id },
    //   { new: true }
    // )

    if (!deleted) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND)
    }

    return createSuccessResponse({ deleted: true })

  } catch (error: any) {
    console.error('Delete error:', error)
    if (error.statusCode) throw error
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
```

---

## 🎨 UI Components (Pages)

### Page Structure

```vue
<!-- pages/manages/feature_1/index.vue -->
<template>
  <div>
    <div class="container mx-auto px-4 py-2 min-h-screen">
      <!-- 1. Page Header -->
      <BasePageHeader
        title="จัดการ Feature"
        code="FEATURE-001"
        description="คำอธิบาย"
        :breadcrumbs="[
          { label: 'จัดการข้อมูล', to: '/manages' },
          { label: 'จัดการ Feature' }
        ]"
      >
        <template #actions>
          <BaseButton @click="openCreateModal" variant="primary" icon-left="plus">
            เพิ่ม Feature
          </BaseButton>
        </template>
      </BasePageHeader>

      <!-- 2. Search and Filter -->
      <div class="card bg-base-100 shadow-sm mb-6">
        <div class="card-body p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BaseInput
              v-model="search"
              type="text"
              placeholder="ค้นหา..."
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

      <!-- 3. Data Table -->
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
            <!-- Custom cell templates -->
            <template #cell(title)="{ row }">
              <div class="font-medium">{{ row.title }}</div>
            </template>

            <template #cell(isActive)="{ row }">
              <div
                class="badge"
                :class="row.isActive ? 'badge-success' : 'badge-error'"
              >
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

          <!-- 4. Pagination -->
          <BasePagination
            v-if="pagination"
            :current-page="pagination.page"
            :total-items="pagination.total"
            :per-page="pagination.limit"
            @update:current-page="handlePageChange"
          />
        </div>
      </div>

      <!-- 5. Create/Edit Modal -->
      <BaseModal
        v-model:visible="showModal"
        :title="isEditing ? 'แก้ไข Feature' : 'เพิ่ม Feature'"
        size="xl"
      >
        <div class="space-y-4">
          <BaseInput
            v-model="form.title"
            label="ชื่อ Feature"
            placeholder="กรอกชื่อ Feature"
            required
            :error="formErrors.title"
          />

          <BaseTextarea
            v-model="form.description"
            label="รายละเอียด"
            placeholder="กรอกรายละเอียด"
            :rows="3"
            required
            :error="formErrors.description"
          />

          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-3">
              <BaseCheckbox v-model="form.isActive" />
              <span class="label-text">เปิดใช้งาน</span>
            </label>
          </div>
        </div>

        <template #actions>
          <div class="flex justify-end gap-2">
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
import type { Feature1, Feature1CreateRequest } from '~/composables/data_models/feature1'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

useHead({
  title: 'จัดการ Feature - Admin Panel'
})

const feature1Store = useFeature1Store()

// Refs
const search = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)

const form = reactive<Feature1CreateRequest & { id?: string }>({
  title: '',
  description: '',
  isActive: true
})

const formErrors = reactive({
  title: '',
  description: ''
})

// Computed
const loading = computed(() => feature1Store.isLoading)
const features = computed(() => feature1Store.items || [])
const pagination = computed(() => feature1Store.pagination)

const typeOptions = ref([
  { label: 'ทั้งหมด', value: '' },
  { label: 'ประเภท A', value: 'typeA' },
  { label: 'ประเภท B', value: 'typeB' }
])

const statusOptions = ref([
  { label: 'สถานะทั้งหมด', value: '' },
  { label: 'เปิดใช้งาน', value: 'true' },
  { label: 'ปิดใช้งาน', value: 'false' }
])

const tableFields = [
  { key: 'code', label: 'รหัส', sortable: true, width: '100px' },
  { key: 'title', label: 'ชื่อ', sortable: true },
  { key: 'isActive', label: 'สถานะ', width: '100px' },
  { key: 'actions', label: 'จัดการ', width: '120px' }
]

// Methods
const fetchFeatures = async () => {
  const query: any = {
    pagination: {
      page: pagination.value?.page || 1,
      limit: pagination.value?.limit || 10
    }
  }

  if (search.value) query.search = search.value
  if (typeFilter.value) query.filter = { ...query.filter, type: typeFilter.value }
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
```

---

## ✅ Checklist สำหรับสร้าง Feature ใหม่

### Frontend
- [ ] สร้าง Data Model ใน `composables/data_models/{feature}.ts`
  - [ ] Interface หลัก (เช่น Feature1)
  - [ ] CreateRequest interface
  - [ ] UpdateRequest interface
  - [ ] Constants (TYPES, STATUSES, etc.)
- [ ] สร้าง Store Model ใน `composables/store_models/{feature}.ts`
  - [ ] {Feature}State extends BaseState
- [ ] สร้าง Store ใน `stores/{feature}.ts`
  - [ ] State
  - [ ] Getters
  - [ ] Actions (fetch, fetchById, create, update, delete)
- [ ] สร้าง Page ใน `pages/manages/{feature}/index.vue`
  - [ ] BasePageHeader
  - [ ] Search & Filter
  - [ ] BaseDataTable
  - [ ] BasePagination
  - [ ] BaseModal (Create/Edit)
  - [ ] Form validation
  - [ ] Error handling

### Backend
- [ ] สร้าง Model ใน `server/models/{Feature}.ts`
  - [ ] Interface (I{Feature} extends Document)
  - [ ] Schema definition
  - [ ] Indexes
  - [ ] Auto-increment function (ถ้าต้องการ)
- [ ] สร้าง API Endpoints ใน `server/api/{feature}/`
  - [ ] `index.get.ts` (List with pagination, search, filter)
  - [ ] `[id].get.ts` (Get by ID)
  - [ ] `index.post.ts` (Create)
  - [ ] `[id].put.ts` (Update)
  - [ ] `[id].delete.ts` (Delete)
- [ ] ทุก API endpoint ต้องมี:
  - [ ] Authentication (JWT verification)
  - [ ] Validation
  - [ ] Error handling
  - [ ] Standard response format

---

## 🚫 ข้อห้าม (Don'ts)

1. ❌ **ห้ามใช้ `$fetch` โดยตรง** → ใช้ `useApi()` จาก `useHttpClient`
2. ❌ **ห้าม hardcode API endpoints** → ใช้ `API_ENDPOINTS` จาก `composables/constants/api.ts`
3. ❌ **ห้ามสร้าง Components ใหม่โดยไม่ตรวจสอบ Base Components ก่อน**
4. ❌ **ห้ามใส่ business logic หนักๆ ใน Pages** → ใช้ Store actions
5. ❌ **ห้ามลืมใช้ `lean()`** เมื่อ query MongoDB
6. ❌ **ห้ามลืม populate** createdBy และ updatedBy
7. ❌ **ห้ามลืม timestamps: true** ใน Schema
8. ❌ **ห้ามลืมใส่ indexes** สำหรับฟิลด์ที่ค้นหาบ่อย
9. ❌ **ห้าม mockup data โดยเด็ดขาด** → ลงเป็น TODO เพื่อทำต่อในภายหลัง

---

## ✅ Best Practices

1. ✅ **ใช้ TypeScript เสมอ**
2. ✅ **ใช้ Base Components ที่มีอยู่แล้ว**
3. ✅ **จัดการ Loading, Error, Success states**
4. ✅ **Validate input ทั้ง Frontend และ Backend**
5. ✅ **ใช้ try-catch ใน Store actions และ API endpoints**
6. ✅ **ใช้ pagination สำหรับข้อมูลจำนวนมาก**
7. ✅ **แสดง toast notification เมื่อ success/error**
8. ✅ **ใช้ confirm dialog ก่อน delete**
9. ✅ **ไม่ mockup data - ลงเป็น TODO แทน** เมื่อต้องการข้อมูลทดสอบ ให้ลงเป็น TODO item เพื่อทำภายหลัง ไม่ควรสร้างข้อมูลปลอมในโค้ด

---

## 📝 การใช้งาน Slash Command

ตอนนี้คุณสามารถใช้ slash command `/add-feature` เพื่อสร้าง feature ใหม่ได้แล้ว!

### วิธีใช้:

1. พิมพ์ `/add-feature` ใน Claude Code
2. Claude จะถามข้อมูล:
   - ชื่อ feature (ภาษาอังกฤษ)
   - คำอธิบาย (ภาษาไทย)
   - ฟิลด์ต่างๆ และ type
   - ฟิลด์ไหน required
   - ต้องการ auto-increment code หรือไม่
3. Claude จะสร้างไฟล์ทั้งหมดให้อัตโนมัติ:
   - Frontend: Data Model, Store Model, Store, Page
   - Backend: Model, API Endpoints (GET list, GET detail, POST, PUT, DELETE)
4. ทดสอบ feature ใหม่ที่สร้าง

---

## 🎯 สรุป

โครงสร้างนี้ช่วยให้:
- **แยกความรับผิดชอบชัดเจน**: UI, State, API, Database
- **ใช้โค้ดซ้ำได้**: Base Components, BaseState, useHttpClient
- **Type-safe**: TypeScript ทุกที่
- **Maintainable**: โครงสร้างชัดเจน ง่ายต่อการหา bug และเพิ่ม feature
- **Scalable**: เพิ่ม feature ใหม่ได้ง่าย ตาม pattern เดิม

---

_Last Updated: 2025-11-13_
