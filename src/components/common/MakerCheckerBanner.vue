<template>
  <div class="rounded-xl border border-amber-200 bg-amber-50/70 p-4 mb-6 text-amber-900 shadow-xs flex items-start space-x-3">
    <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700 mt-0.5">
      <i class="pi pi-shield text-base"></i>
    </div>
    <div class="flex-1 text-xs">
      <h4 class="font-semibold text-amber-950 mb-0.5">{{ title || 'Maker-Checker Dual Control Enforced' }}</h4>
      <p class="text-amber-800 leading-relaxed">
        {{ message || 'Perubahan sensitif seperti penyesuaian saldo poin, perubahan valuasi, atau pencabutan voucher akan disimpan ke dalam antrean persetujuan (Pending Approval) dan membutuhkan otorisasi dari Checker sebelum dieksekusi ke Core Ledger.' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  message?: string;
}>();
</script>

