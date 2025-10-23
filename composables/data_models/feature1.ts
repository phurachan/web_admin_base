export interface Feature1 {
  _id: string
  code: number
  title: string
  description: string
  displayMode: string
  icon: string
  color: string
  type: string
  startDate: string
  endDate: string
  images: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy?: {
    _id: string
    name: string
    email: string
  }
  updatedBy?: {
    _id: string
    name: string
    email: string
  }
}

export interface Feature1CreateRequest {
  title: string
  description: string
  displayMode: string
  icon: string
  color: string
  type: string
  startDate: string
  endDate: string
  images?: string[]
  isActive?: boolean
}

export interface Feature1UpdateRequest {
  title?: string
  description?: string
  displayMode?: string
  icon?: string
  color?: string
  type?: string
  startDate?: string
  endDate?: string
  images?: string[]
  isActive?: boolean
}

export const FEATURE1_TYPES = [
  { label: 'ประกาศ', value: 'announcement' },
  { label: 'โปรโมชั่น', value: 'promotion' },
  { label: 'กิจกรรม', value: 'event' },
  { label: 'ข่าวสาร', value: 'news' }
] as const

export const FEATURE1_DISPLAY_MODES = [
  { label: 'แสดงเฉพาะชื่อ', value: 'show_title' },
  { label: 'แสดงชื่อและรายละเอียด', value: 'show_title_desc' },
  { label: 'แสดงชื่อและไอคอน', value: 'show_title_icon' }
] as const
