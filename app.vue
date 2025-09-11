<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    
    <!-- Global Loading Component -->
    <BaseLoading 
      :visible="isLoadingActive"
      :message="loadingMessage"
      v-bind="loadingConfig"
    />
  </div>
</template>

<script setup>
const { isActive: isLoadingActive, getMessage: loadingMessage, getConfig: loadingConfig } = useLoading()
</script>
