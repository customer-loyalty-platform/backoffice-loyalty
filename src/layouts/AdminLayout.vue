<template>
  <div class="flex h-screen w-screen overflow-hidden bg-slate-50">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Topbar -->
      <AppTopbar />

      <!-- Scrollable Main View -->
      <main class="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
        <div class="max-w-7xl mx-auto">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '@/components/common/AppSidebar.vue';
import AppTopbar from '@/components/common/AppTopbar.vue';
</script>

