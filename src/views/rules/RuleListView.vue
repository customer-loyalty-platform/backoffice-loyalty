<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight">Dynamic Accrual Rule Builder</h1>
        <p class="text-xs text-slate-500">Zero-redeployment earning rules evaluated dynamically by runtime earning engines.</p>
      </div>
      <router-link
        to="/rules/create"
        class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
      >
        <i class="pi pi-plus text-xs"></i>
        <span>Create Rule</span>
      </router-link>
    </div>

    <!-- Rules Grid / List -->
    <div class="space-y-4">
      <div
        v-for="rule in ruleStore.rules"
        :key="rule.id"
        class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-200 transition-all"
      >
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div class="flex items-center space-x-2 mb-1">
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                PRIORITY {{ rule.priority }}
              </span>
              <StatusBadge :status="rule.status" />
              <span class="text-xs font-mono text-slate-400">#{{ rule.rule_code }}</span>
            </div>
            <h3 class="text-sm font-bold text-slate-900">{{ rule.rule_name }}</h3>
          </div>

          <div class="flex items-center space-x-2 text-xs">
            <button
              v-if="rule.status === 'ACTIVE'"
              @click="ruleStore.toggleRuleStatus(rule.id, 'PAUSED')"
              class="px-3 py-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 font-semibold"
            >
              Pause Rule
            </button>
            <button
              v-else-if="rule.status === 'PAUSED' || rule.status === 'DRAFT'"
              @click="ruleStore.toggleRuleStatus(rule.id, 'ACTIVE')"
              class="px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold"
            >
              Activate
            </button>
            <button
              @click="viewJson(rule)"
              class="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              <i class="pi pi-code mr-1"></i> JSON
            </button>
            <button
              @click="deleteRule(rule.id)"
              class="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold"
            >
              Delete
            </button>
          </div>
        </div>

        <!-- Rule Breakdown Preview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
          <!-- Conditions Preview -->
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Conditions (AND Logic)</div>
            <div class="space-y-1">
              <div
                v-for="(cond, idx) in rule.conditions_json.and"
                :key="idx"
                class="text-[11px] font-mono text-slate-700 flex items-center space-x-1"
              >
                <span class="text-indigo-600 font-semibold">{{ cond.field }}</span>
                <span class="text-slate-400">{{ cond.operator }}</span>
                <span class="text-slate-900 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {{ Array.isArray(cond.value) ? cond.value.join(' - ') : cond.value }}
                </span>
              </div>
            </div>
          </div>

          <!-- Action Preview -->
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Evaluated Action</div>
            <div class="text-[11px] font-mono text-slate-700">
              <div class="font-bold text-indigo-600">{{ rule.action_json.type }}</div>
              <div v-if="rule.action_json.multiplier_factor" class="text-slate-800 font-bold mt-1">
                Multiplier: {{ rule.action_json.multiplier_factor }}x
              </div>
              <div v-if="rule.action_json.bonus_points" class="text-emerald-600 font-bold mt-1">
                Bonus Points: +{{ rule.action_json.bonus_points }} pts
              </div>
            </div>
          </div>

          <!-- Validity Period -->
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Validity Window</div>
            <div class="text-[11px] text-slate-600 space-y-1">
              <div>From: <span class="font-mono text-slate-800">{{ formatDate(rule.start_time) }}</span></div>
              <div>To: <span class="font-mono text-slate-800">{{ formatDate(rule.end_time) }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- JSON Viewer Modal -->
    <div v-if="selectedRuleJson" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 class="text-sm font-bold text-slate-900">Rule JSON (schema_backoffice.dynamic_rules)</h3>
          <button @click="selectedRuleJson = null" class="text-slate-400 hover:text-slate-600">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <JsonViewer :data="selectedRuleJson" />
        <div class="flex justify-end pt-4">
          <button @click="selectedRuleJson = null" class="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRuleStore } from '@/stores/rule.store';
import StatusBadge from '@/components/common/StatusBadge.vue';
import JsonViewer from '@/components/common/JsonViewer.vue';
import { formatDate } from '@/utils/formatters';

const ruleStore = useRuleStore();
const selectedRuleJson = ref<any>(null);

function viewJson(rule: any) {
  selectedRuleJson.value = rule;
}

async function deleteRule(id: string) {
  if (confirm('Hapus rule ini?')) {
    await ruleStore.deleteRule(id);
  }
}

onMounted(() => {
  ruleStore.fetchRules();
});
</script>

