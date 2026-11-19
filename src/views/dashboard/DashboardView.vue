<template>
  <div class="space-y-6">
    <!-- Header Notice -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
      <div>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight">Platform Command Center</h1>
        <p class="text-xs text-slate-500 mt-0.5">Real-time telemetry, circulating liabilities, and double-entry transaction feeds.</p>
      </div>
      <div class="flex items-center space-x-2">
        <button
          @click="dashboardStore.fetchDashboardData"
          class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 transition-colors"
        >
          <i :class="['pi pi-refresh text-xs', dashboardStore.isLoading ? 'pi-spin' : '']"></i>
          <span>Sync Telemetry</span>
        </button>
      </div>
    </div>

    <!-- 4 KPI Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Members Card -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Total Registered Members</span>
          <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
            <i class="pi pi-users"></i>
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-bold text-slate-900">
            {{ formatNumber(dashboardStore.summary?.members.total_registered || 0) }}
          </div>
          <div class="flex items-center mt-1 text-[11px] text-emerald-600">
            <i class="pi pi-arrow-up-right mr-1"></i>
            <span>+{{ dashboardStore.summary?.members.new_today }} new today</span>
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-slate-100 flex justify-between text-[11px] text-slate-400">
          <span>Active 30d: {{ formatNumber(dashboardStore.summary?.members.active_30d || 0) }}</span>
          <span>90d: {{ formatNumber(dashboardStore.summary?.members.active_90d || 0) }}</span>
        </div>
      </div>

      <!-- Circulating Points Card -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Circulating Point Liability</span>
          <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm">
            <i class="pi pi-database"></i>
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-bold text-slate-900">
            {{ formatPoints(dashboardStore.summary?.points.total_circulating || 0) }}
          </div>
          <div class="flex items-center mt-1 text-[11px] text-slate-500">
            <span>Earn: +{{ formatNumber(dashboardStore.summary?.points.earned_today || 0) }}</span>
            <span class="mx-1.5">•</span>
            <span>Burn: -{{ formatNumber(dashboardStore.summary?.points.redeemed_today || 0) }}</span>
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
          <span>Par Liability: {{ formatCurrency((dashboardStore.summary?.points.total_circulating || 0) * 10) }}</span>
        </div>
      </div>

      <!-- Voucher Inventory Card -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Available Voucher Stock</span>
          <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">
            <i class="pi pi-ticket"></i>
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-bold text-slate-900">
            {{ formatNumber(dashboardStore.summary?.vouchers.total_available_stock || 0) }}
          </div>
          <div class="flex items-center mt-1 text-[11px] text-indigo-600">
            <span>{{ dashboardStore.summary?.vouchers.total_active_batches }} Active Batches</span>
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
          <span>Claimed today: {{ dashboardStore.summary?.vouchers.claimed_today }} vouchers</span>
        </div>
      </div>

      <!-- Active Campaigns Card -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Active Missions & Streaks</span>
          <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
            <i class="pi pi-flag"></i>
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-bold text-slate-900">
            {{ dashboardStore.summary?.campaigns.total_active || 0 }}
          </div>
          <div class="flex items-center mt-1 text-[11px] text-emerald-600">
            <span>{{ formatNumber(dashboardStore.summary?.campaigns.total_participants || 0) }} Participants</span>
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
          <span>Completions today: {{ dashboardStore.summary?.campaigns.completions_today }}</span>
        </div>
      </div>
    </div>

    <!-- Charts & Activity Split -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Earning vs Burning Velocity Chart Box -->
      <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-semibold text-slate-900">Points Velocity (7-Day Trend)</h3>
            <p class="text-xs text-slate-500">Daily points accruals vs redemptions (burn rate)</p>
          </div>
          <div class="flex items-center space-x-3 text-xs">
            <span class="flex items-center"><span class="w-3 h-3 rounded-full bg-emerald-500 mr-1.5"></span> Earned</span>
            <span class="flex items-center"><span class="w-3 h-3 rounded-full bg-blue-500 mr-1.5"></span> Redeemed</span>
          </div>
        </div>

        <!-- Custom Simple Bar Visualization -->
        <div class="space-y-3 pt-4">
          <div v-for="point in dashboardStore.earningTrend" :key="point.date" class="space-y-1">
            <div class="flex justify-between text-xs text-slate-600 font-medium">
              <span>{{ point.date }}</span>
              <span class="font-mono text-[11px]">
                +{{ formatNumber(point.total_earned) }} / -{{ formatNumber(point.total_redeemed) }}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-2 h-3.5 bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
              <div class="bg-emerald-500 rounded-full h-full" :style="{ width: `${(point.total_earned / 180000) * 100}%` }"></div>
              <div class="bg-blue-500 rounded-full h-full" :style="{ width: `${(point.total_redeemed / 180000) * 100}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Architecture Rule / Engine Guard Card -->
      <div class="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-slate-800 shadow-xs flex flex-col justify-between">
        <div>
          <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-4">
            <i class="pi pi-shield text-xl"></i>
          </div>
          <h3 class="text-base font-bold text-white mb-2">Zero Calculation Guarantee</h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            BackOffice acts strictly as a configuration hub and monitoring window. Point math and ledger updates are handled exclusively by PostgreSQL atomic ACID transactions and the core microservices (<code class="text-indigo-300 font-mono">earning-engine-service</code> & <code class="text-indigo-300 font-mono">ledger-service</code>).
          </p>
        </div>

        <div class="pt-6 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
          <div class="flex items-center justify-between">
            <span>Partitioning</span>
            <span class="text-emerald-400 font-mono font-medium">Monthly Partitioned</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Voucher Concurrency</span>
            <span class="text-emerald-400 font-mono font-medium">SKIP LOCKED</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Idempotency Key</span>
            <span class="text-emerald-400 font-mono font-medium">Enforced</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Ledger Stream (schema_ledger.point_ledgers) -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="p-5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-slate-900">Live Double-Entry Ledger Stream</h3>
          <p class="text-xs text-slate-500">Append-only transactions recorded across member accounts</p>
        </div>
        <router-link to="/members" class="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
          View All Members →
        </router-link>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th class="px-5 py-3">Timestamp</th>
              <th class="px-5 py-3">Member ID</th>
              <th class="px-5 py-3">Transaction Type</th>
              <th class="px-5 py-3">Amount</th>
              <th class="px-5 py-3">Balance After</th>
              <th class="px-5 py-3">Reference / Order ID</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in dashboardStore.transactionFeed" :key="item.id" class="hover:bg-slate-50/60 transition-colors">
              <td class="px-5 py-3.5 text-slate-500 font-mono">{{ formatDateTime(item.created_at) }}</td>
              <td class="px-5 py-3.5 font-medium text-slate-800">{{ item.member_id }}</td>
              <td class="px-5 py-3.5">
                <StatusBadge :status="item.type" />
              </td>
              <td class="px-5 py-3.5 font-mono font-bold" :class="item.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                {{ item.amount >= 0 ? `+${formatNumber(item.amount)}` : formatNumber(item.amount) }}
              </td>
              <td class="px-5 py-3.5 font-mono text-slate-700">{{ formatNumber(item.balance_after) }}</td>
              <td class="px-5 py-3.5 text-slate-500 font-mono">{{ item.reference_id }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useDashboardStore } from '@/stores/dashboard.store';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { formatNumber, formatPoints, formatCurrency, formatDateTime } from '@/utils/formatters';

const dashboardStore = useDashboardStore();

onMounted(() => {
  dashboardStore.fetchDashboardData();
});
</script>

