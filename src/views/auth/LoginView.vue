<template>
  <div class="bg-white rounded-2xl shadow-xl border border-slate-800/10 p-8">
    <div class="text-center mb-8">
      <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30 mb-4">
        <i class="pi pi-bolt"></i>
      </div>
      <h2 class="text-xl font-bold text-slate-900 tracking-tight">Loyalty Command Center</h2>
      <p class="text-xs text-slate-500 mt-1">Multi-Tenant General Loyalty BackOffice</p>
    </div>

    <!-- Error Alert -->
    <div v-if="authStore.error" class="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
      <i class="pi pi-exclamation-circle text-rose-500"></i>
      <span>{{ authStore.error }}</span>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Username / Email</label>
        <div class="relative">
          <input
            v-model="username"
            type="text"
            required
            placeholder="superadmin"
            class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Password</label>
        <div class="relative">
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••••••"
            class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        :disabled="authStore.isLoading"
        class="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
      >
        <i v-if="authStore.isLoading" class="pi pi-spin pi-spinner text-xs"></i>
        <span>{{ authStore.isLoading ? 'Authenticating...' : 'Sign In to BackOffice' }}</span>
      </button>
    </form>

    <!-- Quick Demo Logins -->
    <div class="mt-8 pt-6 border-t border-slate-100">
      <p class="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wider text-center">Quick Demo Switcher</p>
      <div class="grid grid-cols-2 gap-2 text-[11px]">
        <button
          type="button"
          @click="quickLogin('superadmin')"
          class="p-2 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-700 text-left transition-all"
        >
          <div class="font-semibold text-indigo-700">Super Admin</div>
          <div class="text-[10px] text-slate-600">Full Access</div>
        </button>
        <button
          type="button"
          @click="quickLogin('campaign.lead')"
          class="p-2 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-700 text-left transition-all"
        >
          <div class="font-semibold text-indigo-700">Campaign Lead</div>
          <div class="text-[10px] text-slate-600">Tiers, Rules, Vouchers</div>
        </button>
        <button
          type="button"
          @click="quickLogin('cs.agent')"
          class="p-2 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-700 text-left transition-all"
        >
          <div class="font-semibold text-indigo-700">CS Agent (Maker)</div>
          <div class="text-[10px] text-slate-600">Members, Adjustments</div>
        </button>
        <button
          type="button"
          @click="quickLogin('finance.auditor')"
          class="p-2 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-700 text-left transition-all"
        >
          <div class="font-semibold text-indigo-700">Finance Auditor</div>
          <div class="text-[10px] text-slate-600">Settlement, Audit Logs</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('superadmin');
const password = ref('password123');

async function handleLogin() {
  try {
    await authStore.login({
      username: username.value,
      password: password.value,
    });
    router.push('/');
  } catch {
    // Handled in store
  }
}

function quickLogin(user: string) {
  username.value = user;
  password.value = 'password123';
  handleLogin();
}
</script>

