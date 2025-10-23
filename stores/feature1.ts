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
    getFeature1ById: (state) => (id: string) => state.list?.find((item: any) => item._id === id),
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

    async fetchFeature1ById(requestData: BaseRequestData<{ id: string }>) {
      try {
        this.$patch(loadingState(requestData))

        const { get } = useApi()
        const response = await get(`/feature1/${requestData.body!.id}`)

        this.$patch(successState(response))
        this.current = { ...(response?.data || {}) }

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
    },

    async updateFeature1(requestData: BaseRequestData<Feature1UpdateRequest & { id: string }>) {
      try {
        this.$patch(loadingState(requestData))

        const { put } = useApi()
        const response = await put(`/feature1/${requestData.body!.id}`, requestData.body)

        this.$patch(successState(response))
        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    async deleteFeature1(requestData: BaseRequestData<{ id: string }>) {
      try {
        this.$patch(loadingState(requestData))

        const { delete: del } = useApi()
        const response = await del(`/feature1/${requestData.body!.id}`)

        this.$patch(successState(response))
        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    async seedFeature1() {
      try {
        this.isLoading = true

        const { post } = useApi()
        const response = await post('/feature1/seed')

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
