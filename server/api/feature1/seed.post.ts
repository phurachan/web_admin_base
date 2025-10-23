import { connectDB } from '~/server/utils/mongodb'
import { Feature1 } from '~/server/models/Feature1'
import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const existingCount = await Feature1.countDocuments()
    if (existingCount > 0) {
      return {
        success: false,
        message: 'Features already exist. Use this endpoint only for initial seeding.'
      }
    }

    const adminUser = await User.findOne({ role: 'admin' })
    if (!adminUser) {
      return {
        success: false,
        message: 'Admin user not found. Please create an admin user first.'
      }
    }

    const sampleFeatures = [
      {
        code: 100001,
        title: 'ประกาศข่าวสาร',
        description: 'ประกาศข่าวสารสำคัญของระบบและองค์กร รองรับการแสดงผลหลากหลายรูปแบบ',
        displayMode: 'show_title_desc',
        icon: 'megaphone',
        color: '#3B82F6',
        type: 'announcement',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        images: [],
        isActive: true,
        createdBy: adminUser._id,
        updatedBy: adminUser._id
      },
      {
        code: 100002,
        title: 'โปรโมชั่นพิเศษ',
        description: 'โปรโมชั่นและส่วนลดพิเศษสำหรับสมาชิก พร้อมรูปภาพและข้อมูลครบถ้วน',
        displayMode: 'show_title_icon',
        icon: 'gift',
        color: '#EF4444',
        type: 'promotion',
        startDate: '2025-02-01',
        endDate: '2025-02-28',
        images: [],
        isActive: true,
        createdBy: adminUser._id,
        updatedBy: adminUser._id
      },
      {
        code: 100003,
        title: 'งานกิจกรรมประจำเดือน',
        description: 'กิจกรรมพิเศษสำหรับสมาชิกทุกท่าน จัดขึ้นเป็นประจำทุกเดือน',
        displayMode: 'show_title',
        icon: 'calendar-days',
        color: '#10B981',
        type: 'event',
        startDate: '2025-03-15',
        endDate: '2025-03-15',
        images: [],
        isActive: true,
        createdBy: adminUser._id,
        updatedBy: adminUser._id
      },
      {
        code: 100004,
        title: 'ข่าวสารอัพเดท',
        description: 'ข่าวสารและการอัพเดทฟีเจอร์ใหม่ของระบบ',
        displayMode: 'show_title_desc',
        icon: 'newspaper',
        color: '#F59E0B',
        type: 'news',
        startDate: '2025-01-15',
        endDate: '2025-06-30',
        images: [],
        isActive: true,
        createdBy: adminUser._id,
        updatedBy: adminUser._id
      },
      {
        code: 100005,
        title: 'แจ้งปิดปรับปรุงระบบ',
        description: 'ขออภัยในความไม่สะดวก ระบบจะปิดปรับปรุงเพื่อพัฒนาประสิทธิภาพ',
        displayMode: 'show_title_icon',
        icon: 'wrench-screwdriver',
        color: '#8B5CF6',
        type: 'announcement',
        startDate: '2025-04-01',
        endDate: '2025-04-02',
        images: [],
        isActive: false,
        createdBy: adminUser._id,
        updatedBy: adminUser._id
      }
    ]

    const features = await Feature1.insertMany(sampleFeatures)

    return {
      success: true,
      data: features,
      message: `Seeded ${features.length} features successfully`
    }

  } catch (error: any) {
    console.error('Feature1 seed error:', error)
    return {
      success: false,
      message: error.message || 'Failed to seed features'
    }
  }
})
