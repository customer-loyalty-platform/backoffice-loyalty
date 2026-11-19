<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight">Admin User RBAC Management</h1>
        <p class="text-xs text-slate-500">Manage administrator accounts, assign role permissions, and control backoffice access.</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex items-center space-x-1.5 self-start sm:self-auto"
      >
        <i class="pi pi-user-plus text-xs"></i>
        <span>Create Admin User</span>
      </button>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th class="px-5 py-3.5">Username</th>
              <th class="px-5 py-3.5">Email</th>
              <th class="px-5 py-3.5">Assigned Role</th>
              <th class="px-5 py-3.5">Account Status</th>
              <th class="px-5 py-3.5">Created At</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="user in approvalStore.adminUsers" :key="user.id" class="hover:bg-slate-50/60">
              <td class="px-5 py-3.5 font-bold text-slate-900">{{ user.username }}</td>
              <td class="px-5 py-3.5 text-slate-600">{{ user.email }}</td>
              <td class="px-5 py-3.5">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-5 py-3.5">
                <StatusBadge :status="user.status" />
              </td>
              <td class="px-5 py-3.5 text-slate-500 font-mono">{{ formatDate(user.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create User Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <h3 class="text-sm font-bold text-slate-900 mb-4">Register New Administrator</h3>
        <form @submit.prevent="handleCreateUser" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Username</label>
            <input v-model="userForm.username" required placeholder="e.g. ops.supervisor" class="w-full px-3 py-2 rounded-lg border border-slate-300" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Email</label>
            <input v-model="userForm.email" type="email" required placeholder="user@loyalty.internal" class="w-full px-3 py-2 rounded-lg border border-slate-300" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Password</label>
            <input v-model="userForm.password" type="password" required placeholder="••••••••••••" class="w-full px-3 py-2 rounded-lg border border-slate-300" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Administrative Role (RBAC Scope)</label>
            <select v-model="userForm.role" class="w-full px-3 py-2 rounded-lg border border-slate-300">
              <option value="SUPER_ADMIN">SUPER_ADMIN (Full Platform Authority)</option>
              <option value="CAMPAIGN_SPEC">CAMPAIGN_SPEC (Tiers, Rules, Vouchers, Missions)</option>
              <option value="OPS_CS">OPS_CS (Member Management, Adjustments)</option>
              <option value="FINANCE">FINANCE (Coalition Settlement, Audit Logs)</option>
            </select>
          </div>
          <div class="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold">Create Account</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApprovalStore } from '@/stores/approval.store';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { formatDate } from '@/utils/formatters';

const approvalStore = useApprovalStore();
const showCreateModal = ref(false);

const userForm = ref({
  username: '',
  email: '',
  password: 'password123',
  role: 'OPS_CS' as const,
});

async function handleCreateUser() {
  await approvalStore.createAdminUser(userForm.value);
  showCreateModal.value = false;
  alert('Admin user berhasil didaftarkan!');
}

onMounted(() => {
  approvalStore.fetchAdminUsers();
});
</script>

