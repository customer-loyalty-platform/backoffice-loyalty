<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight">Member & Account Administration</h1>
        <p class="text-xs text-slate-500">Manage customer accounts, inspect real-time ledgers, and trigger adjustment requests.</p>
      </div>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
      <div class="w-full sm:w-96 relative">
        <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Search by name, phone, email, or account number..."
          class="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
        />
      </div>

      <div class="flex items-center space-x-2 w-full sm:w-auto">
        <select
          v-model="statusFilter"
          @change="handleSearch"
          class="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
          <option value="DORMANT">DORMANT</option>
        </select>

        <button
          @click="resetFilters"
          class="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Members Table -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th class="px-5 py-3.5">Account & Member</th>
              <th class="px-5 py-3.5">Contact</th>
              <th class="px-5 py-3.5">Current Tier</th>
              <th class="px-5 py-3.5">Total Balance</th>
              <th class="px-5 py-3.5">Locked / Expiring</th>
              <th class="px-5 py-3.5">Status</th>
              <th class="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="member in memberStore.members" :key="member.id" class="hover:bg-slate-50/60 transition-colors">
              <td class="px-5 py-3.5">
                <router-link :to="`/members/${member.id}`" class="font-bold text-indigo-600 hover:text-indigo-800">
                  {{ member.full_name }}
                </router-link>
                <div class="text-[11px] font-mono text-slate-400 mt-0.5">{{ member.account_number }}</div>
              </td>
              <td class="px-5 py-3.5 text-slate-600">
                <div>{{ member.phone }}</div>
                <div class="text-slate-400 text-[11px]">{{ member.email }}</div>
              </td>
              <td class="px-5 py-3.5">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                  <i class="pi pi-trophy mr-1 text-amber-500"></i>
                  {{ member.current_tier.tier_name }}
                </span>
              </td>
              <td class="px-5 py-3.5 font-mono font-bold text-slate-900">
                {{ formatNumber(member.balance.total_points) }} pts
              </td>
              <td class="px-5 py-3.5 text-slate-500 text-[11px]">
                <div>Locked: {{ formatNumber(member.balance.locked_points) }}</div>
                <div class="text-amber-600">Exp: {{ formatNumber(member.balance.expiring_points) }}</div>
              </td>
              <td class="px-5 py-3.5">
                <StatusBadge :status="member.status" />
              </td>
              <td class="px-5 py-3.5 text-right space-x-2">
                <router-link
                  :to="`/members/${member.id}`"
                  class="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold transition-colors inline-block"
                >
                  Detail & Ledger
                </router-link>
                <button
                  v-if="member.status === 'ACTIVE'"
                  @click="toggleStatus(member.id, 'SUSPENDED')"
                  class="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold transition-colors"
                >
                  Suspend
                </button>
                <button
                  v-else
                  @click="toggleStatus(member.id, 'ACTIVE')"
                  class="px-2.5 py-1.5 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 text-[11px] font-semibold transition-colors"
                >
                  Activate
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMemberStore } from '@/stores/member.store';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { formatNumber } from '@/utils/formatters';

const memberStore = useMemberStore();
const searchQuery = ref('');
const statusFilter = ref('');

function handleSearch() {
  memberStore.fetchMembers({
    search: searchQuery.value,
    status: statusFilter.value as any,
  });
}

function resetFilters() {
  searchQuery.value = '';
  statusFilter.value = '';
  memberStore.fetchMembers();
}

async function toggleStatus(id: string, newStatus: string) {
  const reason = prompt(`Alasan perubahan status menjadi ${newStatus}:`, 'Security review');
  if (reason) {
    await memberStore.updateStatus(id, newStatus, reason);
  }
}

onMounted(() => {
  memberStore.fetchMembers();
});
</script>

