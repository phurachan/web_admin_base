/**
 * Global formatters plugin
 * Makes formatting functions available globally as $formatDate and $formatNumber
 */

import { useFormatDate } from '~/composables/utilities/useFormatDate'
import { useFormatNumber } from '~/composables/utilities/useFormatNumber'

export default defineNuxtPlugin(() => {
  const formatDate = useFormatDate()
  const formatNumber = useFormatNumber()

  return {
    provide: {
      formatDate: {
        // Date formatting functions
        dateToThai: formatDate.dateToThai,
        dateFromThai: formatDate.dateFromThai,
        getCurrentThaiDate: formatDate.getCurrentThaiDate,
        isValidThaiDate: formatDate.isValidThaiDate,
        buddhistToGregorian: formatDate.buddhistToGregorian,
        gregorianToBuddhist: formatDate.gregorianToBuddhist
      },
      formatNumber: {
        // Number formatting functions
        numberToThai: formatNumber.numberToThai,
        numberFromThai: formatNumber.numberFromThai,
        formatNumber: formatNumber.formatNumber,
        formatWithCommas: formatNumber.formatWithCommas,
        formatCurrency: formatNumber.formatCurrency,
        formatPercentage: formatNumber.formatPercentage,
        formatFileSize: formatNumber.formatFileSize,
        formatOrdinal: formatNumber.formatOrdinal,
        parseFormattedNumber: formatNumber.parseFormattedNumber,
        hasThaiDigits: formatNumber.hasThaiDigits,
        hasArabicDigits: formatNumber.hasArabicDigits
      }
    }
  }
})

// Type declarations for global properties
declare module '#app' {
  interface NuxtApp {
    $formatDate: {
      dateToThai: (date: Date | string | null, options?: import('~/composables/utilities/useFormatDate').DateFormatOptions) => string
      dateFromThai: (thaiDateString: string) => Date | null
      getCurrentThaiDate: (options?: import('~/composables/utilities/useFormatDate').DateFormatOptions) => string
      isValidThaiDate: (dateString: string) => boolean
      buddhistToGregorian: (buddhistYear: number) => number
      gregorianToBuddhist: (gregorianYear: number) => number
    }
    $formatNumber: {
      numberToThai: (input: number | string) => string
      numberFromThai: (thaiNumber: string) => string
      formatNumber: (num: number | string, options?: import('~/composables/utilities/useFormatNumber').NumberFormatOptions) => string
      formatWithCommas: (input: number | string, decimalPlaces?: number, useThaiDigits?: boolean) => string
      formatCurrency: (amount: number | string, options?: Omit<import('~/composables/utilities/useFormatNumber').NumberFormatOptions, 'currency'>) => string
      formatPercentage: (value: number, isDecimal?: boolean, options?: import('~/composables/utilities/useFormatNumber').NumberFormatOptions) => string
      formatFileSize: (bytes: number, useThaiDigits?: boolean) => string
      formatOrdinal: (num: number, useThaiDigits?: boolean) => string
      parseFormattedNumber: (formattedNumber: string) => number
      hasThaiDigits: (str: string) => boolean
      hasArabicDigits: (str: string) => boolean
    }
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $formatDate: {
      dateToThai: (date: Date | string | null, options?: import('~/composables/utilities/useFormatDate').DateFormatOptions) => string
      dateFromThai: (thaiDateString: string) => Date | null
      getCurrentThaiDate: (options?: import('~/composables/utilities/useFormatDate').DateFormatOptions) => string
      isValidThaiDate: (dateString: string) => boolean
      buddhistToGregorian: (buddhistYear: number) => number
      gregorianToBuddhist: (gregorianYear: number) => number
    }
    $formatNumber: {
      numberToThai: (input: number | string) => string
      numberFromThai: (thaiNumber: string) => string
      formatNumber: (num: number | string, options?: import('~/composables/utilities/useFormatNumber').NumberFormatOptions) => string
      formatWithCommas: (input: number | string, decimalPlaces?: number, useThaiDigits?: boolean) => string
      formatCurrency: (amount: number | string, options?: Omit<import('~/composables/utilities/useFormatNumber').NumberFormatOptions, 'currency'>) => string
      formatPercentage: (value: number, isDecimal?: boolean, options?: import('~/composables/utilities/useFormatNumber').NumberFormatOptions) => string
      formatFileSize: (bytes: number, useThaiDigits?: boolean) => string
      formatOrdinal: (num: number, useThaiDigits?: boolean) => string
      parseFormattedNumber: (formattedNumber: string) => number
      hasThaiDigits: (str: string) => boolean
      hasArabicDigits: (str: string) => boolean
    }
  }
}