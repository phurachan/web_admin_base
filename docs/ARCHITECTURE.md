# Web Admin Base - Architecture Guide

## 📋 สารบัญ
1. [โครงสร้างโปรเจค](#โครงสร้างโปรเจค)
2. [หน้าที่ของแต่ละส่วน](#หน้าที่ของแต่ละส่วน)
3. [หลักการสำคัญ](#หลักการสำคัญ)
4. [ตัวอย่างการใช้งาน](#ตัวอย่างการใช้งาน)
5. [Best Practices](#best-practices)

---

## โครงสร้างโปรเจค

```
web-admin-base/
├── pages/                          # หน้าเว็บ (Routing)
│   └── manages/                   # หน้าจัดการข้อมูล
│       └── feature_1/             # ตัวอย่าง Feature
├── components/                     # Vue Components
│   └── base/                      # Base Components (กลาง)
├── layouts/                        # Layouts
├── stores/                         # State Management (Pinia)
├── composables/
│   ├── constants/                 # Constants (API endpoints, etc.)
│   │   └── api.ts                # API Endpoints definitions
│   ├── data_models/               # Data Model interfaces
│   │   └── feature1.ts           # ตัวอย่าง: Feature1, CreateRequest, UpdateRequest
│   ├── store_models/              # Type definitions สำหรับ Stores
│   │   ├── base.ts               # BaseState, BaseRequestData
│   │   └── feature1.ts           # Feature1State
│   ├── utility_models/            # Type definitions สำหรับ Utilities
│   └── utilities/                 # Utility functions
│       └── useHttpClient.ts       # HTTP Client wrapper (ใช้แทน $fetch)
├── server/
│   ├── api/                       # API Endpoints
│   │   └── feature1/             # ตัวอย่าง API
│   ├── models/                    # MongoDB Models
│   │   └── Feature1.ts           # ตัวอย่าง Model
│   ├── middleware/                # Server Middleware
│   └── utils/
│       ├── mongodb.ts             # Database connection
│       ├── jwt.ts                 # JWT utilities
│       ├── queryParser.ts         # Query parser utility
│       └── responseHandler.ts     # Response handler utility
└── types/                         # TypeScript type definitions
```

---

## หน้าที่ของแต่ละส่วน

### 🎯 Frontend Layer

#### 1. **Pages** (`pages/`)
- รับผิดชอบแค่การแสดงผลและ routing
- **ห้าม** มี business logic หนักๆ
- **ห้าม** เรียก API โดยตรงด้วย `$fetch`
- ควรเรียกใช้ Store actions เท่านั้น

#### 2. **Components** (`components/`)
- แบ่งเป็น 2 ประเภท:
  - **Base Components**: Components พื้นฐานที่ใช้ร่วมกัน (ต้องตรวจสอบก่อนสร้างใหม่)
  - **Feature Components**: Components เฉพาะฟีเจอร์
- รับ props และ emit events
- ไม่ควรมี API calls

#### 3. **Stores** (`stores/`)
- จัดการ state แบบ global
- เรียก API ผ่าน `useApi()` จาก `useHttpClient` เท่านั้น
- จัดการ loading, error, success states
- เก็บข้อมูลที่ได้จาก API

#### 4. **Composables**
- **`composables/constants/api.ts`**: กำหนด API endpoints ทั้งหมด
- **`composables/data_models/`**: Interface สำหรับข้อมูล (Feature Models)
- **`composables/store_models/`**: Type definitions สำหรับ stores
- **`composables/utilities/useHttpClient.ts`**: HTTP Client wrapper
  - จัดการ headers (Authorization, Content-Type)
  - แปลง query object เป็น query string
  - จัดการ errors และ interceptors

---

### ⚙️ Backend Layer

#### 1. **API Endpoints** (`server/api/`)
- ใช้ `defineEventHandler`
- **ต้องใช้** `parseQuery` สำหรับ list endpoints
- **ต้องใช้** standard response format `{ success, data, pagination, message }`
- ตรวจสอบ authentication และ authorization

#### 2. **Models** (`server/models/`)
- MongoDB Schema definitions
- Auto-increment helpers (ถ้าต้องการ)
- Indexes สำหรับ performance

#### 3. **Query Parser** (`server/utils/queryParser.ts`)
- แปลง query string เป็น MongoDB filter
- จัดการ pagination
- จัดการ sorting
- จัดการ search

#### 4. **Response Handler** (`server/utils/responseHandler.ts`)
- `createSuccessResponse()`: สำหรับ response สำเร็จ
- `createPaginatedResponse()`: สำหรับ response แบบมี pagination
- `createPredefinedError()`: สำหรับ error response
- `API_RESPONSE_CODES`: Constants สำหรับ error/success messages

---

## หลักการสำคัญ

### 🚫 ❌ สิ่งที่ห้ามทำ

#### 1. **ห้ามเรียก API โดยตรงด้วย `$fetch`**
```typescript
// ❌ ผิด - อย่าทำแบบนี้
const data = await $fetch('/api/feature1', {
  headers: {
    Authorization: `Bearer ${token}`
  }
})

// ✅ ถูกต้อง - ใช้ Store
const feature1Store = useFeature1Store()
await feature1Store.fetchFeature1({ query: {} })
```

#### 2. **ห้าม hardcode API endpoints**
```typescript
// ❌ ผิด
await httpClient.get('/api/users/123')

// ✅ ถูกต้อง - ใช้ API_ENDPOINTS (ถ้ามีการกำหนด)
// หรือใช้ path ตรงๆ ใน useApi()
const { get } = useApi()
await get('/users/123')
```

#### 3. **ห้ามสร้าง Components ใหม่โดยไม่ตรวจสอบ Base Components ก่อน**
```vue
<!-- ❌ ผิด - สร้าง Button component ใหม่ -->
<button class="btn">Click</button>

<!-- ✅ ถูกต้อง - ใช้ BaseButton ที่มีอยู่แล้ว -->
<BaseButton variant="primary">Click</BaseButton>
```

#### 4. **ห้ามส่ง response แบบไม่มี standard format**
```typescript
// ❌ ผิด
return { data: users, total: 100 }

// ✅ ถูกต้อง
return {
  success: true,
  data: users,
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    pages: Math.ceil(100 / 20)
  }
}
```

#### 5. **ห้าม mockup data โดยเด็ดขาด**
```typescript
// ❌ ผิด - สร้างข้อมูลปลอมในโค้ด
const mockData = [
  { id: 1, name: 'Test 1' },
  { id: 2, name: 'Test 2' }
]

// ✅ ถูกต้อง - ลงเป็น TODO แทน
// TODO: เพิ่มข้อมูลทดสอบใน database
```

---

### ✅ วิธีที่ถูกต้อง

#### 1. **การเรียก API**

**Flow:** `Page/Component` → `Store` → `useApi()` → `API Endpoint`

```typescript
// 1. สร้าง Data Model ใน composables/data_models/feature1.ts
export interface Feature1 {
  _id: string
  code: number
  title: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Feature1CreateRequest {
  title: string
  description: string
  isActive?: boolean
}

export interface Feature1UpdateRequest {
  title?: string
  description?: string
  isActive?: boolean
}

// 2. สร้าง Store Model ใน composables/store_models/feature1.ts
import type { Feature1 } from '~/composables/data_models/feature1'
import type { BaseState } from './base'

export interface Feature1State extends BaseState {
  items: Feature1[]
}

// 3. สร้าง Store Action ใน stores/feature1.ts
import { defineStore } from 'pinia'
import { initState, loadingState, successState, errorState } from '~/composables/store_models/base'
import type { Feature1State } from '~/composables/store_models/feature1'
import type { Feature1CreateRequest } from '~/composables/data_models/feature1'
import { BaseResponseError } from '~/composables/utility_models/http'

export const useFeature1Store = defineStore('feature1', {
  state: (): Feature1State => ({
    ...initState,
    items: []
  }),

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
  }
})

// 4. เรียกใช้ใน Page/Component
const feature1Store = useFeature1Store()

const loadFeatures = async () => {
  try {
    await feature1Store.fetchFeature1({
      query: {
        pagination: { page: 1, limit: 10 },
        search: searchQuery.value
      }
    })
  } catch (error) {
    console.error('Failed to load features:', error)
  }
}
```

---

#### 2. **การสร้าง API Endpoint**

```typescript
// server/api/feature1/index.get.ts
import { connectDB } from '~/server/utils/mongodb'
import { Feature1 } from '~/server/models/Feature1'
import { parseQuery } from '~/server/utils/queryParser'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const query = getQuery(event)

    const parsedQuery = parseQuery(query, {
      allowedParams: ['pagination', 'filter', 'search', 'sort'],
      allowedFilters: ['type', 'isActive']
    })

    const page = Number(parsedQuery.pagination?.page) || 1
    const limit = Number(parsedQuery.pagination?.limit) || 10
    const skip = (page - 1) * limit

    // Build filter
    const filter: any = {}

    if (parsedQuery.filter) {
      if (parsedQuery.filter.isActive !== undefined) {
        filter.isActive = parsedQuery.filter.isActive === 'true'
      }
      if (parsedQuery.filter.type) {
        filter.type = parsedQuery.filter.type
      }
    }

    // Build search
    if (parsedQuery.search) {
      const searchRegex = new RegExp(parsedQuery.search as string, 'i')
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { code: isNaN(Number(parsedQuery.search)) ? undefined : Number(parsedQuery.search) }
      ].filter(Boolean)
    }

    // Build sort
    const sortOptions: any = {}
    if (parsedQuery.sort) {
      const sortField = parsedQuery.sort.field || 'createdAt'
      const sortOrder = parsedQuery.sort.order === 'asc' ? 1 : -1
      sortOptions[sortField] = sortOrder
    } else {
      sortOptions.createdAt = -1
    }

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
    console.error('Feature1 fetch error:', error)
    return {
      success: false,
      message: error.message || 'Failed to fetch features'
    }
  }
})
```

---

#### 3. **การใช้ Base Components**

**ตรวจสอบ Base Components ที่มีอยู่:**
- `BaseButton` - ปุ่มต่างๆ
- `BaseIcon` - ไอคอน (ใช้ Lucide icons)
- `BaseInput` - Input fields
- `BaseSelect` - Select dropdown
- `BaseTextarea` - Textarea
- `BaseCheckbox` - Checkbox
- `BaseRadio` - Radio button
- `BaseModal` - Modal dialogs
- `BaseCard` - Card containers
- `BaseDataTable` - Data table with sorting
- `BasePagination` - Pagination
- `BaseDatePicker` - Date picker
- `BaseColorPicker` - Color picker
- `BaseIconPicker` - Icon picker
- `BaseFileUpload` - File upload
- `BasePageHeader` - Page header with breadcrumbs

```vue
<!-- ❌ ผิด - สร้างใหม่ -->
<button class="btn btn-primary" @click="handleClick">
  <svg>...</svg>
  Save
</button>

<!-- ✅ ถูกต้อง - ใช้ BaseButton และ BaseIcon -->
<BaseButton variant="primary" @click="handleClick">
  <BaseIcon name="save" size="sm" />
  Save
</BaseButton>
```

---

## ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: สร้างหน้า List + Detail

อ้างอิงจากตัวอย่าง **Feature 1** ที่มีอยู่ในโปรเจกต์:
- [pages/manages/feature_1/index.vue](../pages/manages/feature_1/index.vue)
- [stores/feature1.ts](../stores/feature1.ts)
- [composables/data_models/feature1.ts](../composables/data_models/feature1.ts)
- [composables/store_models/feature1.ts](../composables/store_models/feature1.ts)
- [server/models/Feature1.ts](../server/models/Feature1.ts)
- [server/api/feature1/](../server/api/feature1/)

---

## Best Practices

### 1. **State Management**
- ใช้ Store สำหรับข้อมูลที่ใช้ร่วมกันหลายหน้า
- ใช้ local state (`ref`, `reactive`) สำหรับข้อมูลที่ใช้แค่ใน component เดียว

### 2. **Error Handling**
- ใช้ try-catch ใน Store actions
- แสดง error message ใน UI ด้วย `useToast()`
- Log errors สำหรับ debugging

### 3. **Loading States**
- แสดง loading indicator เมื่อโหลดข้อมูล
- Disable ปุ่มเมื่อกำลัง submit

### 4. **Type Safety**
- ใช้ TypeScript ทุกที่
- สร้าง interface/type สำหรับ request/response
- ใช้ type guards เมื่อจำเป็น

### 5. **Performance**
- ใช้ `lean()` เมื่อ query MongoDB
- ใช้ pagination สำหรับข้อมูลจำนวนมาก
- Cache ข้อมูลที่ไม่เปลี่ยนบ่อยใน Store

### 6. **Security**
- ตรวจสอบ authentication ใน API endpoints
- ตรวจสอบ authorization (roles/permissions)
- Validate input data
- Sanitize user input

### 7. **Data Management**
- **ไม่ mockup data** - ถ้าต้องการข้อมูลทดสอบ ให้ลงเป็น TODO แทน
- ใช้ seed script สำหรับข้อมูลเริ่มต้น

---

## Checklist สำหรับ Feature ใหม่

### Frontend
- [ ] สร้าง Data Model ใน `composables/data_models/`
- [ ] สร้าง Store Model ใน `composables/store_models/`
- [ ] สร้าง Store ใน `stores/`
- [ ] สร้าง Pages/Components
- [ ] ใช้ Base Components ที่มีอยู่
- [ ] จัดการ Loading/Error states
- [ ] ทดสอบการทำงาน

### Backend
- [ ] สร้าง Model ใน `server/models/`
- [ ] สร้าง API Endpoints ใน `server/api/`
  - [ ] `index.get.ts` (List)
  - [ ] `[id].get.ts` (Detail)
  - [ ] `index.post.ts` (Create)
  - [ ] `[id].put.ts` (Update)
  - [ ] `[id].delete.ts` (Delete)
- [ ] ใช้ `parseQuery` สำหรับ list endpoints
- [ ] ใช้ standard response format
- [ ] เพิ่ม Authentication/Authorization
- [ ] Validate input data
- [ ] ทดสอบ API endpoints

---

## การ Debug

### Frontend
```typescript
// ใช้ Vue Devtools
// ดู Store state และ actions
console.log('Store state:', feature1Store.$state)

// ดู API response
console.log('Response:', response)

// ดู computed values
console.log('Features:', feature1Store.items)
```

### Backend
```typescript
// Log query และ filter
console.log('Query:', query)
console.log('Mongo Filter:', filter)

// Log จำนวนข้อมูล
console.log('Total:', total)

// Log errors
console.error('Error:', error)
```

---

## สรุป

**กฎทอง 6 ข้อ:**

1. ✅ **ห้าม `$fetch` โดยตรง** - ใช้ `useApi()` และ Store เสมอ
2. ✅ **ใช้ State Management** - ลด code ซ้ำซ้อนและจัดการข้อมูลดีขึ้น
3. ✅ **ใช้ Standard Response Format** - ให้ frontend จัดการ response ได้ง่าย
4. ✅ **ใช้ Base Components** - ตรวจสอบก่อนสร้างใหม่เสมอ
5. ✅ **TypeScript ทุกที่** - Type safety เสมอ
6. ✅ **ไม่ mockup data** - ลงเป็น TODO เพื่อทำต่อในภายหลัง

---

## เครื่องมือช่วยพัฒนา

### Slash Commands
- `/add-feature` - สร้าง CRUD feature ใหม่แบบครบวงจร (Frontend + Backend)

### เอกสารอ้างอิง
- [LEARNING_SUMMARY.md](./LEARNING_SUMMARY.md) - เอกสารสรุปการเรียนรู้พร้อมตัวอย่างโค้ดแบบละเอียด
- [Feature 1 Example](../pages/manages/feature_1/) - ตัวอย่างการสร้าง feature แบบสมบูรณ์

---

**หากมีข้อสงสัยหรือต้องการเพิ่มเติม กรุณาอัปเดตเอกสารนี้**

_Last Updated: 2025-11-13_
