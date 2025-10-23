import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

const MAX_FILE_SIZE = 5 * 1024 * 1024

export default defineEventHandler(async (event) => {
  try {
    const form = await readMultipartFormData(event)

    if (!form || form.length === 0) {
      return {
        success: false,
        message: 'No files uploaded'
      }
    }

    const uploadedFiles: string[] = []
    const errors: string[] = []

    const uploadDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    for (const file of form) {
      if (file.name !== 'files') continue

      if (!file.filename || !file.type || !file.data) {
        errors.push('Invalid file data')
        continue
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.filename}: File type not allowed (${file.type})`)
        continue
      }

      if (file.data.length > MAX_FILE_SIZE) {
        errors.push(`${file.filename}: File size exceeds 5MB limit`)
        continue
      }

      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 8)
      const ext = file.filename.split('.').pop()
      const safeFilename = `${timestamp}_${randomStr}.${ext}`

      const filePath = join(uploadDir, safeFilename)

      await writeFile(filePath, file.data)

      uploadedFiles.push(`/uploads/${safeFilename}`)
    }

    if (uploadedFiles.length === 0 && errors.length > 0) {
      return {
        success: false,
        message: 'Failed to upload files',
        errors
      }
    }

    return {
      success: true,
      data: {
        files: uploadedFiles
      },
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      errors: errors.length > 0 ? errors : undefined
    }

  } catch (error: any) {
    console.error('Upload error:', error)
    return {
      success: false,
      message: error.message || 'Failed to upload files'
    }
  }
})
