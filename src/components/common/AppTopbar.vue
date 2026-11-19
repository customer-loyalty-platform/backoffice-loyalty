<template>
  <header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs sticky top-0 z-20">
    <!-- Breadcrumb / Page Title -->
    <div class="flex items-center space-x-3">
      <h2 class="text-base font-semibold text-slate-800">{{ currentTitle }}</h2>
    </div>

    <!-- Right Controls -->
    <div class="flex items-center space-x-4">
      <!-- Mock Mode Indicator -->
      <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <i class="pi pi-database mr-1 text-[10px]"></i> Mock MSW Active
      </span>

      <div class="h-5 w-px bg-slate-200"></div>

      <!-- User Dropdown / Logout -->
      <div class="flex items-center space-x-3">
        <span class="text-xs text-slate-600 font-medium">{{ authStore.username }}</span>
        <button
          @click="handleLogout"
          class="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
          title="Sign out of Command Center"
        >
          <i class="pi pi-sign-out mr-1.5"></i>
          Logout
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const currentTitle = computed(() => {
  return (route.meta?.title as string) || 'Dashboard';
});

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}
</script>

