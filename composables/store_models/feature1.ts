import type { Feature1 } from '~/composables/data_models/feature1'
import type { BaseState } from '~/composables/store_models/base'

export interface Feature1State extends BaseState {
  items: Feature1[]
}
