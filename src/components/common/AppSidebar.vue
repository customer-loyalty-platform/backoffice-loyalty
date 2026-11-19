<template>
  <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800 select-none">
    <!-- Brand / Header -->
    <div class="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/40">
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
          <i class="pi pi-bolt text-lg"></i>
        </div>
        <div>
          <h1 class="text-sm font-bold text-white tracking-wide">LOYALTY OPS</h1>
          <p class="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Command Center</p>
        </div>
      </div>
    </div>

    <!-- User Profile Strip -->
    <div class="px-5 py-4 border-b border-slate-800/80 bg-slate-950/20">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-indigo-300 uppercase">
          {{ authStore.username?.slice(0, 2) || 'AD' }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-white truncate">{{ authStore.username }}</p>
          <span class="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 uppercase">
            {{ authStore.userRole?.replace('_', ' ') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <router-link
        v-for="item in visibleNavItems"
        :key="item.to"
        :to="item.to"
        v-slot="{ isActive, href, navigate }"
        custom
      >
        <a
          :href="href"
          @click="navigate"
          :class="[
            'flex items-center px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group',
            isActive
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          ]"
        >
          <i :class="[item.iconClass, 'mr-3 text-sm transition-transform group-hover:scale-110']"></i>
          <span>{{ item.label }}</span>
        </a>
      </router-link>
    </nav>

    <!-- Footer System Status -->
    <div class="p-4 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40">
      <div class="flex items-center justify-between">
        <span class="flex items-center">
          <span class="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
          Ledger Engine SSOT
        </span>
        <span class="text-[10px] font-mono text-slate-400">v1.0.0</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();

const navList = [
  { label: 'Dashboard', to: '/', iconClass: 'pi pi-chart-bar', permission: 'dashboard' },
  { label: 'Members & Balance', to: '/members', iconClass: 'pi pi-users', permission: 'members:read' },
  { label: 'Tier & Multiplier', to: '/tiers', iconClass: 'pi pi-trophy', permission: 'tiers:read' },
  { label: 'Earning Rules', to: '/rules', iconClass: 'pi pi-sliders-h', permission: 'rules:read' },
  { label: 'Vouchers & Inventory', to: '/vouchers', iconClass: 'pi pi-ticket', permission: 'vouchers:read' },
  { label: 'Campaigns & Missions', to: '/campaigns', iconClass: 'pi pi-flag', permission: 'campaigns:read' },
  { label: 'Partner Coalition', to: '/partners', iconClass: 'pi pi-briefcase', permission: 'partners:read' },
  { label: 'Clearing & Settlement', to: '/partners/settlement', iconClass: 'pi pi-dollar', permission: 'settlement:read' },
  { label: 'Approvals (Maker-Checker)', to: '/approvals', iconClass: 'pi pi-check-circle', permission: 'approvals' },
  { label: 'Audit Trail Logs', to: '/audit-logs', iconClass: 'pi pi-book', permission: 'audit-logs:read' },
  { label: 'Admin RBAC Users', to: '/settings/users', iconClass: 'pi pi-shield', permission: 'admin-users' },
];

const visibleNavItems = computed(() => {
  return navList.filter((item) => authStore.hasPermission(item.permission));
});
</script>

