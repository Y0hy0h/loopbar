<template>
  <label>
    <slot></slot>
    <input type="number" :value="inputText" @input="newInput($event.target.value)"/>
  </label>
</template>

<script lang="ts">
import { defineComponent, watch, ref, toRefs } from 'vue';

import { timecodeFromSecond } from '../logic/time'

export default defineComponent({
  props: {
    modelValue: {
      type: Number,
      required: true
    }
  },
  emits: [
    'update:modelValue'
  ],
  setup(props) {
    const { modelValue } = toRefs(props);

    const inputText = ref(formatValue(modelValue.value));

    watch(modelValue, (newValue) => {
      const parsed = parseInput(inputText.value);
      if (parsed != null && parsed != newValue) {
        inputText.value = formatValue(newValue);
      }
    });

    return {
      modelValue,
      inputText
    }
  },
  methods: {
    newInput (input: string) {
      this.inputText = input;

      const parsed = parseInput(input);
      if (parsed != null) {
        this.$emit("update:modelValue", parsed);
      }
    }
  }
});

function parseInput (input: string): number | null {
  const parsed = Number.parseFloat(input);
  if (parsed != NaN) {
    return parsed;
  } else {
    return null;
  }
}

function formatValue (value: number): string {
  if (value % 1 == 0) { // if it is a whole number
    return value.toString();
  } else {
    return value.toFixed(2);
  }
}
</script>

<style scoped>
  label {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
</style>