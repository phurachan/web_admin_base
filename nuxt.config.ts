// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000
  },
  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  css: ["~/assets/css/main.css"],
  imports: {
    dirs: [
      'composables/**'
    ]
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.includes('calendar-')
    }
  },
  runtimeConfig: {
    public: {
      apiBase: '/api'
    }
  }
})
