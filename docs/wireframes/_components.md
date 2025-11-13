# Wireframe Components Reference

ไฟล์นี้เก็บ HTML snippets ของ components ที่ใช้ซ้ำในทุกหน้าจอ สำหรับใช้กับคำสั่ง `/add-wireframe-screen`

---

## 🧭 Navbar

```html
<nav class="bg-blue-600 text-white shadow-lg">
    <div class="flex items-center justify-between px-6 py-3">
        <div class="flex items-center space-x-4">
            <div class="bg-white text-blue-600 font-bold px-3 py-1 rounded text-sm">LOGO</div>
        </div>
        <div class="text-lg font-bold">Web Admin Base</div>
        <div class="flex items-center space-x-3">
            <div class="text-right">
                <div class="text-sm font-semibold">ผู้ดูแลระบบ</div>
                <div class="text-xs text-blue-200">Admin</div>
            </div>
            <div class="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center text-sm font-bold">ผด</div>
        </div>
    </div>
</nav>
```

---

## 📂 Sidebar

```html
<aside class="w-56 bg-gray-800 text-white">
    <nav class="p-3">
        <ul class="space-y-1">
            <li>
                <a href="#" class="block px-3 py-2 rounded hover:bg-gray-700 text-white font-semibold text-sm">
                    🏠 หน้าหลัก
                </a>
            </li>
            <li>
                <a href="#" class="block px-3 py-2 rounded bg-gray-700 text-gray-300 text-sm">
                    📊 จัดการข้อมูล
                </a>
            </li>
            <li>
                <a href="#" class="block px-3 py-2 rounded hover:bg-gray-700 text-gray-300 text-sm">
                    📈 รายงาน
                </a>
            </li>
            <li>
                <a href="#" class="block px-3 py-2 rounded hover:bg-gray-700 text-gray-300 text-sm">
                    ⚙️ ตั้งค่า
                </a>
            </li>
        </ul>
    </nav>
</aside>
```

---

## 📄 Content - หน้ารายการ (List)

```html
<!-- Page Header -->
<div class="mb-3">
    <h1 class="text-2xl font-bold text-gray-800 mb-1">{{PAGE_TITLE}}</h1>
    <nav class="flex mt-2 text-xs text-gray-600">
        <span>หน้าหลัก</span>
        <span class="mx-1">/</span>
        <span>{{BREADCRUMB}}</span>
    </nav>
</div>

<!-- Search and Filter -->
<div class="bg-white rounded-lg shadow p-3 mb-3">
    <div class="flex justify-between items-center mb-3">
        <div class="flex space-x-2 flex-1">
            <input type="text" placeholder="ค้นหา..." class="flex-1 max-w-xs px-2 py-1 text-sm border border-gray-300 rounded"/>
            <select class="px-2 py-1 text-sm border border-gray-300 rounded">
                <option>ทั้งหมด</option>
                <option>{{FILTER_OPTION_1}}</option>
                <option>{{FILTER_OPTION_2}}</option>
            </select>
        </div>
        <button class="px-3 py-1 text-sm bg-green-600 text-white rounded font-semibold">+ เพิ่ม{{ENTITY_NAME}}</button>
    </div>

    <!-- Data Table -->
    <div class="overflow-x-auto">
        <table class="w-full text-xs">
            <thead>
                <tr class="bg-gray-50 border-b">
                    {{TABLE_HEADERS}}
                </tr>
            </thead>
            <tbody>
                {{TABLE_ROWS}}
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    <div class="flex justify-between items-center mt-3 text-xs">
        <div class="text-gray-600">แสดง 1-10 จาก 25 รายการ</div>
        <div class="flex space-x-1">
            <button class="px-2 py-1 border border-gray-300 rounded">ก่อนหน้า</button>
            <button class="px-2 py-1 border border-blue-600 bg-blue-600 text-white rounded">1</button>
            <button class="px-2 py-1 border border-gray-300 rounded">2</button>
            <button class="px-2 py-1 border border-gray-300 rounded">3</button>
            <button class="px-2 py-1 border border-gray-300 rounded">ถัดไป</button>
        </div>
    </div>
</div>
```

---

## 🗂️ Modal - เพิ่ม/แก้ไข (Add/Edit)

```html
<!-- Modal Overlay -->
<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center;">
    <!-- Modal Dialog -->
    <div class="bg-white rounded-lg shadow-xl" style="width: 600px; max-height: 90%;">
        <!-- Modal Header -->
        <div class="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
            <h2 class="text-lg font-semibold">{{MODAL_TITLE}}</h2>
            <button class="text-white hover:text-gray-200 text-2xl leading-none">&times;</button>
        </div>

        <!-- Modal Body -->
        <div class="p-4">
            <form>
                {{FORM_FIELDS}}
            </form>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 px-4 py-3 rounded-b-lg flex justify-end space-x-2">
            <button class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 font-medium">
                ยกเลิก
            </button>
            <button class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">
                บันทึก
            </button>
        </div>
    </div>
</div>
```

---

## 🗂️ Modal - ยืนยันการลบ (Delete Confirmation)

```html
<!-- Modal Overlay -->
<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center;">
    <!-- Modal Dialog -->
    <div class="bg-white rounded-lg shadow-xl" style="width: 450px;">
        <!-- Modal Header -->
        <div class="bg-red-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
            <h2 class="text-lg font-semibold">ยืนยันการลบข้อมูล</h2>
            <button class="text-white hover:text-gray-200 text-2xl leading-none">&times;</button>
        </div>

        <!-- Modal Body -->
        <div class="p-4 text-center">
            <div class="text-5xl mb-3">⚠️</div>
            <p class="text-gray-800 font-semibold mb-2">คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?</p>
            <p class="text-sm text-gray-600">{{DELETE_MESSAGE}}</p>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 px-4 py-3 rounded-b-lg flex justify-end space-x-2">
            <button class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 font-medium">
                ยกเลิก
            </button>
            <button class="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 font-medium">
                ลบข้อมูล
            </button>
        </div>
    </div>
</div>
```

