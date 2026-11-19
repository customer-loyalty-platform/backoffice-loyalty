<template>
  <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
    <!-- Header Toolbar -->
    <div v-if="$slots.header || title" class="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 v-if="title" class="text-sm font-semibold text-slate-900">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-slate-500 mt-0.5">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.header" class="flex items-center space-x-2">
        <slot name="header" />
      </div>
    </div>

    <!-- Table Container -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <slot />
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="isEmpty" class="py-12 text-center text-slate-400 text-xs">
      <i class="pi pi-inbox text-3xl mb-2 block text-slate-300"></i>
      <span>{{ emptyText || 'No records found.' }}</span>
    </div>

    <!-- Pagination Footer -->
    <div
      v-if="pagination"
      class="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500"
    >
      <div class="flex items-center space-x-2">
        <span>Showing</span>
        <span class="font-bold text-slate-800">{{ pagination.total_items ? (pagination.page - 1) * pagination.limit + 1 : 0 }}</span>
        <span>to</span>
        <span class="font-bold text-slate-800">{{ Math.min(pagination.page * pagination.limit, pagination.total_items) }}</span>
        <span>of</span>
        <span class="font-bold text-slate-800">{{ pagination.total_items }}</span>
        <span>entries</span>
      </div>

      <div class="flex items-center space-x-1">
        <button
          :disabled="pagination.page <= 1"
          @click="$emit('page-change', pagination.page - 1)"
          class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium"
        >
          <i class="pi pi-chevron-left text-[10px]"></i>
        </button>

        <span class="px-3 py-1 font-semibold text-slate-800 text-xs">
          Page {{ pagination.page }} of {{ pagination.total_pages || 1 }}
        </span>

        <button
          :disabled="pagination.page >= pagination.total_pages"
          @click="$emit('page-change', pagination.page + 1)"
          class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium"
        >
          <i class="pi pi-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  subtitle?: string;
  isEmpty?: boolean;
  emptyText?: string;
  pagination?: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}>();

defineEmits<{
  (e: 'page-change', page: number): void;
}>();
</script>

