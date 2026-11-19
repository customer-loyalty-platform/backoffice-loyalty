<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <router-link to="/rules" class="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800">
          <i class="pi pi-arrow-left text-xs"></i>
        </router-link>
        <div>
          <h1 class="text-lg font-bold text-slate-900 tracking-tight">Visual Rule Builder</h1>
          <p class="text-xs text-slate-500">Construct zero-redeployment JSON expressions for the earning engine.</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Interactive Form (2 Cols) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Basic Info Box -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 class="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">1. Rule Identification & Priority</h3>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Rule Code (Unique)</label>
              <input v-model="ruleCode" required placeholder="RULE_HOLIDAY_3X" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Evaluation Priority</label>
              <input v-model.number="priority" type="number" min="1" max="100" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono" />
            </div>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Rule Name</label>
            <input v-model="ruleName" required placeholder="Holiday Triple Points Campaign" class="w-full px-3 py-2 rounded-lg border border-slate-300" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Start Date</label>
              <input v-model="startTime" type="datetime-local" class="w-full px-3 py-2 rounded-lg border border-slate-300" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">End Date</label>
              <input v-model="endTime" type="datetime-local" class="w-full px-3 py-2 rounded-lg border border-slate-300" />
            </div>
          </div>
        </div>

        <!-- Dynamic Conditions Box -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-sm font-bold text-slate-900">2. Match Conditions (AND Logic)</h3>
              <p class="text-[11px] text-slate-500">Incoming transaction must fulfill ALL conditions below.</p>
            </div>
            <button
              @click="addCondition"
              class="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold text-xs flex items-center space-x-1"
            >
              <i class="pi pi-plus text-[10px]"></i>
              <span>Add Condition</span>
            </button>
          </div>

          <div class="space-y-2">
            <div
              v-for="(cond, index) in conditions"
              :key="index"
              class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2"
            >
              <!-- Field Picker -->
              <select v-model="cond.field" class="w-full sm:w-1/3 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-xs">
                <option value="transaction.time">transaction.time</option>
                <option value="transaction.category">transaction.category</option>
                <option value="transaction.amount">transaction.amount</option>
                <option value="transaction.channel">transaction.channel</option>
                <option value="member.status">member.status</option>
                <option value="member.tier">member.tier</option>
              </select>

              <!-- Operator Picker -->
              <select v-model="cond.operator" class="w-full sm:w-1/4 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs">
                <option value="EQUALS">EQUALS</option>
                <option value="NOT_EQUALS">NOT EQUALS</option>
                <option value="GREATER_THAN">GREATER THAN</option>
                <option value="BETWEEN">BETWEEN</option>
                <option value="IN">IN</option>
              </select>

              <!-- Value Input -->
              <input
                v-model="cond.value"
                type="text"
                placeholder="Value..."
                class="w-full sm:flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono"
              />

              <!-- Delete Condition -->
              <button
                @click="removeCondition(index)"
                :disabled="conditions.length <= 1"
                class="p-2 text-rose-500 hover:text-rose-700 disabled:opacity-30"
              >
                <i class="pi pi-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Action Box -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 class="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">3. Reward / Multiplier Action</h3>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Action Type</label>
              <select v-model="actionType" class="w-full px-3 py-2 rounded-lg border border-slate-300">
                <option value="APPLY_CAMPAIGN_MULTIPLIER">APPLY_CAMPAIGN_MULTIPLIER</option>
                <option value="APPLY_CATEGORY_MULTIPLIER">APPLY_CATEGORY_MULTIPLIER</option>
                <option value="APPLY_BONUS_POINTS">APPLY_BONUS_POINTS</option>
              </select>
            </div>
            <div v-if="actionType !== 'APPLY_BONUS_POINTS'">
              <label class="block font-semibold text-slate-700 mb-1">Multiplier Factor (e.g. 2.0x)</label>
              <input v-model.number="multiplierFactor" type="number" step="0.1" min="1.1" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono" />
            </div>
            <div v-else>
              <label class="block font-semibold text-slate-700 mb-1">Bonus Points Amount</label>
              <input v-model.number="bonusPoints" type="number" min="10" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono" />
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <router-link to="/rules" class="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </router-link>
          <button
            @click="saveRule"
            class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
          >
            Save & Publish Rule
          </button>
        </div>
      </div>

      <!-- Right: Live JSON Payload Preview -->
      <div class="space-y-4">
        <div class="sticky top-24 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 class="text-xs font-bold text-slate-900 mb-1">Serialized JSON Payload</h3>
          <p class="text-[11px] text-slate-500 mb-3">Live representation of PostgreSQL <code class="font-mono text-indigo-600">conditions_json</code>.</p>
          <JsonViewer :data="previewJson" title="PostgreSQL JSONB Dynamic Rule" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useRuleStore } from '@/stores/rule.store';
import JsonViewer from '@/components/common/JsonViewer.vue';

const router = useRouter();
const ruleStore = useRuleStore();

const ruleCode = ref('RULE_NEW_CAMPAIGN_2026');
const ruleName = ref('Special Season Earning Boost');
const priority = ref(10);
const startTime = ref('2026-11-10T00:00');
const endTime = ref('2026-12-31T23:59');

const conditions = ref([
  { field: 'transaction.category', operator: 'EQUALS', value: 'TRANSIT_OFFPEAK' },
  { field: 'member.status', operator: 'EQUALS', value: 'ACTIVE' },
]);

const actionType = ref<'APPLY_CAMPAIGN_MULTIPLIER' | 'APPLY_CATEGORY_MULTIPLIER' | 'APPLY_BONUS_POINTS'>('APPLY_CAMPAIGN_MULTIPLIER');
const multiplierFactor = ref(2.0);
const bonusPoints = ref(500);

function addCondition() {
  conditions.value.push({ field: 'transaction.amount', operator: 'GREATER_THAN', value: '50000' });
}

function removeCondition(index: number) {
  if (conditions.value.length > 1) {
    conditions.value.splice(index, 1);
  }
}

const previewJson = computed(() => {
  return {
    rule_code: ruleCode.value,
    rule_name: ruleName.value,
    priority: priority.value,
    start_time: new Date(startTime.value).toISOString(),
    end_time: new Date(endTime.value).toISOString(),
    conditions_json: {
      and: conditions.value.map((c) => ({
        field: c.field,
        operator: c.operator,
        value: c.value,
      })),
    },
    action_json: {
      type: actionType.value,
      ...(actionType.value === 'APPLY_BONUS_POINTS' ? { bonus_points: bonusPoints.value } : { multiplier_factor: multiplierFactor.value }),
    },
  };
});

async function saveRule() {
  await ruleStore.saveRule(previewJson.value as any);
  alert('Rule berhasil disimpan ke schema_backoffice.dynamic_rules!');
  router.push('/rules');
}
</script>

