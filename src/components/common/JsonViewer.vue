<template>
  <div class="relative bg-slate-900 text-slate-200 rounded-lg p-3 font-mono text-xs overflow-x-auto border border-slate-800">
    <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
      <span>{{ title || 'JSON Payload (PostgreSQL JSONB)' }}</span>
      <button
        @click="copyToClipboard"
        class="text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <pre class="leading-relaxed whitespace-pre-wrap">{{ formattedJson }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  data: any;
  title?: string;
}>();

const copied = ref(false);

const formattedJson = computed(() => {
  try {
    return JSON.stringify(props.data, null, 2);
  } catch {
    return String(props.data);
  }
});

function copyToClipboard() {
  navigator.clipboard.writeText(formattedJson.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
</script>

