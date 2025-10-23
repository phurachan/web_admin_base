import { connectDB } from '~/server/utils/mongodb'
import { Feature1 } from '~/server/models/Feature1'
import { parseQuery } from '~/server/utils/queryParser'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const query = getQuery(event)

    const parsedQuery = parseQuery(query, {
      allowedParams: ['pagination', 'filter', 'search', 'sort'],
      allowedFilters: ['type', 'isActive', 'startDate', 'endDate']
    })

    const page = Number(parsedQuery.pagination?.page) || 1
    const limit = Number(parsedQuery.pagination?.limit) || 10
    const skip = (page - 1) * limit

    const filter: any = {}

    if (parsedQuery.filter) {
      if (parsedQuery.filter.type) {
        filter.type = parsedQuery.filter.type
      }
      if (parsedQuery.filter.isActive !== undefined) {
        filter.isActive = parsedQuery.filter.isActive === 'true' || parsedQuery.filter.isActive === true
      }
      if (parsedQuery.filter.startDate) {
        filter.startDate = { $gte: parsedQuery.filter.startDate }
      }
      if (parsedQuery.filter.endDate) {
        filter.endDate = { $lte: parsedQuery.filter.endDate }
      }
    }

    if (parsedQuery.search) {
      const searchRegex = new RegExp(parsedQuery.search as string, 'i')
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { code: isNaN(Number(parsedQuery.search)) ? undefined : Number(parsedQuery.search) }
      ].filter(Boolean)
    }

    const sortOptions: any = {}
    if (parsedQuery.sort) {
      const sortField = parsedQuery.sort.field || 'createdAt'
      const sortOrder = parsedQuery.sort.order === 'asc' ? 1 : -1
      sortOptions[sortField] = sortOrder
    } else {
      sortOptions.createdAt = -1
    }

    const [data, total] = await Promise.all([
      Feature1.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .lean(),
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
