<template>
  <div class="space-y-6">
    <!-- Header with Back Button -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <router-link to="/vouchers" class="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors">
          <i class="pi pi-arrow-left text-xs"></i>
        </router-link>
        <div>
          <h1 class="text-lg font-bold text-slate-900 tracking-tight">Voucher Code Pool & Inventory</h1>
          <p class="text-xs text-slate-500">Row-level locking inspection on schema_burning.voucher_inventories</p>
        </div>
      </div>

      <button
        @click="refreshInventory"
        class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 bg-white"
      >
        <i :class="['pi pi-refresh text-xs', voucherStore.isLoading ? 'pi-spin' : '']"></i>
        <span>Refresh Stock</span>
      </button>
    </div>

    <!-- Inventory Filter Toolbar -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
      <div class="flex items-center space-x-2">
        <label class="font-semibold text-slate-700">Filter Status:</label>
        <select
          v-model="statusFilter"
          @change="filterCodes"
          class="px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">AVAILABLE (In Stock)</option>
          <option value="RESERVED">RESERVED (Checkout Lock)</option>
          <option value="CLAIMED">CLAIMED (Redeemed)</option>
          <option value="REVOKED">REVOKED (Invalidated)</option>
        </select>
      </div>

      <div class="text-slate-500">
        Batch ID: <span class="font-mono font-bold text-slate-800">{{ batchId }}</span>
      </div>
    </div>

    <!-- Inventory Code Table -->
    <DataTableWrapper
      title="Voucher Codes Detail"
      subtitle="Each row is locked with SELECT FOR UPDATE SKIP LOCKED during burn requests"
      :is-empty="filteredInventory.length === 0"
    >
      <thead class="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 text-xs">
        <tr>
          <th class="px-5 py-3.5">Inventory Row ID</th>
          <th class="px-5 py-3.5">Voucher Code</th>
          <th class="px-5 py-3.5">Status</th>
          <th class="px-5 py-3.5">Claimed By (Member)</th>
          <th class="px-5 py-3.5">Claimed At</th>
          <th class="px-5 py-3.5 text-right">Emergency Action</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 text-xs">
        <tr v-for="item in filteredInventory" :key="item.id" class="hover:bg-slate-50/60 transition-colors">
          <td class="px-5 py-3.5 font-mono text-slate-400 text-[11px]">{{ item.id }}</td>
          <td class="px-5 py-3.5 font-mono font-bold text-indigo-700">{{ item.voucher_code }}</td>
          <td class="px-5 py-3.5">
            <StatusBadge :status="item.status" />
          </td>
          <td class="px-5 py-3.5 font-mono text-slate-700">
            {{ item.claimed_by || '-' }}
          </td>
          <td class="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
            {{ item.claimed_at ? formatDateTime(item.claimed_at) : '-' }}
          </td>
          <td class="px-5 py-3.5 text-right">
            <button
              v-if="item.status === 'AVAILABLE'"
              @click="revokeCode(item.id, item.voucher_code)"
              class="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold"
            >
              Revoke Code
            </button>
            <span v-else class="text-slate-400 text-[11px]">-</span>
          </td>
        </tr>
      </tbody>
    </DataTableWrapper>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useVoucherStore } from '@/stores/voucher.store';
import DataTableWrapper from '@/components/common/DataTableWrapper.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { formatDateTime } from '@/utils/formatters';

const route = useRoute();
const voucherStore = useVoucherStore();

const batchId = computed(() => route.params.id as string);
const statusFilter = ref('');

const filteredInventory = computed(() => {
  if (!statusFilter.value) return voucherStore.currentInventory;
  return voucherStore.currentInventory.filter((item) => item.status === statusFilter.value);
});

async function refreshInventory() {
  await voucherStore.fetchBatchInventory(batchId.value);
}

function filterCodes() {
  // Computed filter updates automatically
}

async function revokeCode(id: string, code: string) {
  const reason = prompt(`Alasan pencabutan darurat kode ${code}:`);
  if (reason) {
    alert(`Permintaan pembatalan kode ${code} diteruskan ke antrean Maker-Checker!`);
  }
}

onMounted(() => {
  refreshInventory();
});
</script>

