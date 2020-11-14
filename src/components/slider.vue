<template>
        <input
          type="range"
          :value="modelValue"
          @input="newSliderInput($event.target.value)"
          :min="min"
          :max="max"
          :step="step"
        />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    modelValue: {
      type: Number,
      required: true
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    step: {
      type: Number,
      default: 1
    }
  },
  emits: ['update:modelValue'],
  methods: {
    newSliderInput (input: string) {
      const parsed = parseInput(input)
      if (parsed != null) {
        this.$emit('update:modelValue', parsed)
      }
    }
  }
})

function parseInput (input: string): number | null {
  const parsed = Number.parseFloat(input)
  if (!isNaN(parsed)) {
    return parsed
  } else {
    return null
  }
}
</script>

<style scoped lang="scss">
</style>