---

## 📝 Form Fields - Examples

### Text Input
```html
<div class="mb-3">
    <label class="block text-sm font-medium text-gray-700 mb-1">
        {{FIELD_LABEL}} <span class="text-red-500">*</span>
    </label>
    <input type="text" placeholder="{{PLACEHOLDER}}" class="w-full px-3 py-2 text-sm border border-gray-300 rounded">
</div>
```

### Text Input with Error
```html
<div class="mb-3">
    <label class="block text-sm font-medium text-gray-700 mb-1">
        {{FIELD_LABEL}} <span class="text-red-500">*</span>
    </label>
    <input type="text" placeholder="{{PLACEHOLDER}}" class="w-full px-3 py-2 text-sm border border-gray-300 rounded input-error">
    <div class="error-message">{{ERROR_MESSAGE}}</div>
</div>
```

### Select Dropdown
```html
<div class="mb-3">
    <label class="block text-sm font-medium text-gray-700 mb-1">
        {{FIELD_LABEL}} <span class="text-red-500">*</span>
    </label>
    <select class="w-full px-3 py-2 text-sm border border-gray-300 rounded">
        <option value="">เลือก{{FIELD_LABEL}}</option>
        <option value="option1">{{OPTION_1}}</option>
        <option value="option2">{{OPTION_2}}</option>
    </select>
</div>
```

### Textarea
```html
<div class="mb-3">
    <label class="block text-sm font-medium text-gray-700 mb-1">
        {{FIELD_LABEL}}
    </label>
    <textarea rows="3" placeholder="{{PLACEHOLDER}}" class="w-full px-3 py-2 text-sm border border-gray-300 rounded"></textarea>
</div>
```

### Date Input
```html
<div class="mb-3">
    <label class="block text-sm font-medium text-gray-700 mb-1">
        {{FIELD_LABEL}} <span class="text-red-500">*</span>
    </label>
    <input type="date" class="w-full px-3 py-2 text-sm border border-gray-300 rounded">
</div>
```

### Number Input
```html
<div class="mb-3">
    <label class="block text-sm font-medium text-gray-700 mb-1">
        {{FIELD_LABEL}} <span class="text-red-500">*</span>
    </label>
    <input type="number" placeholder="0.00" class="w-full px-3 py-2 text-sm border border-gray-300 rounded">
</div>
```

---

## 📊 Table Examples

### Table Headers
```html
<th class="px-2 py-2 text-left font-semibold text-gray-700">{{COLUMN_NAME}}</th>
```

### Table Row
```html
<tr class="border-b hover:bg-gray-50">
    <td class="px-2 py-2">{{DATA_1}}</td>
    <td class="px-2 py-2">{{DATA_2}}</td>
    <td class="px-2 py-2 text-right">{{NUMERIC_DATA}}</td>
    <td class="px-2 py-2">
        <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">{{STATUS}}</span>
    </td>
    <td class="px-2 py-2 text-center">
        <button class="px-2 py-0.5 text-xs bg-blue-600 text-white rounded mr-1">แก้ไข</button>
        <button class="px-2 py-0.5 text-xs bg-red-600 text-white rounded">ลบ</button>
    </td>
</tr>
```

---

## 🎨 Status Badges

```html
<!-- Success -->
<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">{{STATUS_TEXT}}</span>

<!-- Warning -->
<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">{{STATUS_TEXT}}</span>

<!-- Error -->
<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">{{STATUS_TEXT}}</span>

<!-- Info -->
<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{{STATUS_TEXT}}</span>

<!-- Gray -->
<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{{STATUS_TEXT}}</span>
```

---

## 📌 Placeholders Reference

### Screen Template Placeholders:
- `{{MODULE_TITLE}}` - ชื่อ Module (เช่น "จัดการผู้ใช้งาน")
- `{{SCREEN_NUMBER}}` - หมายเลขหน้าจอ (เช่น "1.1")
- `{{SCREEN_TITLE}}` - ชื่อหน้าจอ (เช่น "หน้าแสดงรายการ")
- `{{WITH_MODAL_CLASS}}` - ` with-modal` ถ้ามี modal, ว่างเปล่าถ้าไม่มี
- `{{BLUR_CLASS}}` - ` content-blur` ถ้ามี modal, ว่างเปล่าถ้าไม่มี
- `{{NAVBAR}}` - HTML ของ Navbar
- `{{SIDEBAR}}` - HTML ของ Sidebar
- `{{CONTENT}}` - HTML ของ Content หลัก
- `{{MODAL}}` - HTML ของ Modal (ว่างเปล่าถ้าไม่มี)

### Content Placeholders:
- `{{PAGE_TITLE}}` - หัวข้อหน้า
- `{{BREADCRUMB}}` - Breadcrumb navigation
- `{{ENTITY_NAME}}` - ชื่อข้อมูลที่จัดการ
- `{{FILTER_OPTION_X}}` - ตัวเลือก Filter
- `{{TABLE_HEADERS}}` - HTML ของ table headers
- `{{TABLE_ROWS}}` - HTML ของ table rows
- `{{MODAL_TITLE}}` - หัวข้อ Modal
- `{{FORM_FIELDS}}` - HTML ของ form fields
- `{{DELETE_MESSAGE}}` - ข้อความยืนยันการลบ
- `{{FIELD_LABEL}}` - Label ของ field
- `{{PLACEHOLDER}}` - Placeholder text
- `{{ERROR_MESSAGE}}` - ข้อความ error
