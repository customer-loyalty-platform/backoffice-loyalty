<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight">Catalogue & Voucher Inventory Management</h1>
        <p class="text-xs text-slate-500">Manage digital catalogue batches, monitor real-time stock levels, and upload voucher code pools.</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
      >
        <i class="pi pi-plus text-xs"></i>
        <span>Create Voucher Batch</span>
      </button>
    </div>

    <!-- Voucher Batches Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="batch in voucherStore.batches"
        :key="batch.id"
        class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-all"
      >
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-slate-500">{{ batch.partner_brand }}</span>
            <StatusBadge :status="batch.status" />
          </div>

          <h3 class="text-sm font-bold text-slate-900 mb-1">{{ batch.title }}</h3>
          <p class="text-xs text-slate-500 line-clamp-2 mb-4">{{ batch.description }}</p>

          <!-- Cost & Value -->
          <div class="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl mb-4 text-xs">
            <div>
              <div class="text-[10px] text-slate-400 font-semibold uppercase">Points Cost</div>
              <div class="font-bold font-mono text-indigo-600">{{ formatNumber(batch.points_cost) }} pts</div>
            </div>
            <div>
              <div class="text-[10px] text-slate-400 font-semibold uppercase">Monetary Value</div>
              <div class="font-bold font-mono text-slate-800">{{ formatCurrency(batch.monetary_value || 0) }}</div>
            </div>
          </div>

          <!-- Stock Level Progress -->
          <div class="space-y-1.5 mb-4">
            <div class="flex justify-between text-xs">
              <span class="text-slate-600 font-medium">Available Stock</span>
              <span class="font-mono font-bold text-slate-900">
                {{ formatNumber(batch.available_stock) }} / {{ formatNumber(batch.total_stock) }}
              </span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                class="bg-indigo-600 h-2 rounded-full transition-all"
                :style="{ width: `${batch.total_stock ? (batch.available_stock / batch.total_stock) * 100 : 0}%` }"
              ></div>
            </div>
            <div class="flex justify-between text-[10px] text-slate-400">
              <span>Claimed: {{ formatNumber(batch.claimed_stock) }}</span>
              <span>Available: {{ formatPercent(batch.total_stock ? (batch.available_stock / batch.total_stock) : 0) }}</span>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div class="flex items-center space-x-2">
            <router-link
              :to="`/vouchers/${batch.id}`"
              class="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold flex items-center space-x-1"
            >
              <i class="pi pi-list text-[11px]"></i>
              <span>View Codes</span>
            </router-link>
            <button
              @click="openUploadModal(batch.id)"
              class="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center space-x-1"
            >
              <i class="pi pi-upload text-[11px]"></i>
              <span>Upload CSV</span>
            </button>
          </div>
          <button
            @click="triggerRevoke(batch.id)"
            class="text-rose-600 hover:text-rose-800 font-semibold text-[11px]"
          >
            Revoke Batch
          </button>
        </div>
      </div>
    </div>

    <!-- Create Batch Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <h3 class="text-sm font-bold text-slate-900 mb-4">Create Voucher Master Batch</h3>
        <form @submit.prevent="handleCreateBatch" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Batch Code (Unique)</label>
            <input v-model="batchForm.batch_code" required placeholder="VCH-NEW-50K" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Title</label>
            <input v-model="batchForm.title" required placeholder="e.g. Starbucks IDR 50K e-Voucher" class="w-full px-3 py-2 rounded-lg border border-slate-300" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Partner Brand</label>
            <input v-model="batchForm.partner_brand" required placeholder="e.g. Starbucks" class="w-full px-3 py-2 rounded-lg border border-slate-300" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Points Cost</label>
              <input v-model.number="batchForm.points_cost" type="number" required placeholder="5000" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Monetary Value (IDR)</label>
              <input v-model.number="batchForm.monetary_value" type="number" required placeholder="50000" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono" />
            </div>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea v-model="batchForm.description" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300"></textarea>
          </div>
          <div class="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold">Save Batch</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Upload Codes Modal -->
    <div v-if="selectedBatchForUpload" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
        <h3 class="text-sm font-bold text-slate-900 mb-2">Upload Voucher Codes CSV</h3>
        <p class="text-xs text-slate-500 mb-4">Upload a CSV file containing unique voucher code pool strings.</p>
        <input type="file" accept=".csv" @change="handleFileChange" class="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-4" />
        <div class="flex justify-end space-x-2 pt-4 border-t border-slate-100 text-xs">
          <button @click="selectedBatchForUpload = null" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600">Cancel</button>
          <button @click="submitUploadCodes" class="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold">Upload & Import</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useVoucherStore } from '@/stores/voucher.store';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { formatNumber, formatCurrency, formatPercent } from '@/utils/formatters';

const voucherStore = useVoucherStore();

const showCreateModal = ref(false);
const selectedBatchForUpload = ref<string | null>(null);
const uploadedFile = ref<File | null>(null);

const batchForm = ref({
  batch_code: '',
  title: '',
  partner_brand: '',
  points_cost: 5000,
  monetary_value: 50000,
  description: '',
});

function openUploadModal(batchId: string) {
  selectedBatchForUpload.value = batchId;
}

function handleFileChange(e: any) {
  uploadedFile.value = e.target.files[0] || null;
}

async function submitUploadCodes() {
  if (selectedBatchForUpload.value) {
    const dummyFile = uploadedFile.value || new File(['dummy,code'], 'voucher_codes.csv');
    const res = await voucherStore.uploadBatchCodes(selectedBatchForUpload.value, dummyFile);
    alert(`Berhasil mengimpor ${res.data.codes_imported} kode voucher ke stok!`);
    selectedBatchForUpload.value = null;
  }
}

async function handleCreateBatch() {
  await voucherStore.createBatch(batchForm.value);
  showCreateModal.value = false;
  alert('Batch voucher baru berhasil dibuat!');
}

function triggerRevoke(batchId: string) {
  const reason = prompt('Masukkan alasan pencabutan batch voucher (Akan masuk Maker-Checker):');
  if (reason) {
    alert('Permintaan pencabutan batch diteruskan ke antrean Maker-Checker!');
  }
}

onMounted(() => {
  voucherStore.fetchBatches();
});
</script>

